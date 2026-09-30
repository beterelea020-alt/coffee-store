-- v9: شغّله مرة واحدة في SQL Editor لو قاعدتك شغالة بالفعل (بعد migration-v8.sql).
-- كوبونات: مدة الصلاحية 30 يوم بالكتير (السيرفر بيفرضها، مش بس الواجهة)
update public.coupons set starts_at=coalesce(starts_at,created_at,now()) where starts_at is null;
update public.coupons set ends_at=starts_at+interval '30 days' where ends_at is null or ends_at::date-starts_at::date>30;
create or replace function public.coupon_30d() returns trigger language plpgsql as $$
begin
  new.starts_at:=coalesce(new.starts_at,now());
  new.ends_at:=coalesce(new.ends_at,new.starts_at+interval '30 days');
  if new.ends_at<=new.starts_at then raise exception 'COUPON_DATES_INVALID'; end if;
  if new.ends_at::date-new.starts_at::date>30 then raise exception 'COUPON_MAX_30_DAYS'; end if;
  return new;
end $$;
drop trigger if exists coupons_30d on public.coupons;
create trigger coupons_30d before insert or update on public.coupons for each row execute function public.coupon_30d();

-- صور إثبات الدفع: الأدمن فقط يشوفها (العميل يرفع بس)
drop policy if exists proofs_read on storage.objects;
create policy proofs_read on storage.objects for select to authenticated using (bucket_id='payment-proofs' and public.is_admin());

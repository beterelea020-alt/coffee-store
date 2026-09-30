-- ============================================================
-- RAW Coffee — Supabase schema. شغّله مرة واحدة في SQL Editor (قبل seed.sql)
-- ============================================================
create extension if not exists pgcrypto;

-- ---------- Profiles & roles ----------
create table public.profiles(
  id uuid primary key references auth.users on delete cascade,
  full_name text, phone text unique, email text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now());

create function public.is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name,phone,email) values(
    new.id, coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name'),
    nullif(new.raw_user_meta_data->>'phone',''),
    case when new.email like '%.local' then null else new.email end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- العميل مايقدرش يرقّي نفسه أدمن (تغيير الدور مسموح للأدمن أو من SQL Editor فقط)
create function public.guard_role() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'FORBIDDEN_ROLE_CHANGE'; end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles for each row execute function public.guard_role();

-- ---------- Catalog ----------
create table public.categories(id text primary key, name_ar text not null, name_en text, image_url text, sort int default 0, is_active boolean default true);
create table public.products(
  id bigint generated always as identity primary key,
  category_id text references public.categories, name_ar text not null, name_en text,
  desc_ar text, desc_en text, image_url text, badge_ar text, badge_en text,
  roast text, roasts text[] default '{}', taste text, brew text,
  is_active boolean not null default true, created_at timestamptz default now());
create table public.product_variants(
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products on delete cascade,
  label text not null, weight_g int,
  price numeric(10,2) not null check (price>=0), old_price numeric(10,2),
  stock int not null default 0 check (stock>=0),
  is_active boolean not null default true, sort int default 0);
create index on public.product_variants(product_id);

-- ---------- Store config (all editable from admin) ----------
create table public.shipping_zones(id bigint generated always as identity primary key, governorate text unique not null, price numeric(10,2) not null check (price>=0), is_active boolean default true);
create table public.payment_methods(id text primary key, name_ar text not null, name_en text, instructions_ar text, account_details text, requires_proof boolean not null default true, fee numeric(10,2) not null default 0 check (fee>=0), is_active boolean default true, sort int default 0);
create table public.order_statuses(code text primary key, label_ar text not null, label_en text, sort int default 0);
create table public.store_settings(key text primary key, value jsonb not null);
create table public.coupons(
  code text primary key check (code=upper(code)),
  kind text not null check (kind in ('percent','fixed','shipping')),
  value numeric(10,2) not null default 0, max_discount numeric(10,2),
  min_subtotal numeric(10,2) not null default 0,
  starts_at timestamptz, ends_at timestamptz,
  max_uses int, used_count int not null default 0, per_user_limit int not null default 1,
  is_active boolean not null default true, created_at timestamptz default now());

-- ---------- Orders ----------
create table public.orders(
  id bigint generated always as identity primary key,
  order_no text unique not null default ('RAW-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  user_id uuid not null references public.profiles,
  status text not null default 'new' references public.order_statuses,
  payment_method text references public.payment_methods,
  payment_status text not null default 'pending' check (payment_status in ('pending','under_review','confirmed','rejected')),
  payment_proof_path text,
  customer_name text, customer_phone text, governorate text, address text, notes text, delivery_time text,
  subtotal numeric(10,2) not null default 0, discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0, payment_fee numeric(10,2) not null default 0, total numeric(10,2) not null default 0,
  coupon_code text, created_at timestamptz default now(), updated_at timestamptz default now());
create index on public.orders(user_id);
create table public.order_items(
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders on delete cascade,
  product_id bigint, variant_id bigint, name text not null, variant_label text,
  unit_price numeric(10,2) not null, qty int not null check (qty>0), options jsonb default '{}');   -- unit_price = السعر وقت الطلب
create index on public.order_items(order_id);
create table public.coupon_redemptions(
  id bigint generated always as identity primary key,
  coupon_code text not null references public.coupons, order_id bigint not null unique references public.orders,
  user_id uuid not null references public.profiles, discount numeric(10,2) not null, created_at timestamptz default now());

create function public.touch_order() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create trigger orders_touch before update on public.orders for each row execute function public.touch_order();

create function public.restore_stock_on_cancel() returns trigger language plpgsql security definer set search_path=public as $$
begin
  update product_variants v set stock=v.stock+i.qty from order_items i where i.order_id=new.id and v.id=i.variant_id;
  return new;
end $$;
create trigger orders_cancel after update of status on public.orders for each row
  when (new.status='cancelled' and old.status<>'cancelled') execute function public.restore_stock_on_cancel();

-- ---------- Coupon validation (الأكواد نفسها مخفية؛ الفحص عبر الدالة فقط) ----------
create function public.validate_coupon(p_code text, p_subtotal numeric, p_shipping numeric default 0) returns jsonb
language plpgsql security definer set search_path=public as $$
declare c coupons; d numeric:=0; ship numeric:=p_shipping;
begin
  select * into c from coupons where code=upper(trim(p_code));
  if not found or not c.is_active then return jsonb_build_object('ok',false,'error','invalid'); end if;
  if c.starts_at is not null and now()<c.starts_at then return jsonb_build_object('ok',false,'error','not_started'); end if;
  if c.ends_at is not null and now()>c.ends_at then return jsonb_build_object('ok',false,'error','expired'); end if;
  if c.max_uses is not null and c.used_count>=c.max_uses then return jsonb_build_object('ok',false,'error','exhausted'); end if;
  if p_subtotal<c.min_subtotal then return jsonb_build_object('ok',false,'error','min_subtotal','min',c.min_subtotal); end if;
  if c.kind='percent' then d:=round(p_subtotal*c.value/100,2); if c.max_discount is not null then d:=least(d,c.max_discount); end if;
  elsif c.kind='fixed' then d:=least(c.value,p_subtotal);
  else ship:=0; end if;
  return jsonb_build_object('ok',true,'code',c.code,'kind',c.kind,'discount',d,'shipping',ship);
end $$;

-- ---------- create_order: كل الحسابات على السيرفر (لا ثقة في أسعار المتصفح) ----------
-- p = {items:[{variant_id,qty,options:{roast,grind}}], payment_method, proof_path, coupon,
--      name, phone, governorate, address, notes, delivery_time}
create function public.create_order(p jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); it jsonb; v product_variants; pr products; pm payment_methods;
  sub numeric:=0; disc numeric:=0; ship numeric; thr numeric; cp jsonb; ccode text:=nullif(upper(trim(coalesce(p->>'coupon',''))),'');
  proof text:=nullif(p->>'proof_path',''); q int; oid bigint; ono text; free_ship boolean:=false; used int;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if jsonb_typeof(p->'items')<>'array' or jsonb_array_length(p->'items')=0 then raise exception 'EMPTY_CART'; end if;
  select * into pm from payment_methods where id=p->>'payment_method' and is_active;
  if not found then raise exception 'BAD_PAYMENT'; end if;
  if pm.requires_proof and (proof is null or proof not like uid::text||'/%') then raise exception 'PROOF_REQUIRED'; end if;
  if length(trim(coalesce(p->>'name','')))<3 or coalesce(p->>'phone','')!~'^01[0125][0-9]{8}$' or length(trim(coalesce(p->>'address','')))<8
    then raise exception 'BAD_CUSTOMER'; end if;
  select price into ship from shipping_zones where governorate=p->>'governorate' and is_active;
  if not found then raise exception 'BAD_GOVERNORATE'; end if;

  insert into orders(user_id,status,payment_method,payment_status,payment_proof_path,customer_name,customer_phone,governorate,address,notes,delivery_time)
  values(uid, case when pm.requires_proof then 'payment_review' else 'new' end, pm.id,
         case when pm.requires_proof then 'under_review' else 'pending' end, proof,
         trim(p->>'name'), p->>'phone', p->>'governorate', trim(p->>'address'), left(p->>'notes',500), left(p->>'delivery_time',40))
  returning id,order_no into oid,ono;

  for it in select * from jsonb_array_elements(p->'items') loop
    q:=(it->>'qty')::int; if q is null or q<1 or q>50 then raise exception 'BAD_QTY'; end if;
    select * into v from product_variants where id=(it->>'variant_id')::bigint and is_active;
    if not found then raise exception 'BAD_ITEM'; end if;
    select * into pr from products where id=v.product_id and is_active;
    if not found then raise exception 'BAD_ITEM'; end if;
    update product_variants set stock=stock-q where id=v.id and stock>=q;
    if not found then raise exception 'OUT_OF_STOCK:%',v.id; end if;
    insert into order_items(order_id,product_id,variant_id,name,variant_label,unit_price,qty,options)
      values(oid,pr.id,v.id,pr.name_ar,v.label,v.price,q,coalesce(it->'options','{}'));
    sub:=sub+v.price*q;
  end loop;

  if ccode is not null then
    cp:=validate_coupon(ccode,sub,ship);
    if not (cp->>'ok')::boolean then raise exception 'COUPON_%',upper(cp->>'error'); end if;
    select count(*) into used from coupon_redemptions where coupon_code=ccode and user_id=uid;
    if used>=(select per_user_limit from coupons where code=ccode) then raise exception 'COUPON_ALREADY_USED'; end if;
    update coupons set used_count=used_count+1 where code=ccode and (max_uses is null or used_count<max_uses);
    if not found then raise exception 'COUPON_EXHAUSTED'; end if;
    disc:=(cp->>'discount')::numeric; free_ship:=(cp->>'kind')='shipping';
  end if;
  select (value#>>'{}')::numeric into thr from store_settings where key='free_shipping_threshold';
  if free_ship or (thr is not null and sub-disc>=thr) then ship:=0; end if;

  update orders set subtotal=sub,discount=disc,shipping=ship,payment_fee=pm.fee,total=sub-disc+ship+pm.fee,coupon_code=ccode where id=oid;
  if ccode is not null then insert into coupon_redemptions(coupon_code,order_id,user_id,discount) values(ccode,oid,uid,disc); end if;
  -- ثبّت بيانات العميل في ملفه لو ناقصة
  update profiles set full_name=coalesce(full_name,trim(p->>'name')), phone=coalesce(phone,p->>'phone') where id=uid;
  return jsonb_build_object('order_id',oid,'order_no',ono,'total',sub-disc+ship+pm.fee);
end $$;

revoke execute on function public.create_order(jsonb) from public, anon;
grant execute on function public.create_order(jsonb) to authenticated;
grant execute on function public.validate_coupon(text,numeric,numeric) to anon, authenticated;

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.payment_methods enable row level security;
alter table public.order_statuses enable row level security;
alter table public.store_settings enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupon_redemptions enable row level security;

create policy profiles_read on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());

-- كتالوج: القراءة للجميع (النشط فقط)، الكتابة للأدمن
create policy cat_read on public.categories for select using (is_active or public.is_admin());
create policy prod_read on public.products for select using (is_active or public.is_admin());
create policy var_read on public.product_variants for select using (is_active or public.is_admin());
create policy ship_read on public.shipping_zones for select using (is_active or public.is_admin());
create policy status_read on public.order_statuses for select using (true);
create policy settings_read on public.store_settings for select using (true);
-- بيانات التحويل (أرقام InstaPay/Vodafone Cash) للمسجّلين فقط
create policy pay_read on public.payment_methods for select to authenticated using (is_active or public.is_admin());
create policy cat_admin on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy prod_admin on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy var_admin on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy ship_admin on public.shipping_zones for all using (public.is_admin()) with check (public.is_admin());
create policy status_admin on public.order_statuses for all using (public.is_admin()) with check (public.is_admin());
create policy settings_admin on public.store_settings for all using (public.is_admin()) with check (public.is_admin());
create policy pay_admin on public.payment_methods for all using (public.is_admin()) with check (public.is_admin());
-- الكوبونات: أدمن فقط (العميل يفحص عبر validate_coupon)
create policy coupons_admin on public.coupons for all using (public.is_admin()) with check (public.is_admin());
-- الطلبات: العميل يشوف طلباته فقط، والإنشاء عبر create_order فقط، والتعديل للأدمن
create policy orders_read on public.orders for select using (user_id=auth.uid() or public.is_admin());
create policy orders_admin_upd on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy items_read on public.order_items for select using (public.is_admin() or exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy redeem_read on public.coupon_redemptions for select using (user_id=auth.uid() or public.is_admin());

alter publication supabase_realtime add table public.orders;

-- ---------- Storage ----------
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('payment-proofs','payment-proofs',false,5242880,array['image/jpeg','image/png','image/webp']),
 ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy proofs_insert on storage.objects for insert to authenticated with check (bucket_id='payment-proofs' and (storage.foldername(name))[1]=auth.uid()::text);
create policy proofs_admin_del on storage.objects for delete to authenticated using (bucket_id='payment-proofs' and public.is_admin());
create policy pimg_read on storage.objects for select using (bucket_id='product-images');
create policy pimg_admin on storage.objects for all to authenticated using (bucket_id='product-images' and public.is_admin()) with check (bucket_id='product-images' and public.is_admin());

-- ===== v9 =====
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
create policy proofs_read on storage.objects for select to authenticated using (bucket_id='payment-proofs' and public.is_admin());

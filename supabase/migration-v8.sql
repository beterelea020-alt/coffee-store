-- v8: رسوم الدفع (مثلاً +20 ج للدفع عند الاستلام). شغّله مرة واحدة في SQL Editor لو قاعدتك شغالة بالفعل.
alter table public.payment_methods add column if not exists fee numeric(10,2) not null default 0 check (fee>=0);
alter table public.orders add column if not exists payment_fee numeric(10,2) not null default 0;
update public.payment_methods set fee=20 where id='cod';

create or replace function public.create_order(p jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
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

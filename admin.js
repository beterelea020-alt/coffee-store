// RAW Coffee — Admin dashboard. الصلاحيات الحقيقية في Supabase RLS؛ هنا واجهة فقط.
(async () => {
  const $ = (s) => document.querySelector(s), app = $('#app');
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(n || 0) + ' ج.م';
  const dt = (d) => (d ? new Date(d).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
  const run = async (p) => { const { data, error } = await p; if (error) throw error; return data; };
  const fail = (e) => rawToast('خطأ: ' + (e.message || e));
  const PAY = { pending: 'في انتظار الدفع', under_review: 'قيد المراجعة', confirmed: 'مؤكد', rejected: 'مرفوض' };
  const gate = (t) => `<div class="card"><h3>${t}</h3></div>`;
  if (localStorage.getItem('rawCoffeeTheme') === 'dark') document.body.classList.add('dark');
  if (!RAW.enabled) { app.innerHTML = gate('الباك إند غير مفعّل: أضف مفاتيح Supabase في config.js'); return; }
  if (!(await RAW.session())) { app.innerHTML = gate('سجّل دخول حساب الأدمن') + '<button class="btn" id="li">تسجيل الدخول</button>'; $('#li').onclick = () => openAuth(); openAuth(); return; }
  $('#logout').hidden = false; $('#logout').onclick = async () => { await RAW.signOut(); location.href = 'index.html'; };
  if (!(await RAW.isAdmin())) { app.innerHTML = gate('الحساب ده ملوش صلاحية الأدمن'); return; }
  const db = RAW.client;

  // ---------- modal ----------
  const modal = $('#admModal');
  const openModal = (html) => { $('#admBody').innerHTML = `<button class="close-btn modal-close" type="button" aria-label="إغلاق" id="admX">×</button>${html}`; modal.hidden = false; document.body.classList.add('no-scroll'); $('#admX').onclick = closeModal; return $('#admBody'); };
  const closeModal = () => { modal.hidden = true; document.body.classList.remove('no-scroll'); };
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // ---------- generic CRUD table ----------
  function crud(el, cfg) {
    const { table, pk, cols, order, blank, title } = cfg;
    const cell = (c, v, isNew) => {
      const dis = c.pk && !isNew ? 'disabled' : '';
      if (c.type === 'bool') return `<input type="checkbox" data-k="${c.k}" ${v ? 'checked' : ''}>`;
      if (c.type === 'select') return `<select data-k="${c.k}">${c.opts.map(([a, b]) => `<option value="${a}" ${a === v ? 'selected' : ''}>${b}</option>`).join('')}</select>`;
      if (c.type === 'date') return `<input type="datetime-local" data-k="${c.k}" value="${v ? new Date(new Date(v) - new Date(v).getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : ''}">`;
      if (c.type === 'number') return `<input type="number" step="any" data-k="${c.k}" value="${v ?? ''}">`;
      return `<input data-k="${c.k}" value="${esc(v)}" ${dis}>`;
    };
    const row = (r, isNew) => `<tr data-pk="${isNew ? '' : esc(r[pk])}">${cols.map((c) => `<td>${cell(c, r[c.k], isNew)}</td>`).join('')}<td style="white-space:nowrap">${isNew ? '<button class="btn sm" data-a="add">إضافة</button>' : '<button class="btn sm" data-a="save">حفظ</button> <button class="btn sm danger" data-a="del">حذف</button>'}</td></tr>`;
    const collect = (tr) => {
      const o = {};
      for (const c of cols) {
        const i = tr.querySelector(`[data-k="${c.k}"]`); let v;
        if (c.type === 'bool') v = i.checked; else if (c.type === 'number') v = i.value === '' ? (c.req ? 0 : null) : Number(i.value);
        else if (c.type === 'date') v = i.value ? new Date(i.value).toISOString() : null; else { v = i.value.trim(); if (c.upper) v = v.toUpperCase(); if (v === '' && !c.req) v = null; }
        if (c.req && (v === '' || v === null)) throw new Error(`الحقل "${c.label}" مطلوب`);
        o[c.k] = v;
      }
      return o;
    };
    const draw = async () => {
      const rows = await run(db.from(table).select('*').order(order || pk));
      el.innerHTML = `<h3 style="margin-bottom:6px">${title}</h3>${cfg.note ? `<p class="muted" style="margin-bottom:12px">${cfg.note}</p>` : ''}<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map((c) => `<th>${c.label}</th>`).join('')}<th></th></tr></thead><tbody>${row(blank(), true)}${rows.map((r) => row(r, false)).join('')}</tbody></table></div>`;
    };
    el.onclick = async (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return; const tr = b.closest('tr');
      try {
        if (b.dataset.a === 'del') { if (!confirm('تأكيد الحذف؟')) return; await run(db.from(table).delete().eq(pk, tr.dataset.pk)); }
        else { const o = collect(tr); if (b.dataset.a === 'add') await run(db.from(table).insert(o)); else { const { [pk]: _x, ...rest } = o; await run(db.from(table).update(pk in o && !cols.find((c) => c.k === pk)?.pk ? o : rest).eq(pk, tr.dataset.pk)); } }
        rawToast('تم الحفظ'); draw();
      } catch (err) { fail(err); }
    };
    return draw();
  }
  const T = (k, label, extra = {}) => ({ k, label, type: 'text', ...extra }), N = (k, label, extra = {}) => ({ k, label, type: 'number', ...extra }), B = (k, label) => ({ k, label, type: 'bool' });
  const in30 = () => new Date(Date.now() + 30 * 864e5).toISOString();

  const TABS = {
    orders: ['الطلبات', ordersTab], products: ['المنتجات', productsTab],
    categories: ['التصنيفات', (el) => crud(el, { title: 'التصنيفات', table: 'categories', pk: 'id', order: 'sort', cols: [T('id', 'المعرّف', { pk: true, req: true }), T('name_ar', 'الاسم عربي', { req: true }), T('name_en', 'English'), T('image_url', 'رابط الصورة'), N('sort', 'الترتيب', { req: true }), B('is_active', 'نشط')], blank: () => ({ sort: 0, is_active: true }), note: 'المعرّف لازم يطابق التصنيف المستخدم في المنتجات.' })],
    coupons: ['الكوبونات', (el) => crud(el, { title: 'أكواد الخصم', table: 'coupons', pk: 'code', order: 'created_at', note: 'كل كوبون صلاحيته 30 يوم بالكتير (السيرفر بيرفض أكتر من كده) — عشان تعمل عرض جديد أضف كوبون جديد بكود مختلف. (التواريخ مملوءة تلقائيًا.) عدد الاستخدام الكلي ولكل عميل بيتفحص على السيرفر.', cols: [T('code', 'الكود', { pk: true, req: true, upper: true }), { k: 'kind', label: 'النوع', type: 'select', opts: [['percent', 'نسبة %'], ['fixed', 'مبلغ ثابت'], ['shipping', 'شحن مجاني']] }, N('value', 'القيمة', { req: true }), N('max_discount', 'أقصى خصم'), N('min_subtotal', 'حد أدنى للطلب', { req: true }), { k: 'starts_at', label: 'يبدأ', type: 'date' }, { k: 'ends_at', label: 'ينتهي', type: 'date' }, N('max_uses', 'أقصى استخدام'), N('per_user_limit', 'لكل عميل', { req: true }), B('is_active', 'نشط'), N('used_count', 'اتستخدم')], blank: () => ({ kind: 'percent', value: 10, min_subtotal: 0, per_user_limit: 1, is_active: true, starts_at: new Date().toISOString(), ends_at: in30(), used_count: 0 }) })],
    shipping: ['الشحن', (el) => crud(el, { title: 'أسعار الشحن', table: 'shipping_zones', pk: 'id', order: 'governorate', note: 'أي تغيير بيظهر للعميل فورًا في صفحة الدفع.', cols: [T('governorate', 'المحافظة / المنطقة', { req: true }), N('price', 'سعر الشحن', { req: true }), B('is_active', 'متاح')], blank: () => ({ price: 70, is_active: true }) })],
    payments: ['طرق الدفع', (el) => crud(el, { title: 'طرق الدفع وبيانات التحويل', table: 'payment_methods', pk: 'id', order: 'sort', note: 'ضع هنا أرقام InstaPay / Vodafone Cash — بتظهر للعميل المسجّل في صفحة الدفع.', cols: [T('id', 'المعرّف', { pk: true, req: true }), T('name_ar', 'الاسم', { req: true }), T('account_details', 'رقم/عنوان التحويل'), T('instructions_ar', 'تعليمات للعميل'), B('requires_proof', 'يتطلب إثبات'), N('fee', 'رسوم إضافية (ج)', { req: true }), B('is_active', 'متاح'), N('sort', 'الترتيب', { req: true })], blank: () => ({ requires_proof: true, fee: 0, is_active: true, sort: 9 }) })],
    statuses: ['حالات الطلب', (el) => crud(el, { title: 'حالات الطلب', table: 'order_statuses', pk: 'code', order: 'sort', note: 'تقدر تضيف حالات جديدة أو تعدّل الأسماء. (لا تحذف حالة مستخدمة في طلبات.)', cols: [T('code', 'الكود', { pk: true, req: true }), T('label_ar', 'الاسم عربي', { req: true }), T('label_en', 'English'), N('sort', 'الترتيب', { req: true })], blank: () => ({ sort: 9 }) })],
    content: ['محتوى الموقع', contentTab], settings: ['الإعدادات', settingsTab]
  };
  $('#tabs').innerHTML = Object.entries(TABS).map(([k, [l]]) => `<button type="button" data-t="${k}">${l}</button>`).join('');
  let current = 'orders';
  const go = async (t) => { current = t; document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.t === t)); app.onclick = null; app.innerHTML = '<p class="muted">جاري التحميل…</p>'; try { await TABS[t][1](app); } catch (e) { app.innerHTML = gate('تعذّر التحميل'); fail(e); } };
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) go(b.dataset.t); });

  // ---------- orders ----------
  async function ordersTab(el) {
    const [orders, statuses] = await Promise.all([run(db.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(300)), RAW.orderStatuses()]);
    const sl = Object.fromEntries(statuses.map((s) => [s.code, s.label_ar])), cls = (s) => (s === 'delivered' || s === 'payment_confirmed' ? 'ok' : s === 'cancelled' ? 'bad' : s === 'new' || s === 'payment_review' ? 'warn' : '');
    const sum = orders.filter((o) => o.payment_status === 'confirmed' && o.status !== 'cancelled').reduce((a, o) => a + Number(o.total), 0);
    el.innerHTML = `<div class="stats"><div class="card"><span class="muted">طلبات جديدة</span><b>${orders.filter((o) => o.status === 'new').length}</b></div><div class="card"><span class="muted">دفعات للمراجعة</span><b>${orders.filter((o) => o.payment_status === 'under_review').length}</b></div><div class="card"><span class="muted">مبيعات مؤكدة</span><b>${money(sum)}</b></div></div>
      <div class="toolbar"><input id="oq" placeholder="بحث برقم الطلب / الاسم / الموبايل"><select id="of"><option value="">كل الحالات</option>${statuses.map((s) => `<option value="${esc(s.code)}">${esc(s.label_ar)}</option>`).join('')}</select><select id="op"><option value="">كل حالات الدفع</option>${Object.entries(PAY).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>الطلب</th><th>العميل</th><th>الإجمالي</th><th>الدفع</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody id="ob"></tbody></table></div>`;
    const draw = () => {
      const q = $('#oq').value.trim().toLowerCase(), f = $('#of').value, p = $('#op').value;
      $('#ob').innerHTML = orders.filter((o) => (!f || o.status === f) && (!p || o.payment_status === p) && (!q || `${o.order_no} ${o.customer_name} ${o.customer_phone}`.toLowerCase().includes(q)))
        .map((o) => `<tr class="click" data-id="${o.id}"><td dir="ltr"><b>${esc(o.order_no)}</b></td><td>${esc(o.customer_name)}<br><span class="muted">${esc(o.customer_phone)}</span></td><td>${money(o.total)}</td><td>${esc(o.payment_method)}<br><span class="badge-s ${o.payment_status === 'confirmed' ? 'ok' : o.payment_status === 'rejected' ? 'bad' : 'warn'}">${PAY[o.payment_status]}</span></td><td><span class="badge-s ${cls(o.status)}">${esc(sl[o.status] || o.status)}</span></td><td>${dt(o.created_at)}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">مفيش طلبات</td></tr>';
    };
    ['oq', 'of', 'op'].forEach((i) => $('#' + i).addEventListener('input', draw)); draw();
    $('#ob').onclick = (e) => { const tr = e.target.closest('tr[data-id]'); if (tr) orderModal(orders.find((o) => String(o.id) === tr.dataset.id), statuses); };
    if (!window.__ow) window.__ow = RAW.watchOrders(() => { if (current === 'orders' && modal.hidden) go('orders'); });
  }
  function orderModal(o, statuses) {
    const m = openModal(`<span class="eyebrow dark">ORDER</span><h3 dir="ltr" style="text-align:start">${esc(o.order_no)}</h3><p class="muted">${dt(o.created_at)}</p>
      <div class="kv"><div><b>العميل</b>${esc(o.customer_name)}</div><div><b>الموبايل</b><a href="tel:${esc(o.customer_phone)}">${esc(o.customer_phone)}</a></div><div><b>المحافظة</b>${esc(o.governorate)}</div><div><b>العنوان</b>${esc(o.address)}</div><div><b>موعد التوصيل</b>${esc(o.delivery_time || '—')}</div><div><b>ملاحظات</b>${esc(o.notes || '—')}</div></div>
      <table class="lines"><tbody>${o.order_items.map((i) => `<tr><td>${esc(i.name)} <span class="muted">${esc(i.variant_label)}${i.options?.roast ? ' · ' + esc(i.options.roast) : ''}${i.options?.grind ? ' · ' + esc(i.options.grind) : ''}</span></td><td>×${i.qty}</td><td>${money(i.unit_price)}</td><td>${money(i.unit_price * i.qty)}</td></tr>`).join('')}</tbody></table>
      <div class="kv"><div><b>المنتجات</b>${money(o.subtotal)}</div><div><b>الخصم ${o.coupon_code ? '(' + esc(o.coupon_code) + ')' : ''}</b>${o.discount ? '-' + money(o.discount) : '—'}</div><div><b>الشحن</b>${money(o.shipping)}</div>${Number(o.payment_fee) ? `<div><b>رسوم الدفع</b>${money(o.payment_fee)}</div>` : ''}<div><b>الإجمالي</b><strong>${money(o.total)}</strong></div><div><b>طريقة الدفع</b>${esc(o.payment_method)}</div></div>
      <div id="pf">${o.payment_proof_path ? '<p class="muted">جاري تحميل صورة الإثبات…</p>' : '<p class="muted">لا توجد صورة إثبات دفع.</p>'}</div>
      <div class="form-grid"><label>حالة الدفع<select id="sPay">${Object.entries(PAY).map(([k, v]) => `<option value="${k}" ${k === o.payment_status ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label>حالة الطلب<select id="sSt">${statuses.map((s) => `<option value="${esc(s.code)}" ${s.code === o.status ? 'selected' : ''}>${esc(s.label_ar)}</option>`).join('')}</select></label></div>
      <p class="muted">تأكيد الدفع ما بيتم تلقائيًا — راجع الصورة الأول.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-dark" id="sSave" type="button">حفظ التغييرات</button><button class="btn" id="sShip" type="button">🚚 تأكيد وشحن الطلب</button></div>`);
    if (o.payment_proof_path) RAW.proofUrl(o.payment_proof_path).then((u) => { m.querySelector('#pf').innerHTML = `<a href="${esc(u)}" target="_blank" rel="noopener"><img class="proof-img" src="${esc(u)}" alt="إثبات الدفع"></a>`; }).catch(() => { m.querySelector('#pf').innerHTML = '<p class="form-msg">تعذّر تحميل الصورة</p>'; });
    $('#sPay').onchange = (e) => { const st = $('#sSt'); if (e.target.value === 'confirmed' && ['new', 'payment_pending', 'payment_review'].includes(st.value)) st.value = 'payment_confirmed'; if (e.target.value === 'rejected') st.value = 'payment_pending'; };
    $('#sShip').onclick = async () => {
      const cod = o.payment_method === 'cod';
      if (!cod && o.payment_status !== 'confirmed' && $('#sPay').value !== 'confirmed') { rawToast('راجع صورة التحويل وأكّد الدفع الأول'); return; }
      if (!confirm('تأكيد شحن الطلب ' + o.order_no + '؟')) return;
      try { await run(db.from('orders').update({ payment_status: cod ? o.payment_status : 'confirmed', status: 'shipped' }).eq('id', o.id)); rawToast('الطلب اتشحن'); closeModal(); go('orders'); } catch (e) { fail(e); }
    };
    $('#sSave').onclick = async () => { try { await run(db.from('orders').update({ payment_status: $('#sPay').value, status: $('#sSt').value }).eq('id', o.id)); rawToast('تم تحديث الطلب'); closeModal(); go('orders'); } catch (e) { fail(e); } };
  }

  // ---------- products ----------
  async function productsTab(el) {
    const [prods, cats] = await Promise.all([run(db.from('products').select('*, product_variants(*)').order('id')), run(db.from('categories').select('*').order('sort'))]);
    el.innerHTML = `<div class="toolbar"><button class="btn sm" id="np" type="button">+ منتج جديد</button><input id="pq" placeholder="بحث باسم المنتج"></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>المنتج</th><th>التصنيف</th><th>الأوزان / الأسعار / المخزون</th><th>الحالة</th><th></th></tr></thead><tbody id="pb"></tbody></table></div>`;
    const draw = () => { const q = $('#pq').value.trim(); $('#pb').innerHTML = prods.filter((p) => !q || p.name_ar.includes(q)).map((p) => `<tr data-id="${p.id}"><td><img class="thumb" src="${esc(p.image_url)}" alt=""></td><td><b>${esc(p.name_ar)}</b></td><td>${esc(p.category_id)}</td><td>${p.product_variants.map((v) => `${esc(v.label)}: ${money(v.price)} <span class="muted">(مخزون ${v.stock})</span>`).join('<br>')}</td><td><span class="badge-s ${p.is_active ? 'ok' : 'bad'}">${p.is_active ? 'ظاهر' : 'مخفي'}</span></td><td style="white-space:nowrap"><button class="btn sm" data-a="edit">تعديل</button> <button class="btn sm danger" data-a="del">حذف</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">مفيش منتجات</td></tr>'; };
    $('#pq').oninput = draw; draw();
    $('#np').onclick = () => productModal(null, cats);
    $('#pb').onclick = async (e) => { const b = e.target.closest('[data-a]'); if (!b) return; const p = prods.find((x) => String(x.id) === b.closest('tr').dataset.id);
      if (b.dataset.a === 'edit') productModal(p, cats); else if (confirm(`حذف "${p.name_ar}" نهائيًا؟ (الطلبات القديمة مش هتتأثر)`)) { try { await run(db.from('products').delete().eq('id', p.id)); rawToast('تم الحذف'); go('products'); } catch (err) { fail(err); } } };
  }
  function productModal(p, cats) {
    const vrow = (v = {}) => `<div class="vrow" data-id="${v.id || ''}"><input data-k="label" placeholder="الاسم (250 جم)" value="${esc(v.label)}"><input data-k="weight_g" type="number" placeholder="الوزن جم" value="${v.weight_g ?? ''}"><input data-k="price" type="number" step="0.01" placeholder="السعر" value="${v.price ?? ''}"><input data-k="old_price" type="number" step="0.01" placeholder="سعر قبل الخصم" value="${v.old_price ?? ''}"><input data-k="stock" type="number" placeholder="المخزون" value="${v.stock ?? 0}"><label class="chk" style="flex-direction:row;align-items:center;gap:4px;margin:0"><input type="checkbox" data-k="is_active" style="width:20px;min-height:0" ${v.is_active === false ? '' : 'checked'}>نشط</label><button type="button" class="btn sm danger" data-x>×</button></div>`;
    const tastes = [['', '—'], ['balanced', 'متوازن'], ['strong', 'قوي'], ['smooth', 'ناعم'], ['spiced', 'محوج']], brews = [['', '—'], ['turkish', 'تركي'], ['espresso', 'إسبريسو'], ['arabic', 'عربي'], ['french', 'فرنساوي']];
    const sel = (n, list, v) => `<select name="${n}">${list.map(([a, b]) => `<option value="${a}" ${a === (v || '') ? 'selected' : ''}>${b}</option>`).join('')}</select>`;
    const m = openModal(`<h3>${p ? 'تعديل منتج' : 'منتج جديد'}</h3><form id="pForm" novalidate>
      <div class="form-grid"><label>الاسم (عربي)<input name="name_ar" value="${esc(p?.name_ar)}"></label><label>الاسم (English)<input name="name_en" value="${esc(p?.name_en)}"></label></div>
      <div class="form-grid"><label>التصنيف<select name="category_id">${cats.map((c) => `<option value="${esc(c.id)}" ${c.id === p?.category_id ? 'selected' : ''}>${esc(c.name_ar)}</option>`).join('')}</select></label><label>شارة (مثال: الأكثر مبيعًا)<input name="badge_ar" value="${esc(p?.badge_ar)}"></label></div>
      <label>الوصف<textarea name="desc_ar" rows="3">${esc(p?.desc_ar)}</textarea></label>
      <div class="form-grid"><label>الوصف (English)<textarea name="desc_en" rows="2">${esc(p?.desc_en)}</textarea></label><label>التحميص الافتراضي<input name="roast" value="${esc(p?.roast)}"></label></div>
      <div class="form-grid"><label>درجات التحميص المتاحة (افصل بفاصلة)<input name="roasts" value="${esc((p?.roasts || []).join('، '))}"></label><label>النكهة (للمساعد)${sel('taste', tastes, p?.taste)}</label></div>
      <div class="form-grid"><label>طريقة التحضير (للمساعد)${sel('brew', brews, p?.brew)}</label><label>الصورة (رابط)<input name="image_url" value="${esc(p?.image_url)}"></label></div>
      <label>أو ارفع صورة<input type="file" id="pImg" accept="image/jpeg,image/png,image/webp"></label>
      <label style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" name="is_active" style="width:20px;min-height:0" ${p && !p.is_active ? '' : 'checked'}>المنتج ظاهر للعملاء</label>
      <div class="pay-title">الأوزان والأسعار والمخزون</div><div id="vr">${(p?.product_variants?.length ? p.product_variants : [{}]).sort((a, b) => a.sort - b.sort).map(vrow).join('')}</div>
      <button class="btn sm ghost" type="button" id="addV" style="margin-top:10px">+ إضافة وزن</button><p class="form-msg" id="pErr" role="alert"></p>
      <button class="btn btn-dark" type="submit">حفظ المنتج</button></form>`);
    $('#addV').onclick = () => $('#vr').insertAdjacentHTML('beforeend', vrow());
    $('#vr').onclick = (e) => { if (e.target.matches('[data-x]')) e.target.closest('.vrow').remove(); };
    $('#pImg').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const path = `p/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${f.type.split('/')[1]}`; const { error } = await db.storage.from('product-images').upload(path, f, { contentType: f.type }); if (error) throw error; m.querySelector('[name=image_url]').value = db.storage.from('product-images').getPublicUrl(path).data.publicUrl; rawToast('تم رفع الصورة'); } catch (err) { fail(err); } };
    $('#pForm').onsubmit = async (e) => {
      e.preventDefault(); const f = e.currentTarget.elements, err = $('#pErr'); err.textContent = '';
      const rows = [...document.querySelectorAll('#vr .vrow')].map((r, i) => { const g = (k) => r.querySelector(`[data-k=${k}]`); return { id: r.dataset.id || null, label: g('label').value.trim(), weight_g: g('weight_g').value === '' ? null : Number(g('weight_g').value), price: Number(g('price').value), old_price: g('old_price').value === '' ? null : Number(g('old_price').value), stock: Number(g('stock').value), is_active: g('is_active').checked, sort: i }; });
      if (f.name_ar.value.trim().length < 2) { err.textContent = 'اكتب اسم المنتج'; return; }
      if (!rows.length) { err.textContent = 'أضف وزن واحد على الأقل'; return; }
      if (rows.some((r) => !r.label || !(r.price >= 0) || !Number.isInteger(r.stock) || r.stock < 0)) { err.textContent = 'راجع الاسم والسعر والمخزون في كل وزن'; return; }
      const body = { category_id: f.category_id.value, name_ar: f.name_ar.value.trim(), name_en: f.name_en.value.trim() || null, desc_ar: f.desc_ar.value.trim() || null, desc_en: f.desc_en.value.trim() || null, badge_ar: f.badge_ar.value.trim() || null, roast: f.roast.value.trim() || null, roasts: f.roasts.value.split(/[,،]/).map((s) => s.trim()).filter(Boolean), taste: f.taste.value || null, brew: f.brew.value || null, image_url: f.image_url.value.trim() || null, is_active: f.is_active.checked };
      try {
        let id = p?.id;
        if (id) await run(db.from('products').update(body).eq('id', id)); else id = (await run(db.from('products').insert(body).select('id').single())).id;
        const keep = rows.filter((r) => r.id).map((r) => Number(r.id)), old = (p?.product_variants || []).map((v) => v.id).filter((x) => !keep.includes(x));
        if (old.length) await run(db.from('product_variants').delete().in('id', old));
        for (const r of rows) { const { id: vid, ...v } = r; if (vid) await run(db.from('product_variants').update(v).eq('id', vid)); else await run(db.from('product_variants').insert({ ...v, product_id: id })); }
        rawToast('تم حفظ المنتج'); closeModal(); go('products');
      } catch (ex) { err.textContent = 'تعذّر الحفظ: ' + (ex.message || ex); }
    };
  }

  // ---------- settings ----------
  async function settingsTab(el) {
    const cur = Object.fromEntries((await run(db.from('store_settings').select('*'))).map((r) => [r.key, r.value]));
    const F = [['store_name', 'اسم المتجر', 'text'], ['whatsapp_number', 'رقم واتساب (دولي بدون +، مثال 201012345678)', 'text'], ['free_shipping_threshold', 'حد الشحن المجاني (ج.م) — اتركه 0 لإلغائه', 'number'], ['announced_coupon', 'الكود المُعلَن (يظهر في الشريط العلوي)', 'text']];
    el.innerHTML = `<div class="card stack"><h3>إعدادات المتجر</h3><form id="sf">${F.map(([k, l, t]) => `<label>${l}<input name="${k}" type="${t}" value="${esc(cur[k] ?? '')}"></label>`).join('')}<button class="btn btn-dark" style="margin-top:14px" type="submit">حفظ الإعدادات</button></form></div>`;
    $('#sf').onsubmit = async (e) => { e.preventDefault(); const f = e.currentTarget.elements; try { await run(db.from('store_settings').upsert(F.map(([k, , t]) => ({ key: k, value: t === 'number' ? Number(f[k].value || 0) : f[k].value.trim() })))); rawToast('تم حفظ الإعدادات'); } catch (err) { fail(err); } };
  }
  async function contentTab(el) {
    const [rows, prods] = await Promise.all([run(db.from('store_settings').select('*')), run(db.from('products').select('id,name_ar').order('id'))]);
    const cur = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const G = [
      ['الشريط العلوي', [['announcement_text', 'نص الشريط (فاضي = يظهر الكود المُعلَن أو الشحن المجاني تلقائيًا)', 'text']]],
      ['الواجهة الرئيسية', [['hero_eyebrow', 'سطر صغير فوق العنوان', 'text'], ['hero_title', 'العنوان — السطر الأول عادي، والسطر التاني بلون مميز', 'area', 2], ['hero_text', 'الوصف', 'area', 3]]],
      ['قصة البراند', [['story_title', 'العنوان', 'text'], ['story_text', 'النص', 'area', 3]]],
      ['التواصل', [['contact_phone', 'رقم التليفون', 'text'], ['contact_email', 'الإيميل', 'text'], ['social_instagram', 'رابط إنستجرام', 'text'], ['social_facebook', 'رابط فيسبوك', 'text'], ['social_tiktok', 'رابط تيك توك', 'text'], ['footer_tagline', 'جملة الفوتر', 'text']]],
      ['الأسئلة الشائعة', [['faq_list', 'كل سطر: السؤال | الإجابة', 'area', 8]]],
      ['آراء العملاء (حقيقية فقط)', [['reviews_list', 'كل سطر: الاسم | المدينة | الرأي', 'area', 5]]],
      ['البوكسات', [['bundles_list', 'كل سطر: اسم البوكس | وصف | أرقام المنتجات بفاصلة | هدية؟ (1 أو 0)', 'area', 4]]],
      ['السياسات', [['policy_shipping', 'الشحن والتوصيل', 'area', 3], ['policy_returns', 'الاستبدال والاسترجاع', 'area', 3], ['policy_privacy', 'الخصوصية', 'area', 3]]]
    ];
    const keys = G.flatMap(([, f]) => f.map((x) => x[0]));
    el.innerHTML = `<form id="cf" class="stack">${G.map(([t, f]) => `<div class="card stack"><h3>${t}</h3>${f.map(([k, l, ty, r]) => `<label>${l}${ty === 'area' ? `<textarea name="${k}" rows="${r}">${esc(cur[k] ?? '')}</textarea>` : `<input name="${k}" value="${esc(cur[k] ?? '')}">`}</label>`).join('')}${t === 'البوكسات' ? `<details><summary class="muted">أرقام المنتجات</summary><p class="muted">${prods.map((p) => p.id + ' — ' + esc(p.name_ar)).join('<br>')}</p></details>` : ''}</div>`).join('')}<p class="muted">أي حقل تسيبه فاضي بيرجع للنص الافتراضي في الموقع. الأسعار والمنتجات والمخزون من تبويب المنتجات.</p><button class="btn btn-dark" type="submit">حفظ محتوى الموقع</button></form>`;
    $('#cf').onsubmit = async (e) => { e.preventDefault(); const f = e.currentTarget.elements; try { await run(db.from('store_settings').upsert(keys.map((k) => ({ key: k, value: f[k].value.trim() })))); rawToast('تم حفظ محتوى الموقع'); } catch (err) { fail(err); } };
  }
  go('orders');
})();

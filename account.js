// RAW Coffee — customer account: profile, orders + live status, order details, coupons used.
(async () => {
  const $ = (s) => document.querySelector(s), root = $('#acct');
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(n || 0) + ' ج.م';
  const dt = (d) => new Date(d).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  const PAY = { pending: ['في انتظار الدفع', 'warn'], under_review: ['قيد المراجعة', 'warn'], confirmed: ['تم التأكيد', 'ok'], rejected: ['مرفوض — تواصل معنا', 'bad'] };
  if (localStorage.getItem('rawCoffeeTheme') === 'dark') document.body.classList.add('dark');
  if (!RAW.enabled) { root.innerHTML = '<div class="card">الباك إند غير مفعّل بعد. أضف مفاتيح Supabase في config.js.</div>'; return; }
  const session = await RAW.session();
  if (!session) { root.innerHTML = '<div class="card"><h3>سجّل دخولك لمتابعة حسابك</h3><button class="btn" id="li" type="button">تسجيل الدخول</button></div>'; $('#li').onclick = () => openAuth(); openAuth(); return; }
  $('#logout').hidden = false; $('#logout').onclick = async () => { await RAW.signOut(); location.href = 'index.html'; };

  async function load() {
    const [profile, orders, statuses, redeems] = await Promise.all([RAW.profile(), RAW.myOrders(), RAW.orderStatuses(),
      (async () => { const r = await RAW.client.from('coupon_redemptions').select('*').order('created_at', { ascending: false }); return r.data || []; })()]);
    $('#adminLink').hidden = profile?.role !== 'admin';
    const open = new Set([...document.querySelectorAll('details[open]')].map((d) => d.dataset.id));
    const flow = statuses.filter((s) => s.code !== 'cancelled'), label = Object.fromEntries(statuses.map((s) => [s.code, s.label_ar]));
    root.innerHTML = `<div class="card"><h3>بياناتي</h3><form id="pf" class="stack">
      <div class="form-grid"><label>الاسم<input name="full_name" value="${esc(profile?.full_name)}"></label><label>رقم التواصل<input name="phone" value="${esc(profile?.phone)}" inputmode="tel"></label></div>
      ${profile?.email ? `<p class="muted">البريد: ${esc(profile.email)}</p>` : ''}<p class="form-msg" id="pm" role="alert"></p><button class="btn btn-dark sm" type="submit">حفظ التعديلات</button></form></div>
      <h3 style="margin:22px 0 12px">طلباتي (${orders.length})</h3>
      ${orders.length ? orders.map((o) => {
        const idx = flow.findIndex((s) => s.code === o.status), [pl, pc] = PAY[o.payment_status] || [o.payment_status, ''];
        return `<details class="card order-card" data-id="${o.id}" ${open.has(String(o.id)) ? 'open' : ''}><summary><span><b dir="ltr">${esc(o.order_no)}</b> <span class="muted">${dt(o.created_at)}</span></span>
          <span><span class="badge-s ${o.status === 'cancelled' ? 'bad' : o.status === 'delivered' ? 'ok' : ''}">${esc(label[o.status] || o.status)}</span> <span class="badge-s ${pc}">الدفع: ${pl}</span> <b>${money(o.total)}</b></span></summary>
          ${o.status === 'cancelled' ? '' : `<div class="steps">${flow.map((s, i) => `<span class="${i <= idx ? 'done' : ''}">${esc(s.label_ar)}</span>`).join('')}</div>`}
          <table class="lines"><tbody>${(o.order_items || []).map((i) => `<tr><td>${esc(i.name)} <span class="muted">${esc(i.variant_label)}${i.options?.roast ? ' · ' + esc(i.options.roast) : ''}${i.options?.grind ? ' · ' + esc(i.options.grind) : ''}</span></td><td>×${i.qty}</td><td>${money(i.unit_price * i.qty)}</td></tr>`).join('')}</tbody></table>
          <div class="kv"><div><b>المنتجات</b>${money(o.subtotal)}</div><div><b>الخصم${o.coupon_code ? ' (' + esc(o.coupon_code) + ')' : ''}</b>${o.discount ? '-' + money(o.discount) : '—'}</div><div><b>الشحن</b>${o.shipping ? money(o.shipping) : 'مجاني'}</div><div><b>الإجمالي</b>${money(o.total)}</div>
            <div><b>طريقة الدفع</b>${esc(o.payment_method)}</div><div><b>التوصيل إلى</b>${esc(o.governorate)} — ${esc(o.address)}</div><div><b>الاستلام</b>${esc(o.customer_name)} — ${esc(o.customer_phone)}</div></div>
          ${o.payment_proof_path ? '<p class="muted">✔ تم رفع إثبات الدفع — الإدارة بتراجعه</p>' : ''}</details>`;
      }).join('') : '<div class="card muted">لسه مفيش طلبات. <a href="index.html#shop" style="text-decoration:underline">ابدأ التسوق</a></div>'}
      ${redeems.length ? `<div class="card"><h3>أكواد الخصم اللي استخدمتها</h3>${redeems.map((r) => `<p><b dir="ltr">${esc(r.coupon_code)}</b> — وفّرت ${money(r.discount)} <span class="muted">${dt(r.created_at)}</span></p>`).join('')}</div>` : ''}`;
    $('#pf').addEventListener('submit', async (e) => {
      e.preventDefault(); const f = e.currentTarget.elements, m = $('#pm'), ph = RAW.normPhone(f.phone.value);
      if (f.full_name.value.trim().length < 3) { m.textContent = 'اكتب اسمك بالكامل'; return; }
      if (ph && !RAW.isPhone(ph)) { m.textContent = 'رقم الموبايل غير صحيح'; return; }
      try { await RAW.updateProfile({ full_name: f.full_name.value.trim(), phone: ph || null }); rawToast('تم حفظ بياناتك'); m.textContent = ''; } catch (err) { m.textContent = /unique|duplicate/i.test(err.message) ? 'الرقم ده مستخدم في حساب تاني' : 'تعذّر الحفظ'; }
    });
  }
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-proof]'); if (!b) return;
    try { const url = await RAW.proofUrl(b.dataset.proof); b.nextElementSibling.innerHTML = `<a href="${esc(url)}" target="_blank" rel="noopener"><img class="proof-img" src="${esc(url)}" alt="إثبات الدفع"></a>`; } catch (_) { rawToast('تعذّر فتح الصورة'); }
  });
  await load(); RAW.watchOrders(load);
})();

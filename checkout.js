// RAW Coffee — real checkout (server-priced order, payment method, proof upload, success). Inactive if keys are empty.
(() => {
  if (!window.RAW || !RAW.enabled) return;
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CERR = { invalid: 'كود الخصم غير صحيح', expired: 'الكود انتهت مدته', not_started: 'الكود لسه مابدأش', exhausted: 'الكود خلّص عدد استخداماته' };
  let D = null, coupon = null, proofPath = null;

  $('#checkoutBtn').addEventListener('click', async (e) => {
    e.stopImmediatePropagation();
    if (!cart.length) { showToast('السلة فاضية حاليًا'); return; }
    closeCart();
    (await RAW.session()) ? openCheckout() : openAuth(openCheckout);
  }, true);

  async function openCheckout() {
    const modal = $('#checkoutModal'), card = modal.querySelector('.modal-card');
    let root = $('#coRoot'); if (!root) { root = document.createElement('div'); root.id = 'coRoot'; card.appendChild(root); }
    [...card.children].forEach((c) => { c.hidden = c !== root; });   // نخفي محتوى النافذة الأصلي (renderCart لسه بيكتب فيه) بدل ما نمسحه
    root.innerHTML = '<p class="form-msg ok" style="padding:30px">جاري التحميل…</p>'; modal.hidden = false; document.body.classList.add('no-scroll');
    try {
      const [zones, methods, settings, profile] = await Promise.all([RAW.shippingZones(), RAW.paymentMethods(), RAW.settings(), RAW.profile()]);
      D = { zones, methods, settings, profile };
    } catch (e) { root.innerHTML = '<p class="form-msg" style="padding:30px">تعذّر تحميل بيانات الدفع. حدّث الصفحة.</p>'; return; }
    coupon = null; proofPath = null;
    const { zones, methods, profile } = D;
    root.innerHTML = `<div style="padding:26px"><button class="close-btn modal-close" type="button" id="coClose" aria-label="إغلاق">×</button>
    <span class="eyebrow dark">CHECKOUT</span><h3>إتمام الطلب</h3>
    <form id="coForm" class="stack" novalidate>
      <div class="form-grid"><label>الاسم الكامل<input name="name" autocomplete="name" value="${esc(profile?.full_name)}"></label>
        <label>رقم الموبايل<input name="phone" inputmode="tel" autocomplete="tel" value="${esc(profile?.phone)}"></label></div>
      <div class="form-grid"><label>المحافظة<select name="governorate"><option value="">اختار المحافظة</option>${zones.map((z) => `<option value="${esc(z.governorate)}">${esc(z.governorate)} — شحن ${z.price} ج</option>`).join('')}</select></label>
        <label>موعد التوصيل<select name="delivery_time"><option>أي وقت</option><option>صباحًا</option><option>ظهرًا</option><option>مساءً</option></select></label></div>
      <label>العنوان بالتفصيل<input name="address" autocomplete="street-address" placeholder="المنطقة، الشارع، رقم العمارة"></label>
      <div class="pay-title">طريقة الدفع</div>
      <div class="pay-list">${methods.map((m, i) => `<label class="pay-card"><input type="radio" name="payment_method" value="${esc(m.id)}" ${i === 0 ? 'checked' : ''}><b>${esc(m.name_ar)}</b>${Number(m.fee) ? `<small> (+${Number(m.fee)} ج)</small>` : ''}</label>`).join('')}</div>
      <div class="pay-info" id="payInfo"></div>
      <div class="proof-box" id="proofBox" hidden><label>ارفع صورة التحويل (Screenshot)<input type="file" id="proofFile" accept="image/jpeg,image/png,image/webp"></label><img id="proofPrev" alt="معاينة صورة التحويل" hidden></div>
      <label>ملاحظات الطلب (اختياري)<textarea name="notes" rows="2" maxlength="500"></textarea></label>
      <div class="coupon-row" style="margin-top:12px"><input id="coCode" placeholder="كود الخصم" autocomplete="off"><button type="button" id="coApply">تطبيق</button></div>
      <p class="form-msg" id="coCouponMsg"></p>
      <div class="co-summary" id="coSummary"></div>
      <p class="form-msg" id="coMsg" role="alert"></p>
      <button class="btn btn-whatsapp full" id="coSubmit" type="submit">تأكيد الطلب</button>
    </form></div>`;
    const form = $('#coForm'), method = () => methods.find((m) => m.id === form.elements.payment_method.value);
    const ship = () => { const z = zones.find((x) => x.governorate === form.elements.governorate.value); if (!z) return null; const thr = Number(D.settings.free_shipping_threshold); return coupon?.kind === 'shipping' || (thr && getSubtotal() - (coupon?.discount || 0) >= thr) ? 0 : Number(z.price); };
    const render = () => {
      const s = ship(), d = coupon?.discount || 0, fee = Number(method()?.fee || 0);
      $('#coSummary').innerHTML = `<div><span>المنتجات (${cart.reduce((a, i) => a + i.qty, 0)})</span><b>${money(getSubtotal())}</b></div>${d ? `<div><span>خصم (${esc(coupon.code)})</span><b>-${money(d)}</b></div>` : ''}<div><span>الشحن</span><b>${s === null ? 'اختار المحافظة' : s === 0 ? 'مجاني' : money(s)}</b></div>${fee ? `<div><span>رسوم ${esc(method().name_ar)}</span><b>${money(fee)}</b></div>` : ''}<div class="grand"><span>الإجمالي</span><b>${money(getSubtotal() - d + (s || 0) + fee)}</b></div>`;
      const m = method(); $('#proofBox').hidden = !m?.requires_proof;
      $('#payInfo').innerHTML = m ? `${esc(m.instructions_ar)}${m.account_details ? `<br>${esc(m.name_ar)}: <code id="acc">${esc(m.account_details)}</code> <button type="button" class="link-btn" id="copyAcc">نسخ</button>` : ''}<br><b>المبلغ المطلوب: ${money(getSubtotal() - d + (s || 0))}</b>` : '';
      $('#coSubmit').textContent = m?.requires_proof ? 'تأكيد الطلب وإرسال إثبات الدفع' : 'تأكيد الطلب';
    };
    const applyCode = async () => {
      const code = $('#coCode').value.trim().toUpperCase(), box = $('#coCouponMsg'); coupon = null; box.classList.remove('ok');
      if (!code) { box.textContent = ''; return render(); }
      try {
        const r = await RAW.validateCoupon(code, getSubtotal(), 0);
        if (r.ok) { coupon = { code: r.code, kind: r.kind, discount: Number(r.discount) }; box.textContent = 'تم تطبيق الكود ✔'; box.classList.add('ok'); }
        else box.textContent = r.error === 'min_subtotal' ? `الكود بيشتغل من طلبات ${money(r.min)} فأكتر` : (CERR[r.error] || 'كود الخصم غير صحيح');
      } catch (_) { box.textContent = 'تعذّر فحص الكود'; }
      render();
    };
    form.addEventListener('change', (e) => { if (e.target.name === 'payment_method' || e.target.name === 'governorate') render(); });
    root.onclick = (e) => { if (e.target.id === 'copyAcc') navigator.clipboard?.writeText($('#acc').textContent).then(() => rawToast('تم النسخ')); };
    $('#coApply').addEventListener('click', applyCode);
    $('#coClose').addEventListener('click', () => { modal.hidden = true; document.body.classList.remove('no-scroll'); });
    $('#proofFile').addEventListener('change', (e) => {
      const f = e.target.files[0], img = $('#proofPrev'); proofPath = null; img.hidden = true;
      if (f && /^image\//.test(f.type)) { img.src = URL.createObjectURL(f); img.hidden = false; }
    });
    const pending = localStorage.getItem('rawPendingCoupon'); if (pending) { $('#coCode').value = pending; applyCode(); } else render();
    form.addEventListener('submit', (e) => submit(e, form, method));
  }

  const fe = (f, m) => { let e = f.parentElement.querySelector('.field-error'); if (!e) { e = document.createElement('span'); e.className = 'field-error'; e.setAttribute('role', 'alert'); f.parentElement.appendChild(e); } e.textContent = m || ''; f.classList.toggle('invalid', !!m); };
  async function submit(e, form, method) {
    e.preventDefault(); const f = form.elements, m = method(), msg = $('#coMsg'); msg.textContent = '';
    const phone = RAW.normPhone(f.phone.value), file = $('#proofFile').files[0]; let bad = null;
    const chk = (field, ok, t) => { fe(field, ok ? '' : t); if (!ok && !bad) bad = field; };
    chk(f.name, f.name.value.trim().length >= 3, 'اكتب اسمك بالكامل');
    chk(f.phone, RAW.isPhone(phone), 'اكتب رقم موبايل مصري صحيح');
    chk(f.governorate, !!f.governorate.value, 'اختار المحافظة');
    chk(f.address, f.address.value.trim().length >= 8, 'اكتب العنوان بالتفصيل');
    if (m?.requires_proof && !file && !proofPath) { msg.textContent = 'ارفع صورة التحويل الأول'; bad = bad || $('#proofFile'); }
    if (bad) { bad.focus(); return; }
    const btn = $('#coSubmit'); btn.disabled = true; btn.textContent = 'جاري إرسال الطلب…';
    try {
      if (m.requires_proof && !proofPath) proofPath = await RAW.uploadProof(file);
      const r = await RAW.createOrder({ items: cart.map((i) => ({ variant_id: i.variantId, qty: i.qty, options: { roast: i.roast, grind: i.grind } })),
        payment_method: m.id, proof_path: m.requires_proof ? proofPath : null, coupon: coupon?.code || null, name: f.name.value.trim(), phone,
        governorate: f.governorate.value, address: f.address.value.trim(), notes: f.notes.value.trim(), delivery_time: f.delivery_time.value });
      done(r, m);
    } catch (err) { console.error('[checkout]', err); msg.textContent = RAW.errorText(err); btn.disabled = false; btn.textContent = 'تأكيد الطلب'; }
  }
  function done(r, m) {
    cart = []; saveCart(); renderCart(); try { localStorage.removeItem('rawPendingCoupon'); } catch (_) {}
    const wa = waUrl(`طلب جديد ${r.order_no} — الإجمالي ${money(r.total)} — ${m.name_ar}`);
    $('#coRoot').innerHTML = `<div class="order-done" style="padding:30px"><div class="tick"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>
      <h3>تم استلام طلبك ✔</h3><p>رقم الطلب: <b dir="ltr">${esc(r.order_no)}</b><br>الإجمالي: <b>${money(r.total)}</b></p>
      <p>${m.requires_proof ? 'هنراجع صورة التحويل ونأكد الدفع، وتقدر تتابع حالة طلبك من حسابك.' : 'هنتواصل معاك لتأكيد الطلب، وادفع للمندوب عند الاستلام.'}</p>
      <a class="btn btn-dark" href="account.html">متابعة طلباتي</a>
      <a class="btn btn-whatsapp" href="${wa}" target="_blank" rel="noopener noreferrer">ابعت رقم الطلب على واتساب</a>
      <button class="btn ghost" type="button" id="doneClose">رجوع للمتجر</button></div>`;
    $('#doneClose').addEventListener('click', () => location.reload());
  }
})();

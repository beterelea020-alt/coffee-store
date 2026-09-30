// RAW Coffee — checkout, validation, a11y upgrade layer (runs after script.js)
(() => {
  const $ = (s) => document.querySelector(s);
  const form = $('#checkoutForm');
  const PHONE_RE = /^(?:\+?20|0)?1[0125]\d{8}$/;
  const norm = (p) => p.replace(/[\s-]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const ICON = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    theme: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };
  [['searchBtn', 'search'], ['themeBtn', 'theme'], ['mobileMenuBtn', 'menu']].forEach(([id, k]) => {
    const el = document.getElementById(id); if (el) el.innerHTML = ICON[k];
  });

  // Dialog semantics + accessible close buttons
  ['checkoutModal', 'productModal', 'finderModal', 'searchOverlay'].forEach((id) => {
    const el = document.getElementById(id); if (el) { el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); }
  });
  document.querySelectorAll('.close-btn,.modal-close').forEach((b) => b.setAttribute('aria-label', 'إغلاق'));

  // Autofill + repeat-customer memory
  const ac = { name: 'name', phone: 'tel', address: 'street-address' };
  Object.entries(ac).forEach(([n, v]) => { const f = form.elements[n]; if (f) f.setAttribute('autocomplete', v); });
  try {
    const saved = JSON.parse(localStorage.getItem('rawCoffeeCustomer') || '{}');
    ['name', 'phone', 'city', 'address'].forEach((k) => { if (saved[k] && form.elements[k]) form.elements[k].value = saved[k]; });
  } catch (_) {}

  // Inline validation (error next to the field)
  const setErr = (field, msg) => {
    let e = field.parentElement.querySelector('.field-error');
    if (!e) { e = document.createElement('span'); e.className = 'field-error'; e.setAttribute('role', 'alert'); field.parentElement.appendChild(e); }
    e.textContent = msg || ''; field.classList.toggle('invalid', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  const validate = () => {
    let first = null;
    const chk = (name, ok, msg) => { const f = form.elements[name]; setErr(f, ok ? '' : msg); if (!ok && !first) first = f; };
    chk('name', form.elements.name.value.trim().length >= 3, 'اكتب اسمك بالكامل');
    chk('phone', PHONE_RE.test(norm(form.elements.phone.value)), 'اكتب رقم موبايل مصري صحيح (مثال: 01012345678)');
    chk('city', !!form.elements.city.value, 'اختار المحافظة');
    chk('address', form.elements.address.value.trim().length >= 8, 'اكتب العنوان بالتفصيل (المنطقة والشارع)');
    if (first) first.focus();
    return !first;
  };
  form.addEventListener('input', (e) => { if (e.target.classList.contains('invalid')) setErr(e.target, ''); });
  form.setAttribute('novalidate', '');

  // Submit: validate → open WhatsApp → show confirmation (cart cleared only after)
  form.addEventListener('submit', (e) => {
    e.stopImmediatePropagation(); e.preventDefault();
    if (!cart.length) { showToast('السلة فاضية'); return; }
    if (!validate()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    data.phone = norm(data.phone);
    try { localStorage.setItem('rawCoffeeCustomer', JSON.stringify({ name: data.name, phone: data.phone, city: data.city, address: data.address })); } catch (_) {}
    const msg = buildOrderMessage(data), url = waUrl(msg);
    openWhatsApp(msg);
    cart = []; saveCart(); removeCoupon();
    const card = document.querySelector('#checkoutModal .modal-card');
    card.innerHTML = `<div class="order-done"><div class="tick"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>
      <h3>طلبك اتجهّز ✔</h3><p>ابعت الرسالة على واتساب وهنأكد معاك الطلب فورًا.</p>
      <a class="btn btn-whatsapp" href="${url}" target="_blank" rel="noopener noreferrer">لو واتساب ماتفتحش، اضغط هنا</a>
      <button class="btn" type="button" id="copyOrder">نسخ تفاصيل الطلب</button>
      <button class="btn" type="button" id="doneClose">رجوع للمتجر</button><small>الدفع عند الاستلام أو حسب اتفاقك مع فريق المبيعات.</small></div>`;
    $('#copyOrder').onclick = () => navigator.clipboard?.writeText(msg).then(() => showToast('تم نسخ الطلب'));
    $('#doneClose').onclick = () => location.reload();
  }, true);

  // Cart drawer sits above modals (z-index) — close it when checkout opens so the form is reachable
  $('#checkoutBtn')?.addEventListener('click', () => { if (!$('#checkoutModal').hidden) closeCart(); });

  // Floating WhatsApp button
  const wa = document.createElement('a');
  wa.className = 'wa-float'; wa.target = '_blank'; wa.rel = 'noopener noreferrer'; wa.setAttribute('aria-label', 'كلمنا على واتساب');
  wa.href = waUrl('مرحبًا، عندي استفسار عن القهوة ☕');
  wa.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.5.3.1.2.1.8-.1 1.4z"/></svg>';
  document.body.appendChild(wa);

  // Lazy-load + async decode for every image (also those rendered later)
  const lazy = () => document.querySelectorAll('img:not([loading])').forEach((i) => { i.loading = 'lazy'; i.decoding = 'async'; });
  lazy(); new MutationObserver(lazy).observe(document.body, { childList: true, subtree: true });

  // ---- Coupons: announcement bar, ?coupon= link, remove button, one-time use ----
  $('#removeCoupon').addEventListener('click', () => { removeCoupon(); showToast('تم إلغاء الكود'); });
  const ar = validateCoupon(ANNOUNCED_COUPON);
  const bar = document.querySelector('#announcement > div');
  if (ar.ok && bar) {
    bar.innerHTML = `<b>كود خصم:</b> ${couponLabel(ar.coupon)} — اضغط لتفعيل <button type="button" class="coupon-chip" data-announce="${ar.coupon.code}">${ar.coupon.code}</button>`;
  }
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-announce]');
    if (chip) { navigator.clipboard?.writeText(chip.dataset.announce).catch(() => {}); applyCoupon(chip.dataset.announce); }
  });
  const urlCode = new URLSearchParams(location.search).get('coupon');
  if (urlCode) applyCoupon(urlCode);
})();

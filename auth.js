// RAW Coffee — customer auth UI (phone+password / Google). Works on store, account and admin pages.
window.rawToast = function (m) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = m; el.classList.add('show'); clearTimeout(window.__tt); window.__tt = setTimeout(() => el.classList.remove('show'), 2600);
};
(() => {
  if (!window.RAW || !RAW.enabled) return;
  const $ = (s) => document.querySelector(s);
  const page = document.body.dataset.page || 'store';
  let mode = 'login', after = null;
  const modal = document.createElement('div');
  modal.className = 'modal'; modal.id = 'authModal'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="modal-card auth-card stack">
    <button class="close-btn modal-close" id="authClose" type="button" aria-label="إغلاق">×</button>
    <span class="eyebrow dark">RAW ACCOUNT</span><h3 id="authTitle">تسجيل الدخول</h3>
    <div class="tabs"><button type="button" data-m="login" class="active">دخول</button><button type="button" data-m="register">حساب جديد</button></div>
    <form id="authForm" novalidate>
      <label id="authNameRow" hidden>الاسم الكامل<input name="name" autocomplete="name" placeholder="أحمد محمد"></label>
      <label>رقم الموبايل<input name="phone" inputmode="tel" autocomplete="tel" placeholder="01xxxxxxxxx"></label>
      <label>كلمة المرور<input name="password" type="password" autocomplete="current-password" placeholder="6 أحرف على الأقل"></label>
      <p class="form-msg" id="authMsg" role="alert"></p>
      <button class="btn btn-dark full" id="authSubmit" type="submit">دخول</button>
    </form>
    <div class="or"><span>أو</span></div>
    <button class="btn google-btn full" id="googleBtn" type="button"><b class="g">G</b> المتابعة بحساب Google</button></div>`;
  document.body.appendChild(modal);
  const msg = (t, ok) => { const m = $('#authMsg'); m.textContent = t || ''; m.classList.toggle('ok', !!ok); };
  const setMode = (m) => {
    mode = m; modal.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.m === m));
    $('#authNameRow').hidden = m !== 'register'; $('#authTitle').textContent = m === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد';
    $('#authSubmit').textContent = m === 'login' ? 'دخول' : 'إنشاء الحساب';
    $('#authForm').elements.password.autocomplete = m === 'login' ? 'current-password' : 'new-password'; msg('');
  };
  const close = () => { modal.hidden = true; document.body.classList.remove('no-scroll'); };
  window.openAuth = (cb) => { after = cb || null; setMode('login'); modal.hidden = false; document.body.classList.add('no-scroll'); setTimeout(() => $('#authForm').elements.phone.focus(), 50); };
  modal.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.m)));
  $('#authClose').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  $('#googleBtn').addEventListener('click', () => RAW.signInGoogle().catch(() => msg('تعذّر الدخول بجوجل، جرّب لاحقًا')));
  $('#authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.currentTarget.elements, phone = RAW.normPhone(f.phone.value), name = f.name.value.trim(), password = f.password.value;
    if (mode === 'register' && name.length < 3) return msg('اكتب اسمك بالكامل');
    if (!RAW.isPhone(phone)) return msg('اكتب رقم موبايل مصري صحيح (مثال: 01012345678)');
    if (password.length < 6) return msg('كلمة المرور 6 أحرف على الأقل');
    const btn = $('#authSubmit'); btn.disabled = true;
    try {
      if (mode === 'register') { const r = await RAW.signUp({ name, phone, password }); if (!r.session) await RAW.signIn({ phone, password }); }
      else await RAW.signIn({ phone, password });
      close(); rawToast('أهلًا بيك'); const cb = after; after = null;
      if (cb) cb(); else if (page !== 'store') location.reload();
    } catch (err) {
      msg(/already/i.test(err.message) ? 'الرقم ده متسجل قبل كده — سجّل دخول' : /invalid login/i.test(err.message) ? 'رقم الموبايل أو كلمة المرور غلط' : /rate|many/i.test(err.message) ? 'محاولات كتير، استنى شوية' : 'حصل خطأ، حاول تاني');
    } finally { btn.disabled = false; }
  });
  if (page === 'store') {
    const box = document.querySelector('.header-actions'), b = document.createElement('button');
    b.id = 'accountBtn'; b.className = 'icon-btn'; b.setAttribute('aria-label', 'حسابي');
    b.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
    box.insertBefore(b, box.querySelector('#cartBtn'));
    b.addEventListener('click', async () => { (await RAW.session()) ? (location.href = 'account.html') : openAuth(); });
  }
})();

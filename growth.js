/* RAW Coffee — Growth Layer: أقسام ثقة + بيع + SEO. مضافة فوق الكود بدون كسره. */
(function(){
  const W = () => (typeof STORE_CONFIG !== 'undefined' ? STORE_CONFIG.whatsappNumber : '201224886344');
  const wa = (t) => 'https://wa.me/' + W() + '?text=' + encodeURIComponent(t);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const toast = (m) => { try { showToast(m); } catch(_) {} };
  const before = (sel, html) => { const el = document.querySelector(sel); if (!el) return; el.insertAdjacentHTML('beforebegin', html); };

  /* ---------- 1) طرق الدفع ---------- */
  const payHTML = `<section class="gx-pay"><div class="container gx-pay-in"><b>ادفع بالطريقة اللي تريحك:</b>
    <span>💵 الدفع عند الاستلام</span><span>📱 فودافون كاش</span><span>⚡ إنستاباي</span><span>🏦 تحويل بنكي</span><span>💬 تأكيد واتساب</span></div></section>`;

  /* ---------- 2) بوكسات وهدايا ---------- */
  const SB = !!(window.RAW && RAW.enabled);
  const BUNDLES = SB ? [] : [
    {n:'بوكس التجربة', d:'منتجين تختارهم من أكتر الأصناف طلبًا — مناسب لأول مرة.', ids:[1,2]},
    {n:'بوكس البيت', d:'تشكيلة تكفي الأسرة شهر: فاتح + وسط + غامق.', ids:[1,2,3]},
    {n:'بوكس الهدية', d:'تغليف أنيق مع كارت إهداء. اكتب الرسالة في ملاحظات الطلب.', ids:[2,3], gift:true}
  ];
  function bundlesHTML(){
    const items = BUNDLES.map((b,i) => {
      const ps = b.ids.map(id => products.find(p => p.id === id)).filter(Boolean);
      if (!ps.length) return '';
      const total = ps.reduce((s,p) => s + p.price, 0);
      return `<article class="gx-card"><span class="gx-tag">${b.gift?'🎁 هدية':'وفّر وقتك'}</span><h3>${b.n}</h3><p>${b.d}</p>
        <ul>${ps.map(p => `<li>${esc(p.name)} — ${p.weight}g</li>`).join('')}</ul>
        <div class="gx-row"><strong>${money(total)}</strong><button class="btn btn-dark" data-bundle="${i}">أضف البوكس للسلة</button></div></article>`;
    }).join('');
    if (!items) return '';
    return `<section class="section" id="bundles"><div class="container"><div class="section-head"><div><span class="eyebrow dark">BUNDLES & GIFTS</span><h2>بوكسات جاهزة وهدايا</h2></div><p>اختيارات سريعة للي مش عايز يحتار، أو عايز يهادي حد.</p></div><div class="gx-grid">${items}</div></div></section>`;
  }

  /* ---------- 3) دليل التحضير ---------- */
  const GUIDES = {
    'تركي': ['طحن ناعم جدًا','1 معلقة صغيرة لكل فنجان (7g)','ميه باردة في كنكة، نار هادية','ارفعها لما تطلع الرغوة مرتين'],
    'إسبريسو': ['طحن ناعم','18g بن → 36g مشروب','92–94°م، ضغط 9 بار','مدة الاستخلاص 25–30 ثانية'],
    'فلتر': ['طحن وسط','60g بن لكل لتر ميه','93°م، صب دائري على مراحل','مدة التحضير 3–4 دقايق'],
    'فرنسي': ['طحن خشن','30g بن لكل 500ml ميه','ميه ساخنة 94°م','اتركها 4 دقايق ثم اضغط ببطء']
  };
  function guideHTML(){
    const tabs = Object.keys(GUIDES);
    return `<section class="section soft-band" id="brew-guide"><div class="container"><div class="section-head compact"><div><span class="eyebrow dark">BREW GUIDE</span><h2>حضّرها صح في البيت</h2></div></div>
      <div class="gx-tabs" role="tablist">${tabs.map((t,i) => `<button class="${i?'':'on'}" data-gtab="${t}">${t}</button>`).join('')}</div>
      <ul class="gx-guide" id="gxGuide">${GUIDES[tabs[0]].map(x => `<li>${x}</li>`).join('')}</ul></div></section>`;
  }

  /* ---------- 4) آراء العملاء (نماذج — استبدلها بآراء حقيقية) ---------- */
  const REVIEWS = SB ? [] : [
    ['أحمد م.','دمياط','البن الوسط ريحته تملا البيت، والطحن اتضبط زي ما طلبت.'],
    ['منى س.','القاهرة','التغليف ممتاز والتوصيل كان في معاده. هطلب تاني.'],
    ['كريم ع.','الإسكندرية','الإسبريسو متوازن وكريما حلوة. أحسن من اللي كنت بشتريه.']
  ];
  const reviewsHTML = () => !REVIEWS.length ? '' : `<section class="section" id="reviews"><div class="container"><div class="section-head compact"><div><span class="eyebrow dark">REVIEWS</span><h2>العملاء بيقولوا إيه</h2></div></div>
    <div class="gx-grid">${REVIEWS.map(r => `<blockquote class="gx-card"><div class="gx-stars">★★★★★</div><p>${r[2]}</p><footer>${r[0]} — ${r[1]}</footer></blockquote>`).join('')}</div></div></section>`;

  /* ---------- 5) اشتراك شهري + 6) جملة للكافيهات ---------- */
  const extraHTML = `<section class="section soft-band" id="plans"><div class="container gx-grid gx-two">
    <article class="gx-card"><span class="gx-tag">اشتراك شهري</span><h3>قهوتك توصلك كل شهر</h3><p>اختار الصنف والوزن والطحنة مرة واحدة، ونوصّلك تجديدًا شهريًا من غير ما تفتكر.</p>
      <form class="gx-form" data-gx="sub"><input required name="name" placeholder="الاسم"><input required name="phone" inputmode="tel" placeholder="01xxxxxxxxx">
      <select name="plan"><option>250g شهريًا</option><option>500g شهريًا</option><option>1kg شهريًا</option></select><button class="btn btn-dark">اشترك عبر واتساب</button></form></article>
    <article class="gx-card"><span class="gx-tag">للكافيهات والمكاتب</span><h3>أسعار جملة</h3><p>كميات منتظمة، فواتير، وتوريد دوري للكافيهات والمطاعم والشركات.</p>
      <form class="gx-form" data-gx="b2b"><input required name="name" placeholder="اسم النشاط"><input required name="phone" inputmode="tel" placeholder="01xxxxxxxxx">
      <select name="qty"><option>أقل من 10 كجم/شهر</option><option>10–50 كجم/شهر</option><option>أكثر من 50 كجم/شهر</option></select><button class="btn btn-dark">اطلب عرض سعر</button></form></article></div></section>`;

  /* ---------- 7) السياسات ---------- */
  const POL = {
    shipping:['الشحن والتوصيل','التوصيل لكل محافظات مصر خلال 2–5 أيام عمل. الشحن مجاني فوق حد الشحن المجاني المعلن في السلة. هتتواصل معاك شركة الشحن قبل الوصول.'],
    returns:['الاستبدال والاسترجاع','منتجات القهوة المفتوحة لا تُسترجع لأسباب صحية، لكن لو وصلك منتج تالف أو غير مطابق كلّمنا خلال 48 ساعة من الاستلام ونستبدله فورًا.'],
    privacy:['الخصوصية','بنستخدم بياناتك (الاسم، الموبايل، العنوان) لتنفيذ طلبك والتواصل معاك فقط، ولا نشاركها مع أي طرف خارج شركة الشحن.']
  };
  function openPolicy(k){
    const p = POL[k]; if (!p) return;
    let m = document.getElementById('gxPolicy');
    if (!m) { m = document.createElement('div'); m.id = 'gxPolicy'; m.className = 'gx-modal'; document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-gxclose]')) m.hidden = true; }); }
    m.innerHTML = `<div class="gx-modal-card"><button class="close-btn" data-gxclose aria-label="إغلاق">×</button><h3>${p[0]}</h3><p>${p[1]}</p></div>`;
    m.hidden = false;
  }

  /* ---------- 8) بوب-أب الكوبون + شريط الموبايل السفلي ---------- */
  function welcomePopup(){
    try { if (localStorage.getItem('rawGxWelcome')) return; } catch(_) {}
    setTimeout(() => {
      const code = SB ? String(GX.settings.announced_coupon || '').replace(/[^\w-]/g, '') : 'RAW10';
      if (!code) return;
      const m = document.createElement('div'); m.className = 'gx-modal'; m.id = 'gxWelcome';
      m.innerHTML = `<div class="gx-modal-card"><button class="close-btn" data-gxclose aria-label="إغلاق">×</button><span class="gx-tag">أهلاً بيك ☕</span><h3>عندك كود خصم</h3><p>الكود <b dir="ltr">${code}</b> — فعّله دلوقتي واستخدمه في طلبك.</p>
        <button class="btn btn-dark full" id="gxApply">فعّل الخصم الآن</button></div>`;
      document.body.appendChild(m);
      const close = () => { m.remove(); try { localStorage.setItem('rawGxWelcome','1'); } catch(_) {} };
      m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-gxclose]')) close(); });
      m.querySelector('#gxApply').onclick = () => { try { applyCoupon(code); } catch(_) {} close(); };
    }, 25000);
  }
  function mobileBar(){
    const b = document.createElement('nav'); b.className = 'gx-bar'; b.setAttribute('aria-label','تنقل سريع');
    b.innerHTML = `<a href="#home">🏠<span>الرئيسية</span></a><a href="#shop">☕<span>المتجر</span></a><a href="#" data-gxcart>🛒<span>السلة</span></a><a href="${wa('أهلاً، عندي سؤال عن القهوة')}" target="_blank" rel="noopener">💬<span>واتساب</span></a>`;
    document.body.appendChild(b);
  }

  /* ---------- 9) SEO + PWA ---------- */
  function seo(){
    const ld = {'@context':'https://schema.org','@graph':[
      {'@type':'Store','name':'RAW Coffee House','description':'متجر قهوة مصري: بن سادة، محوج، فرنسي، إسبريسو وقهوة عربية.','areaServed':'EG','priceRange':'EGP','telephone':'+' + W()},
      {'@type':'FAQPage','mainEntity':(typeof faqs !== 'undefined' ? faqs : []).map(f => ({'@type':'Question','name':f[0],'acceptedAnswer':{'@type':'Answer','text':f[1]}}))}
    ]};
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  }

  /* ---------- تحرير من لوحة الأدمن ---------- */
  const GX = window.GX = { REVIEWS, BUNDLES, POL, settings: {} };
  GX.refresh = function(){
    ['bundles','reviews'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });
    before('#brew-guide', bundlesHTML());
    before('#plans', reviewsHTML());
  };

  /* ---------- تركيب ---------- */
  function mount(){
    before('#collections', payHTML);
    before('#why-us', guideHTML());
    before('#faq', extraHTML);
    GX.refresh();
    document.querySelectorAll('[data-policy]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openPolicy(a.dataset.policy); }));
    document.addEventListener('click', e => {
      const bn = e.target.closest('[data-bundle]');
      if (bn) { BUNDLES[+bn.dataset.bundle].ids.forEach(id => { if (products.find(p => p.id === id)) addToCart(id); }); toast('اتضاف البوكس للسلة'); try { openCart(); } catch(_) {} return; }
      const gt = e.target.closest('[data-gtab]');
      if (gt) { document.querySelectorAll('[data-gtab]').forEach(x => x.classList.toggle('on', x === gt));
        document.getElementById('gxGuide').innerHTML = GUIDES[gt.dataset.gtab].map(x => `<li>${x}</li>`).join(''); return; }
      if (e.target.closest('[data-gxcart]')) { e.preventDefault(); try { openCart(); } catch(_) {} }
    });
    document.addEventListener('submit', e => {
      const f = e.target.closest('[data-gx]'); if (!f) return; e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      if (!/^01[0125][0-9]{8}$/.test(String(d.phone).replace(/\s/g,''))) { toast('اكتب رقم موبايل مصري صحيح'); return; }
      const msg = f.dataset.gx === 'sub'
        ? `طلب اشتراك شهري\nالاسم: ${d.name}\nالموبايل: ${d.phone}\nالخطة: ${d.plan}`
        : `طلب عرض سعر جملة\nالنشاط: ${d.name}\nالموبايل: ${d.phone}\nالكمية: ${d.qty}`;
      window.open(wa(msg), '_blank', 'noopener,noreferrer');
    });
    mobileBar(); welcomePopup(); seo();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

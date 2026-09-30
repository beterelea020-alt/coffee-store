/* RAW Coffee — يطبّق محتوى الموقع اللي الأدمن بيعدّله (تبويب "محتوى الموقع"). يعمل فقط مع Supabase. */
(function(){
  if (!window.RAW || !RAW.enabled) return;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const lines = (v) => String(v || '').split('\n').map(x => x.trim()).filter(Boolean);
  const cells = (l) => l.split('|').map(x => x.trim());
  const safeUrl = (u) => /^https?:\/\//i.test(u) ? u : '';
  (async () => {
    let st; try { st = await RAW.settings(); } catch (_) { return; }
    if (window.GX) GX.settings = st;

    // الواجهة الرئيسية
    if (st.hero_eyebrow) { const e = $('.hero-content .eyebrow'); if (e) e.textContent = st.hero_eyebrow; }
    if (st.hero_title) { const h = $('.hero-content h1'), l = lines(st.hero_title); if (h && l.length) h.innerHTML = esc(l[0]) + (l[1] ? '<br><em>' + esc(l.slice(1).join(' ')) + '</em>' : ''); }
    if (st.hero_text) { const p = $('.hero-content > p'); if (p) p.textContent = st.hero_text; }
    // القصة
    if (st.story_title) { const e = $('.story-copy h2'); if (e) e.textContent = st.story_title; }
    if (st.story_text) { const e = $('.story-copy > p'); if (e) e.textContent = st.story_text; }
    // التواصل والفوتر
    if (st.contact_phone) { const a = $('a[href^="tel:"]'); if (a) { a.href = 'tel:' + st.contact_phone.replace(/[^\d+]/g, ''); const s = a.querySelector('strong'); if (s) s.textContent = st.contact_phone; } }
    if (st.contact_email) { const a = $('a[href^="mailto:"]'); if (a) { a.href = 'mailto:' + st.contact_email; const s = a.querySelector('strong'); if (s) s.textContent = st.contact_email; } }
    [['Instagram','social_instagram'],['Facebook','social_facebook'],['TikTok','social_tiktok']].forEach(([n, k]) => { const a = $(`.footer a[aria-label="${n}"]`), u = safeUrl(st[k] || ''); if (a && u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; } });
    if (st.footer_tagline) { const p = $('.footer-brand p'); if (p) p.textContent = st.footer_tagline; }
    // الأسئلة الشائعة
    const fq = lines(st.faq_list).map(cells).filter(c => c.length >= 2).map(c => [esc(c[0]), esc(c.slice(1).join(' | '))]);
    if (fq.length && typeof faqs !== 'undefined') { faqs.splice(0, faqs.length, ...fq); if (typeof initFaq === 'function') initFaq(); }

    if (!window.GX) return;
    // آراء + بوكسات + سياسات
    GX.REVIEWS.splice(0, GX.REVIEWS.length, ...lines(st.reviews_list).map(cells).filter(c => c.length >= 3).map(c => [esc(c[0]), esc(c[1]), esc(c.slice(2).join(' | '))]));
    GX.BUNDLES.splice(0, GX.BUNDLES.length, ...lines(st.bundles_list).map(cells).filter(c => c[0]).map(c => ({ n: esc(c[0]), d: esc(c[1] || ''), ids: (c[2] || '').split(/[,،\s]+/).map(Number).filter(Boolean), gift: c[3] === '1' })));
    [['shipping','policy_shipping'],['returns','policy_returns'],['privacy','policy_privacy']].forEach(([k, s]) => { if (st[s]) GX.POL[k][1] = esc(st[s]); });

    // انتظر تحميل المنتجات (عشان البوكسات) والشريط العلوي (عشان ما يتكتبش فوقه)
    let n = 0;
    const t = setInterval(() => {
      if ((typeof products !== 'undefined' && products.some(p => p.variants)) || ++n > 40) {
        clearInterval(t);
        if (st.announcement_text) { const b = $('#announcement > div'); if (b) b.textContent = st.announcement_text; }
        GX.refresh();
      }
    }, 250);
  })();
})();

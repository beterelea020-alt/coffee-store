// RAW Coffee — catalog/cart from Supabase (variants = weight-based price + stock). Inactive if keys are empty.
(() => {
  if (!window.RAW || !RAW.enabled) return;
  const $ = (s) => document.querySelector(s);
  COUPONS.length = 0; appliedCoupon = null; try { localStorage.removeItem('rawCoffeeCoupon'); } catch (_) {}   // كوبونات السيرفر بس
  products.length = 0; renderShop(); renderCollections();
  $('#emptyState').textContent = 'جاري تحميل المنتجات…';

  const mapProduct = (p) => {
    const vs = (p.product_variants || []).filter((v) => v.is_active).sort((a, b) => (a.sort - b.sort) || (a.weight_g - b.weight_g));
    const v0 = vs[0] || {};
    return { id: p.id, name: p.name_ar, category: p.category_id, price: Number(v0.price || 0), oldPrice: v0.old_price ? Number(v0.old_price) : null,
      badge: p.badge_ar || '', weight: v0.weight_g || 1, roast: p.roast || '', taste: p.taste, brew: p.brew, desc: p.desc_ar || '', image: p.image_url || '',
      weights: vs.map((v) => v.weight_g || 1), roasts: p.roasts && p.roasts.length ? p.roasts : [''],
      variants: Object.fromEntries(vs.map((v) => [v.weight_g || 1, { id: v.id, price: Number(v.price), stock: v.stock }])) };
  };

  window.addToCart = function (id, o = {}) {
    const p = products.find((x) => x.id === Number(id)); if (!p) return;
    const weight = o.weight || p.weight, v = p.variants[weight]; if (!v) { showToast('الوزن غير متاح'); return; }
    if (v.stock <= 0) { showToast('نفد من المخزون'); return; }
    const roast = o.roast ?? p.roast, grind = o.grind || 'تركي ناعم', qty = o.qty || 1, key = `${p.id}-${weight}-${roast}-${grind}`;
    const f = cart.find((i) => i.key === key);
    if ((f ? f.qty : 0) + qty > v.stock) { showToast(`المتاح ${v.stock} فقط`); return; }
    if (f) f.qty += qty; else cart.push({ key, id: p.id, variantId: v.id, name: p.name, category: p.category, price: v.price, image: p.image, weight, roast, grind, qty });
    saveCart(); renderCart(); showToast('تمت إضافة المنتج إلى السلة'); openCart();
  };
  window.renderModalOptions = function (p) {
    const v = p.variants[currentWeight] || p.variants[p.weights[0]];
    $('#weightOptions').innerHTML = p.weights.map((w) => `<button class="option-pill ${w === currentWeight ? 'active' : ''}" data-weight="${w}">${w === 1 ? 'أداة' : w + ' جم'}</button>`).join('');
    $('#roastOptions').innerHTML = p.roasts.filter(Boolean).map((r) => `<button class="option-pill ${r === currentRoast ? 'active' : ''}" data-roast="${r}">${r}</button>`).join('');
    $('#modalPrice').textContent = money(v.price) + (v.stock <= 0 ? ' — نفد' : v.stock <= 5 ? ` — باقي ${v.stock}` : '');
    $('#modalAdd').disabled = v.stock <= 0;
  };
  const _rc = window.renderCart;
  window.renderCart = function () { _rc(); $('#cartShipping').textContent = 'يُحسب عند الدفع'; $('#cartTotal').textContent = money(getSubtotal()); $('#discountRow').hidden = true; };
  window.applyCoupon = function (code) {   // الكود بيتحفظ ويتفعّل في صفحة الدفع (السيرفر هو اللي يتحقق)
    const c = String(typeof code === 'string' ? code : '').trim().toUpperCase(); if (!c) return;
    try { localStorage.setItem('rawPendingCoupon', c); } catch (_) {}
    showToast(`تم حفظ الكود ${c} — هيتفعّل في صفحة الدفع`);
  };
  document.querySelector('.coupon-row').hidden = true;

  (async () => {
    try {
      const [{ categories: cs, products: ps }, st] = await Promise.all([RAW.loadCatalog(), RAW.settings()]);
      products.splice(0, products.length, ...ps.map(mapProduct).filter((p) => p.weights.length));
      categories.splice(1, categories.length - 1, ...cs.filter((c) => c.id !== 'عروض وباكدجات').map((c) => ({ id: c.id, name: c.name_ar, count: '', image: c.image_url })));
      if (st.whatsapp_number) STORE_CONFIG.whatsappNumber = st.whatsapp_number;
      if (st.free_shipping_threshold != null) STORE_CONFIG.freeShippingThreshold = Number(st.free_shipping_threshold);
      const bar = document.querySelector('#announcement > div');
      if (bar) bar.innerHTML = st.announced_coupon
        ? `<b>كود خصم:</b> اضغط لحفظ الكود <button type="button" class="coupon-chip" data-announce="${String(st.announced_coupon).replace(/[^\w-]/g, '')}">${String(st.announced_coupon).replace(/[^\w-]/g, '')}</button> واستخدمه عند الدفع`
        : `<b>شحن مجاني</b> للطلبات من ${money(STORE_CONFIG.freeShippingThreshold)}`;
      cart = cart.map((i) => { const p = products.find((x) => x.id === i.id), v = p && p.variants[i.weight]; return v ? { ...i, price: v.price, variantId: v.id } : null; }).filter(Boolean);
      saveCart(); $('#emptyState').textContent = 'مفيش منتجات مطابقة حاليًا. جرّب تشيل فلتر أو تغيّر البحث.';
      renderCollections(); renderShop(); renderCart();
      const u = new URLSearchParams(location.search).get('coupon'); if (u) applyCoupon(u);
    } catch (e) { $('#emptyState').textContent = 'تعذّر تحميل المنتجات. حدّث الصفحة وحاول تاني.'; $('#emptyState').hidden = false; }
  })();
})();

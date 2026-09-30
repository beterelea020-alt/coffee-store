// RAW Coffee — Supabase data layer. لو المفاتيح فاضية الموقع بيشتغل بالبيانات الثابتة.
(() => {
  const C = window.RAW_CONFIG || {};
  const enabled = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);
  const sb = enabled ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
  const need = () => { if (!sb) throw new Error('BACKEND_NOT_CONFIGURED'); return sb; };
  const ok = ({ data, error }) => { if (error) throw error; return data; };

  const normPhone = (v) => String(v || '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s-]/g, '').replace(/^\+?20/, '0');
  const isPhone = (v) => /^01[0125]\d{8}$/.test(normPhone(v));
  const phoneEmail = (v) => `${normPhone(v)}@${C.PHONE_EMAIL_DOMAIN}`;

  window.RAW = {
    enabled, client: sb, normPhone, isPhone,
    // ---- Auth ----
    signUp: async ({ name, phone, password }) => ok(await need().auth.signUp({ email: phoneEmail(phone), password, options: { data: { full_name: name, phone: normPhone(phone) } } })),
    signIn: async ({ phone, password }) => ok(await need().auth.signInWithPassword({ email: phoneEmail(phone), password })),
    signInGoogle: async () => ok(await need().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } })),
    signOut: async () => ok(await need().auth.signOut()),
    session: async () => (sb ? (await sb.auth.getSession()).data.session : null),
    onAuth: (fn) => sb && sb.auth.onAuthStateChange((_e, s) => fn(s)),
    profile: async () => { const s = await window.RAW.session(); if (!s) return null; return ok(await need().from('profiles').select('*').eq('id', s.user.id).single()); },
    updateProfile: async (patch) => { const s = await window.RAW.session(); return ok(await need().from('profiles').update({ full_name: patch.full_name, phone: patch.phone }).eq('id', s.user.id)); },
    isAdmin: async () => { const p = await window.RAW.profile().catch(() => null); return p?.role === 'admin'; },
    // ---- Catalog & settings ----
    loadCatalog: async () => {
      const [cats, prods] = await Promise.all([
        need().from('categories').select('*').order('sort'),
        need().from('products').select('*, product_variants(*)').order('id')]);
      return { categories: ok(cats), products: ok(prods) };
    },
    settings: async () => Object.fromEntries(ok(await need().from('store_settings').select('*')).map((r) => [r.key, r.value])),
    shippingZones: async () => ok(await need().from('shipping_zones').select('*').eq('is_active', true).order('governorate')),
    paymentMethods: async () => ok(await need().from('payment_methods').select('*').eq('is_active', true).order('sort')),
    // ---- Checkout ----
    validateCoupon: async (code, subtotal, shipping = 0) => ok(await need().rpc('validate_coupon', { p_code: code, p_subtotal: subtotal, p_shipping: shipping })),
    uploadProof: async (file) => {
      if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('BAD_FILE_TYPE');
      if (file.size > 5 * 1024 * 1024) throw new Error('FILE_TOO_LARGE');
      const s = await window.RAW.session(); if (!s) throw new Error('AUTH_REQUIRED');
      const path = `${s.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${file.type.split('/')[1]}`;
      const { error } = await need().storage.from('payment-proofs').upload(path, file, { contentType: file.type });
      if (error) throw error; return path;
    },
    createOrder: async (payload) => ok(await need().rpc('create_order', { p: payload })),
    // ---- Customer orders ----
    myOrders: async () => ok(await need().from('orders').select('*, order_items(*)').order('created_at', { ascending: false })),
    orderStatuses: async () => ok(await need().from('order_statuses').select('*').order('sort')),
    watchOrders: (fn) => sb && sb.channel('orders-live').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fn).subscribe(),
    proofUrl: async (path) => ok(await need().storage.from('payment-proofs').createSignedUrl(path, 300)).signedUrl,
    // ---- Friendly error text ----
    errorText: (e) => ({ AUTH_REQUIRED: 'سجّل دخولك الأول', EMPTY_CART: 'السلة فاضية', PROOF_REQUIRED: 'ارفع صورة التحويل الأول', BAD_CUSTOMER: 'راجع الاسم والموبايل والعنوان', BAD_GOVERNORATE: 'المحافظة غير متاحة للشحن', BAD_PAYMENT: 'طريقة الدفع غير متاحة', BAD_ITEM: 'منتج غير متاح حاليًا', BAD_QTY: 'الكمية غير صحيحة', COUPON_INVALID: 'كود الخصم غير صحيح', COUPON_EXPIRED: 'الكود انتهت مدته', COUPON_NOT_STARTED: 'الكود لسه مابدأش', COUPON_EXHAUSTED: 'الكود خلّص عدد استخداماته', COUPON_ALREADY_USED: 'انت استخدمت الكود ده قبل كده', COUPON_MIN_SUBTOTAL: 'الطلب أقل من الحد الأدنى للكود', BAD_FILE_TYPE: 'الصورة لازم تكون JPG أو PNG أو WEBP', FILE_TOO_LARGE: 'الصورة أكبر من 5MB' }[(e?.message || '').split(':')[0]] || (/OUT_OF_STOCK/.test(e?.message || '') ? 'كمية غير متوفرة في المخزون' : 'حصل خطأ، حاول تاني'))
  };
})();

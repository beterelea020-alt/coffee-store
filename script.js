// ============================================================
// RAW Coffee Store — reusable front-end commerce template
// Replace the STORE_CONFIG + products arrays for the final client.
// ============================================================
const STORE_CONFIG = {
  brand: 'RAW Coffee House',
  whatsappNumber: '201224886344',
  currency: 'ج.م',
  shipping: 70,
  freeShippingThreshold: 600
};

const categories = [
  { id:'all', name:'الكل', count:'', image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85' },
  { id:'بن سادة', name:'بن سادة', count:'', image:'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=85' },
  { id:'بن محوج', name:'بن محوج', count:'', image:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=85' },
  { id:'بن فرنسي', name:'بن فرنسي', count:'', image:'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=1000&q=85' },
  { id:'إسبريسو', name:'إسبريسو', count:'', image:'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=1000&q=85' },
  { id:'قهوة عربي', name:'قهوة عربي', count:'', image:'https://images.unsplash.com/photo-1522992319-0365e5f11656?auto=format&fit=crop&w=1000&q=85' },
  { id:'أدوات القهوة', name:'أدوات القهوة', count:'', image:'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=1000&q=85' }
];

const products = [
  {id:1,name:'بن ساده فاتح',category:'بن سادة',price:140,oldPrice:null,badge:'رائج',weight:250,roast:'فاتح',taste:'balanced',brew:'turkish',desc:'مذاق متوازن ولمسة عطرية خفيفة، مناسب للقهوة اليومية.',image:'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=88',weights:[250,500,1000],roasts:['فاتح','وسط','غامق']},
  {id:2,name:'بن ساده وسط',category:'بن سادة',price:280,oldPrice:null,badge:'رائج',weight:500,roast:'وسط',taste:'balanced',brew:'turkish',desc:'توازن واضح بين قوة الفنجان وحلاوة التحميص.',image:'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=88',weights:[250,500,1000],roasts:['فاتح','وسط','غامق']},
  {id:3,name:'بن ساده غامق',category:'بن سادة',price:600,oldPrice:null,badge:'لعشاق القوي',weight:1000,roast:'غامق',taste:'strong',brew:'turkish',desc:'تحميص غامق لعشاق الفنجان القوي والنهاية الطويلة.',image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=88',weights:[250,500,1000],roasts:['وسط','غامق']},
  {id:4,name:'بن محوج كلاسيك',category:'بن محوج',price:165,oldPrice:null,badge:'اختيار البيت',weight:250,roast:'غامق',taste:'spiced',brew:'turkish',desc:'مزيج محوج بطابع مصري واضح ومناسب للقهوة اليومية.',image:'https://images.unsplash.com/photo-1461988091159-192b6df7054f?auto=format&fit=crop&w=900&q=88',weights:[250,500,1000],roasts:['وسط','غامق']},
  {id:5,name:'بن محوج وسط',category:'بن محوج',price:330,oldPrice:null,badge:'الأكثر طلبًا',weight:500,roast:'وسط',taste:'spiced',brew:'turkish',desc:'قهوة متوازنة مع رائحة بهارات خفيفة.',image:'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=88',weights:[250,500,1000],roasts:['وسط','غامق']},
  {id:6,name:'بن محوج غامق',category:'بن محوج',price:620,oldPrice:null,badge:'',weight:1000,roast:'غامق',taste:'strong',brew:'turkish',desc:'خلطة أغنى لعشاق المحوج الثقيل والفنجان القوي.',image:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=88',weights:[250,500,1000],roasts:['غامق']},
  {id:7,name:'بن فرنسي بندق',category:'بن فرنسي',price:155,oldPrice:null,badge:'رائج',weight:250,roast:'وسط',taste:'smooth',brew:'french',desc:'نكهة بندق ناعمة ولمسة عطرية دافئة.',image:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=88',weights:[250,500],roasts:['وسط','غامق']},
  {id:8,name:'بن فرنسي شوكولاتة',category:'بن فرنسي',price:155,oldPrice:null,badge:'',weight:250,roast:'وسط',taste:'smooth',brew:'french',desc:'نكهة غنية بلمسة شوكولاتة محببة.',image:'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=88',weights:[250,500],roasts:['وسط','غامق']},
  {id:9,name:'بن فرنسي كراميل',category:'بن فرنسي',price:165,oldPrice:null,badge:'جديد',weight:250,roast:'وسط',taste:'smooth',brew:'french',desc:'ملمس ناعم ونهاية حلوة مناسبة لمحبي القهوة المنكهة.',image:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=88',weights:[250,500],roasts:['فاتح','وسط']},
  {id:10,name:'إسبريسو كلاسيك',category:'إسبريسو',price:183,oldPrice:null,badge:'',weight:250,roast:'غامق',taste:'strong',brew:'espresso',desc:'Blend مناسب للإسبريسو مع جسم قوي ونهاية واضحة.',image:'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=900&q=88',weights:[250,500,1000],roasts:['وسط','غامق']},
  {id:11,name:'إسبريسو 1 كيلو',category:'إسبريسو',price:730,oldPrice:null,badge:'للكافيهات',weight:1000,roast:'غامق',taste:'strong',brew:'espresso',desc:'اختيار عملي للبيوت الكبيرة والكافيهات ومحبي الإسبريسو.',image:'https://images.unsplash.com/photo-1611162458324-aae1eb412a1f?auto=format&fit=crop&w=900&q=88',weights:[500,1000],roasts:['غامق']},
  {id:12,name:'قهوة عربي كلاسيك',category:'قهوة عربي',price:195,oldPrice:null,badge:'',weight:250,roast:'فاتح',taste:'smooth',brew:'arabic',desc:'طابع عربي عطري مناسب للضيافة والتحضير التقليدي.',image:'https://images.unsplash.com/photo-1522992319-0365e5f11656?auto=format&fit=crop&w=900&q=88',weights:[250,500,1000],roasts:['فاتح','وسط']},
  {id:13,name:'قهوة عربي ضيافة',category:'قهوة عربي',price:780,oldPrice:null,badge:'',weight:1000,roast:'فاتح',taste:'smooth',brew:'arabic',desc:'عبوة كبيرة للمناسبات والضيافة والاستخدام المستمر.',image:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=88',weights:[500,1000],roasts:['فاتح','وسط']},
  {id:14,name:'سبرتاية سادة صغيرة',category:'أدوات القهوة',price:270,oldPrice:null,badge:'',weight:1,roast:'',taste:'',brew:'turkish',desc:'سبرتاية عملية للمساحات الصغيرة والتحضير اليومي.',image:'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=900&q=88',weights:[1],roasts:['']},
  {id:15,name:'سبرتاية سادة متوسطة',category:'أدوات القهوة',price:290,oldPrice:null,badge:'',weight:1,roast:'',taste:'',brew:'turkish',desc:'حجم متوسط مناسب للاستخدام اليومي والاستضافة.',image:'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=900&q=88',weights:[1],roasts:['']},
  {id:16,name:'سبرتاية سادة كبيرة',category:'أدوات القهوة',price:330,oldPrice:null,badge:'',weight:1,roast:'',taste:'',brew:'turkish',desc:'حجم أكبر لتحضير أكثر من فنجان بسهولة.',image:'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=900&q=88',weights:[1],roasts:['']},
  {id:17,name:'سبرتاية منقوشة',category:'أدوات القهوة',price:290,oldPrice:null,badge:'هدية',weight:1,roast:'',taste:'',brew:'turkish',desc:'قطعة تقديم وتحضير مناسبة للهدايا والضيافة.',image:'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=900&q=88',weights:[1],roasts:['']},
  {id:18,name:'علبة تجربة 3 خلطات',category:'عروض وباكدجات',price:490,oldPrice:540,badge:'وفر 50 ج',weight:750,roast:'متنوع',taste:'balanced',brew:'turkish',desc:'ثلاث اختيارات صغيرة تساعدك تجرّب أكثر من مزاج في طلب واحد.',image:'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=900&q=88',weights:[750],roasts:['متنوع']},
  {id:19,name:'باكدج القهوة اليومية',category:'عروض وباكدجات',price:660,oldPrice:720,badge:'الأفضل قيمة',weight:1000,roast:'متنوع',taste:'balanced',brew:'turkish',desc:'مجموعة مناسبة للبيت تجمع منتجين أساسيين مع هدية بسيطة.',image:'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=900&q=88',weights:[1000],roasts:['متنوع']},
  {id:20,name:'باكدج محبي الإسبريسو',category:'عروض وباكدجات',price:790,oldPrice:860,badge:'',weight:1250,roast:'غامق',taste:'strong',brew:'espresso',desc:'حل عملي لمحبي الإسبريسو للاستخدام المنزلي والضيافة.',image:'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=88',weights:[1250],roasts:['غامق']}
];

const faqs = [
  ['هل أقدر أختار الطحن؟','أيوه. في صفحة المنتج، اختار الطحن المناسب لطريقتك: تركي ناعم، تركي وسط، فلتر، إسبريسو أو حبوب كاملة.'],
  ['متى يظهر سعر الشحن؟','السلة بتحسب الشحن تلقائيًا حسب قيمة الطلب. في النسخة الحالية الشحن ثابت، والمجاني يبدأ من الحد الموجود في إعدادات المتجر.'],
  ['هل الدفع أونلاين متاح؟','النموذج الحالي مجهز لعرض الدفع عند الاستلام أو التحويل البنكي أو تأكيد الطلب عبر واتساب. ربط بوابة دفع حقيقية يحتاج Backend/Payment Gateway في المرحلة التالية.'],
  ['هل أقدر أستخدم الموقع لمحمصة مختلفة؟','أيوه. كل المنتجات، الأسعار، رقم واتساب، وسائل التواصل والإعدادات موجودة في أعلى ملف script.js لتسهيل إعادة التخصيص.'],
  ['هل السلة بتفضل محفوظة؟','أيوه، السلة تحفظ محليًا على جهاز العميل باستخدام localStorage، وبالتالي لا تضيع بمجرد تحديث الصفحة.']
];

let activeCategory = 'all';
let cart = JSON.parse(localStorage.getItem('rawCoffeeCartV2') || '[]');
let appliedCoupon = (()=>{try{const c=localStorage.getItem('rawCoffeeCoupon');return c&&validateCoupon(c).ok?normalizeCode(c):null;}catch(_){return null;}})();
let modalProductId = null;
let modalQty = 1;
let currentWeight = null;
let currentRoast = null;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => `${new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2}).format(n)} ${STORE_CONFIG.currency}`;
const slug = (value) => String(value).replace(/\s+/g,'-');

function saveCart(){localStorage.setItem('rawCoffeeCartV2', JSON.stringify(cart));}
function getCartCount(){return cart.reduce((sum,item)=>sum+item.qty,0);}
function getSubtotal(){return cart.reduce((sum,item)=>sum+(item.price*item.qty),0);}
function activeCoupon(){if(!appliedCoupon) return null;const r=validateCoupon(appliedCoupon);return r.ok?r.coupon:null;}
function getDiscount(){return couponDiscount(activeCoupon(),getSubtotal());}
function getShipping(){
  const subtotal = getSubtotal() - getDiscount();
  const fc=activeCoupon();
  if(subtotal>0 && fc && fc.type==='shipping' && getSubtotal()>=fc.min) return 0;
  return subtotal === 0 ? 0 : (subtotal >= STORE_CONFIG.freeShippingThreshold ? 0 : STORE_CONFIG.shipping);
}
function getGrandTotal(){return getSubtotal() - getDiscount() + getShipping();}
function waUrl(text){return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;}
function openWhatsApp(text){window.open(waUrl(text),'_blank','noopener,noreferrer');}
function showToast(message){
  const el=$('#toast'); el.textContent=message; el.classList.add('show');
  clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2300);
}

function renderCollections(){
  const collectionData = categories.filter(c=>c.id!=='all').map((c,idx)=>({...c,count:`${products.filter(p=>p.category===c.id).length} منتجات`,idx}));
  collectionData.push({id:'عروض وباكدجات',name:'عروض وباكدجات',count:`${products.filter(p=>p.category==='عروض وباكدجات').length} عروض`,image:'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1000&q=85',idx:6});
  $('#collectionGrid').innerHTML=collectionData.map((c,i)=>`<button class="collection-card ${i===0?'large':''}" data-category="${c.id}"><img src="${c.image}" alt="${c.name}" loading="lazy"><span class="collection-overlay"></span><div><strong>${c.name}</strong><small>${c.count}</small></div><b>↗</b></button>`).join('');
}

function productCard(p){
  const price = p.price;
  const old = p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : '';
  return `<article class="product-card">
    <div class="product-media">
      <img src="${p.image}" loading="lazy" alt="${p.name}">
      ${p.badge?`<span class="badge">${p.badge}</span>`:''}
      <button class="quick-btn" data-quick="${p.id}" aria-label="عرض ${p.name}">⌕</button>
      <button class="heart-btn" data-fav="${p.id}" aria-label="إضافة للمفضلة">♡</button>
    </div>
    <div class="product-info">
      <div class="product-category">${p.category}</div>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-rating"><span>★★★★★</span><small>اختيار المتجر</small></div>
      <div class="product-bottom"><div class="price-stack"><strong class="price">${money(price)}</strong>${old}</div><button class="add-btn" data-add="${p.id}">أضف للسلة</button></div>
    </div>
  </article>`;
}

function getFilteredProducts(){
  const query = ($('#productSearch').value || '').trim().toLowerCase();
  const min = Number($('#minPrice').value || 0);
  const max = Number($('#maxPrice').value || Infinity);
  let list = products.filter(p=>{
    const matchCat = activeCategory==='all' || p.category===activeCategory;
    const haystack = `${p.name} ${p.category} ${p.desc} ${p.roast} ${p.brew}`.toLowerCase();
    return matchCat && (!query || haystack.includes(query)) && p.price>=min && p.price<=max;
  });
  const sort=$('#sortSelect').value;
  if(sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  if(sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name,'ar'));
  return list;
}

function renderFilters(){
  const counts = Object.fromEntries(categories.map(c=>[c.id,products.filter(p=>c.id==='all' || p.category===c.id).length]));
  const extra = products.filter(p=>p.category==='عروض وباكدجات').length;
  const allCats = [...categories,{id:'عروض وباكدجات',name:'عروض وباكدجات'}];
  $('#filterRow').innerHTML = allCats.map(c=>`<button class="filter-chip ${activeCategory===c.id?'active':''}" data-filter="${c.id}">${c.name}<span>${c.id==='عروض وباكدجات'?extra:counts[c.id]}</span></button>`).join('');
}

function renderShop(){
  const list=getFilteredProducts();
  $('#productGrid').innerHTML=list.map(productCard).join('');
  $('#resultsCount').textContent=`${list.length} منتج`;
  $('#emptyState').hidden=list.length!==0;
  renderFilters();
}

function addToCart(id, options={}){
  const p=products.find(x=>x.id===Number(id)); if(!p) return;
  const weight = options.weight || p.weight;
  const roast = options.roast ?? p.roast;
  const grind = options.grind || 'تركي ناعم';
  const key = `${p.id}-${weight}-${roast}-${grind}`;
  const found=cart.find(i=>i.key===key);
  if(found) found.qty += options.qty || 1;
  else cart.push({key,id:p.id,name:p.name,category:p.category,price:p.price,image:p.image,weight,roast,grind,qty:options.qty||1});
  saveCart(); renderCart(); showToast('تمت إضافة المنتج إلى السلة'); openCart();
}
function changeQty(key,delta){
  const item=cart.find(x=>x.key===key); if(!item) return;
  item.qty += delta;
  if(item.qty<=0) cart=cart.filter(x=>x.key!==key);
  saveCart(); renderCart();
}
function removeItem(key){cart=cart.filter(x=>x.key!==key); saveCart(); renderCart();}
function applyCoupon(codeArg){
  const raw = typeof codeArg==='string' ? codeArg : $('#couponInput').value;
  if(!normalizeCode(raw)){showToast('اكتب كود الخصم الأول');return;}
  const r=validateCoupon(raw);
  if(!r.ok){
    showToast(r.reason==='expired'?'الكود ده انتهت مدته':r.reason==='notstarted'?'الكود ده لسه مابدأش':'كود الخصم غير صحيح');
    return;
  }
  appliedCoupon=r.coupon.code;
  try{localStorage.setItem('rawCoffeeCoupon',appliedCoupon);}catch(_){}
  $('#couponInput').value='';
  showToast(`تم تفعيل الكود ${appliedCoupon} — ${couponLabel(r.coupon)}`);
  renderCart();
}
function removeCoupon(){appliedCoupon=null;try{localStorage.removeItem('rawCoffeeCoupon');}catch(_){}renderCart();}
function renderShippingProgress(){
  const subtotal=getSubtotal()-getDiscount();
  const progress = Math.min(100,(subtotal/STORE_CONFIG.freeShippingThreshold)*100);
  const remaining=Math.max(0,STORE_CONFIG.freeShippingThreshold-subtotal);
  $('#shippingProgress').innerHTML = subtotal===0
    ? `<div class="progress-head"><span>زود طلبك عشان تستفيد من الشحن المجاني</span><b>${money(STORE_CONFIG.freeShippingThreshold)}</b></div><div class="progress-bar"><i style="width:0%"></i></div>`
    : remaining>0
      ? `<div class="progress-head"><span>متبقي للشحن المجاني</span><b>${money(remaining)}</b></div><div class="progress-bar"><i style="width:${progress}%"></i></div>`
      : `<div class="progress-head"><span>مبروك! الشحن مجاني</span><b>✓</b></div><div class="progress-bar"><i style="width:100%"></i></div>`;
}
function renderCart(){
  $('#cartCount').textContent=getCartCount();
  $('#cartContent').innerHTML=cart.length?cart.map(item=>`<div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-main"><h4>${item.name}</h4><small>${item.weight===1?'أداة':item.weight+' جرام'}${item.roast?` • ${item.roast}`:''} • ${item.grind}</small><strong>${money(item.price*item.qty)}</strong><div class="qty-control"><button data-qty="${item.key}" data-delta="-1">−</button><span>${item.qty}</span><button data-qty="${item.key}" data-delta="1">+</button></div></div>
      <button class="remove-item" data-remove="${item.key}" aria-label="حذف">×</button>
    </div>`).join(''):`<div class="cart-empty"><div class="empty-illustration">☕</div><strong>السلة لسه فاضية</strong><span>ابدأ باختيار قهوتك، وهتظهر هنا فورًا.</span><button class="btn btn-dark" data-close-cart>اختار قهوتك</button></div>`;
  $('#cartSubtotal').textContent=money(getSubtotal());
  const dr=$('#discountRow'), ac=activeCoupon();
  dr.hidden=!ac;
  if(ac){
    const d=getDiscount(), ship=ac.type==='shipping';
    $('#discountLabel').textContent=d>0?`خصم (${ac.code})`:`كود ${ac.code}`;
    $('#cartDiscount').textContent=d>0?`-${money(d)}`:(ship?(getSubtotal()>=ac.min?'شحن مجاني':`من ${money(ac.min)}`):`يبدأ من ${money(ac.min)}`);
  }
  $('#cartShipping').textContent=getShipping()===0?'مجاني':money(getShipping());
  $('#cartTotal').textContent=money(getGrandTotal());
  renderShippingProgress();
  $('#checkoutItemsCount').textContent=getCartCount();
  $('#checkoutTotal').textContent=money(getGrandTotal());
}

function openCart(){ $('#cartDrawer').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden','false'); $('#drawerOverlay').hidden=false; }
function closeCart(){ $('#cartDrawer').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden','true'); $('#drawerOverlay').hidden=true; }

function openProductModal(id){
  const p=products.find(x=>x.id===Number(id)); if(!p) return;
  modalProductId=p.id; modalQty=1; currentWeight=p.weights?.[0] || p.weight; currentRoast=p.roasts?.[0] || p.roast;
  $('#modalImage').src=p.image; $('#modalImage').alt=p.name; $('#modalCategory').textContent=p.category; $('#modalName').textContent=p.name; $('#modalDescription').textContent=p.desc; $('#modalQty').textContent=modalQty; $('#grindSelect').value=p.category==='إسبريسو'?'إسبريسو':(p.category==='بن فرنسي'?'فلتر':'تركي ناعم');
  renderModalOptions(p); $('#productModal').hidden=false; document.body.classList.add('no-scroll');
}
function renderModalOptions(p){
  $('#weightOptions').innerHTML=(p.weights||[p.weight]).map((w,i)=>`<button class="option-pill ${w===currentWeight?'active':''}" data-weight="${w}">${w===1?'أداة':w+' جم'}</button>`).join('');
  $('#roastOptions').innerHTML=(p.roasts||[p.roast]).filter(Boolean).map(r=>`<button class="option-pill ${r===currentRoast?'active':''}" data-roast="${r}">${r}</button>`).join('');
  $('#modalPrice').textContent=money(p.price);
}
function closeProductModal(){ $('#productModal').hidden=true; document.body.classList.remove('no-scroll'); }

function runFinder(){
  const taste=$('#finderTaste').value; const brew=$('#finderBrew').value; const weight=$('#finderWeight').value;
  let ranked=products.filter(p=>p.category!=='أدوات القهوة').map(p=>{
    let score=0;
    if(p.taste===taste) score+=3;
    if(p.brew===brew) score+=3;
    if(weight==='any' || String(p.weight)===weight) score+=2;
    if(p.badge) score+=1;
    return {...p,score};
  }).sort((a,b)=>b.score-a.score).slice(0,4);
  $('#finderResults').innerHTML=ranked.map(productCard).join('');
  $('#finderModal').hidden=false; document.body.classList.add('no-scroll');
}

function buildOrderMessage(data){
  const orderNumber=`RAW-${Date.now().toString().slice(-6)}`;
  const lines=cart.map((i,idx)=>`${idx+1}. ${i.name} × ${i.qty} | ${i.weight===1?'أداة':i.weight+' جم'}${i.roast?` | ${i.roast}`:''} | ${i.grind} | ${money(i.price*i.qty)}`).join('\n');
  const discount=getDiscount(); const shipping=getShipping();
  return `طلب جديد — ${STORE_CONFIG.brand} ☕\nرقم الطلب: ${orderNumber}\n\nالعميل: ${data.name}\nالموبايل: ${data.phone}\nالمحافظة: ${data.city}\nالعنوان: ${data.address}\nطريقة الدفع: ${data.payment}\nموعد التوصيل: ${data.delivery}\n${data.notes?`ملاحظات: ${data.notes}\n`:''}\nالمنتجات:\n${lines}\n\nالإجمالي الفرعي: ${money(getSubtotal())}${discount?`\nالخصم: -${money(discount)}`:''}\nالشحن: ${shipping===0?'مجاني':money(shipping)}${activeCoupon()&&(discount>0||(activeCoupon().type==='shipping'&&shipping===0))?`\nكود الخصم: ${appliedCoupon}`:''}\nالإجمالي النهائي: ${money(getGrandTotal())}\n\nبرجاء تأكيد الطلب مع العميل.`;
}

function initFaq(){
  $('#faqList').innerHTML=faqs.map(([q,a],i)=>`<button class="faq-item" data-faq="${i}"><span><b>${String(i+1).padStart(2,'0')}</b>${q}</span><i>+</i><div>${a}</div></button>`).join('');
}
function setTheme(){document.body.classList.toggle('dark');localStorage.setItem('rawCoffeeTheme',document.body.classList.contains('dark')?'dark':'light');}
function initTheme(){if(localStorage.getItem('rawCoffeeTheme')==='dark')document.body.classList.add('dark');}
function runGlobalSearch(value){$('#productSearch').value=value;activeCategory='all';renderShop();$('#searchOverlay').hidden=true;document.body.classList.remove('no-scroll');document.querySelector('#shop').scrollIntoView({behavior:'smooth'});}

// Global click delegation

document.addEventListener('click',(e)=>{
  const add=e.target.closest('[data-add]'); if(add){addToCart(add.dataset.add);return;}
  const quick=e.target.closest('[data-quick]'); if(quick){openProductModal(quick.dataset.quick);return;}
  const fav=e.target.closest('[data-fav]'); if(fav){fav.classList.toggle('active');fav.textContent=fav.classList.contains('active')?'♥':'♡';showToast(fav.classList.contains('active')?'تم الحفظ في المفضلة':'تمت الإزالة من المفضلة');return;}
  const category=e.target.closest('[data-category]'); if(category){activeCategory=category.dataset.category;renderShop();document.querySelector('#shop').scrollIntoView({behavior:'smooth'});return;}
  const filter=e.target.closest('[data-filter]'); if(filter){activeCategory=filter.dataset.filter;renderShop();return;}
  const qty=e.target.closest('[data-qty]'); if(qty){changeQty(qty.dataset.qty,Number(qty.dataset.delta));return;}
  const remove=e.target.closest('[data-remove]'); if(remove){removeItem(remove.dataset.remove);return;}
  const close=e.target.closest('[data-close-cart]'); if(close){closeCart();return;}
  const faq=e.target.closest('[data-faq]'); if(faq){faq.classList.toggle('open');return;}
  const weight=e.target.closest('[data-weight]'); if(weight){currentWeight=Number(weight.dataset.weight);renderModalOptions(products.find(p=>p.id===modalProductId));return;}
  const roast=e.target.closest('[data-roast]'); if(roast){currentRoast=roast.dataset.roast;renderModalOptions(products.find(p=>p.id===modalProductId));return;}
});

$('#cartBtn').addEventListener('click',openCart);
$('#closeCart').addEventListener('click',closeCart);
$('#drawerOverlay').addEventListener('click',closeCart);
$('#themeBtn').addEventListener('click',setTheme);
$('#mobileMenuBtn').addEventListener('click',()=>$('#mobileNav').classList.toggle('open'));
$('#mobileNav').addEventListener('click',()=>$('#mobileNav').classList.remove('open'));
$('#searchBtn').addEventListener('click',()=>{$('#searchOverlay').hidden=false;$('#globalSearch').focus();document.body.classList.add('no-scroll');});
$('#closeSearch').addEventListener('click',()=>{$('#searchOverlay').hidden=true;document.body.classList.remove('no-scroll');});
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter')runGlobalSearch(e.currentTarget.value);});
$('#productSearch').addEventListener('input',renderShop);
$('#sortSelect').addEventListener('change',renderShop);
$('#applyPrice').addEventListener('click',renderShop);
$('#resetFilters').addEventListener('click',()=>{$('#minPrice').value='';$('#maxPrice').value='';$('#productSearch').value='';$('#sortSelect').value='featured';activeCategory='all';renderShop();});
$('#compactFilterBtn').addEventListener('click',()=>$('.filter-panel').classList.toggle('mobile-open'));
$('#couponBtn').addEventListener('click',applyCoupon);
$('#couponInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyCoupon();}});
$('#closeProductModal').addEventListener('click',closeProductModal);
$('#productModal').addEventListener('click',e=>{if(e.target.id==='productModal')closeProductModal();});
$('#modalMinus').addEventListener('click',()=>{modalQty=Math.max(1,modalQty-1);$('#modalQty').textContent=modalQty;});
$('#modalPlus').addEventListener('click',()=>{modalQty=Math.min(20,modalQty+1);$('#modalQty').textContent=modalQty;});
$('#modalAdd').addEventListener('click',()=>{const p=products.find(x=>x.id===modalProductId);if(!p)return;addToCart(p.id,{weight:currentWeight,roast:currentRoast,grind:$('#grindSelect').value,qty:modalQty});closeProductModal();});
$('#checkoutBtn').addEventListener('click',()=>{if(!cart.length){showToast('السلة فاضية حاليًا');return;}$('#checkoutModal').hidden=false;document.body.classList.add('no-scroll');});
$('#closeCheckout').addEventListener('click',()=>{$('#checkoutModal').hidden=true;document.body.classList.remove('no-scroll');});
$('#checkoutModal').addEventListener('click',e=>{if(e.target.id==='checkoutModal'){$('#checkoutModal').hidden=true;document.body.classList.remove('no-scroll');}});
$('#checkoutForm').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());openWhatsApp(buildOrderMessage(data));showToast('تم تجهيز الطلب على واتساب');cart=[];saveCart();renderCart();$('#checkoutModal').hidden=true;document.body.classList.remove('no-scroll');});
$('#finderSubmit').addEventListener('click',runFinder);
$('#findCoffeeBtn').addEventListener('click',()=>document.querySelector('#coffeeFinder').scrollIntoView({behavior:'smooth'}));
$('#closeFinder').addEventListener('click',()=>{$('#finderModal').hidden=true;document.body.classList.remove('no-scroll');});
$('#finderModal').addEventListener('click',e=>{if(e.target.id==='finderModal'){$('#finderModal').hidden=true;document.body.classList.remove('no-scroll');}});
$('#announcementClose').addEventListener('click',()=>$('#announcement').remove());
$('#contactWhatsapp').href=waUrl('مرحبًا، محتاج مساعدتكم في اختيار قهوة مناسبة ☕');
$('#year').textContent=new Date().getFullYear();

window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeProductModal();$('#checkoutModal').hidden=true;$('#finderModal').hidden=true;$('#searchOverlay').hidden=true;document.body.classList.remove('no-scroll');}});

initTheme();
renderCollections();
initFaq();
renderShop();
renderCart();

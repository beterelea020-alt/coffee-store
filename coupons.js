// ============================================================
// RAW Coffee — كوبونات الخصم (50 كود)  |  Discount codes
// ------------------------------------------------------------
// كيف تعلن عن كود؟ / How to announce a code:
//   1) خلّي active:true للكود اللي عايز تفعّله (والباقي false).
//   2) (اختياري) حدد from / to بصيغة 'YYYY-MM-DD' لتحديد فترة الكود.
//   3) غيّر ANNOUNCED_COUPON للكود اللي عايز يظهر في الشريط العلوي.
//   4) لينك مباشر يفعّل الكود لوحده:  https://موقعك/?coupon=RAW10
//
// type:  'percent' = نسبة %  |  'fixed' = مبلغ ثابت بالجنيه  |  'shipping' = شحن مجاني
// min :  أقل قيمة للطلب عشان الكود يشتغل (0 = بدون حد)
// max :  أقصى قيمة خصم بالجنيه للنسبة المئوية (0 = بدون حد أقصى)
//
// تنبيه: ده موقع Front-End، فالأكواد بتبان لأي حد يفتح الكود المصدري.
// عدد مرات الاستخدام لكل عميل مش ممكن تتحكم فيه هنا — الكود بيتسجل في رسالة
// الواتساب فتقدر تراجعه بنفسك، والتحكم الحقيقي محتاج Backend.
// ============================================================
const ANNOUNCED_COUPON = 'RAW10';

const COUPONS = [
  {code:'HELLO5',type:'percent',value:5,min:200,max:0,from:'',to:'',active:false},
  {code:'SIP5',type:'percent',value:5,min:200,max:0,from:'',to:'',active:false},
  {code:'BEAN5',type:'percent',value:5,min:200,max:0,from:'',to:'',active:false},
  {code:'FRESH5',type:'percent',value:5,min:200,max:0,from:'',to:'',active:false},
  {code:'MORNING5',type:'percent',value:5,min:200,max:0,from:'',to:'',active:false},
  {code:'TURKI5',type:'percent',value:5,min:200,max:0,from:'',to:'',active:false},
  {code:'MOZAJ5',type:'percent',value:5,min:200,max:0,from:'',to:'',active:false},
  {code:'FIRST5',type:'percent',value:5,min:200,max:0,from:'',to:'',active:false},
  {code:'RAW10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:true},
  {code:'COFFEE10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'ROAST10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'AROMA10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'BREW10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'SABAH10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'KAYF10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'ESPRESSO10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'FRENCH10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'HABBA10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'WEEKEND10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'GIFT10',type:'percent',value:10,min:400,max:0,from:'',to:'',active:false},
  {code:'RAW15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'MOHAWWAG15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'SAFWA15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'ZOOQ15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'DARK15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'LIGHT15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'FAMILY15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'OFFICE15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'FRIDAY15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'SEASON15',type:'percent',value:15,min:600,max:150,from:'',to:'',active:false},
  {code:'RAW20',type:'percent',value:20,min:900,max:250,from:'',to:'',active:false},
  {code:'VIP20',type:'percent',value:20,min:900,max:250,from:'',to:'',active:false},
  {code:'BIGDEAL20',type:'percent',value:20,min:900,max:250,from:'',to:'',active:false},
  {code:'MEGA20',type:'percent',value:20,min:900,max:250,from:'',to:'',active:false},
  {code:'LOYAL20',type:'percent',value:20,min:900,max:250,from:'',to:'',active:false},
  {code:'SAVE25',type:'fixed',value:25,min:250,max:0,from:'',to:'',active:false},
  {code:'HALA25',type:'fixed',value:25,min:250,max:0,from:'',to:'',active:false},
  {code:'BONUS25',type:'fixed',value:25,min:250,max:0,from:'',to:'',active:false},
  {code:'THANKS25',type:'fixed',value:25,min:250,max:0,from:'',to:'',active:false},
  {code:'BACK25',type:'fixed',value:25,min:250,max:0,from:'',to:'',active:false},
  {code:'SAVE50',type:'fixed',value:50,min:450,max:0,from:'',to:'',active:false},
  {code:'HALA50',type:'fixed',value:50,min:450,max:0,from:'',to:'',active:false},
  {code:'BONUS50',type:'fixed',value:50,min:450,max:0,from:'',to:'',active:false},
  {code:'THANKS50',type:'fixed',value:50,min:450,max:0,from:'',to:'',active:false},
  {code:'BACK50',type:'fixed',value:50,min:450,max:0,from:'',to:'',active:false},
  {code:'SAVE100',type:'fixed',value:100,min:800,max:0,from:'',to:'',active:false},
  {code:'VIP100',type:'fixed',value:100,min:800,max:0,from:'',to:'',active:false},
  {code:'MEGA100',type:'fixed',value:100,min:800,max:0,from:'',to:'',active:false},
  {code:'SHIP0',type:'shipping',value:0,min:300,max:0,from:'',to:'',active:false},
  {code:'FREESHIP',type:'shipping',value:0,min:300,max:0,from:'',to:'',active:false},
];

// ---------- Helpers (no need to edit below) ----------
function normalizeCode(v){
  return String(v||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s\u200e\u200f]/g,'').toUpperCase();
}
function todayStr(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function validateCoupon(raw){
  const c=COUPONS.find(x=>x.code===normalizeCode(raw));
  if(!c||!c.active) return {ok:false,reason:'invalid'};
  const t=todayStr();
  if(c.from&&t<c.from) return {ok:false,reason:'notstarted',coupon:c};
  if(c.to&&t>c.to) return {ok:false,reason:'expired',coupon:c};
  return {ok:true,coupon:c};
}
function couponDiscount(c,subtotal){
  if(!c||subtotal<=0||subtotal<c.min) return 0;
  if(c.type==='percent'){const d=Math.round(subtotal*c.value)/100;return c.max?Math.min(d,c.max):d;}
  if(c.type==='fixed') return Math.min(c.value,subtotal);
  return 0;
}
function couponLabel(c){
  const what=c.type==='percent'?`خصم ${c.value}%`:c.type==='fixed'?`خصم ${c.value} ج`:'شحن مجاني';
  return c.min?`${what} على طلبات ${c.min} ج فأكتر`:what;
}

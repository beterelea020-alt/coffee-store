# RAW Coffee Store — Full Front-End Commerce Template

نسخة Front-End أقوى من الـprototype الأول، ومصممة كـ coffee e-commerce template قابل لإعادة التخصيص والبيع.

## الموجود الآن
- Home / Hero / Categories / Coffee Finder / Shop / FAQ / Contact / Footer
- 20 منتج Demo مع فئات وأسعار وصور
- Search + Sort + Category Filters + Price Filters
- Product Quick View
- اختيار الوزن + درجة التحميص + الطحن + الكمية
- Cart محفوظة في localStorage
- Progress للشحن المجاني
- Coupon system جاهز (`RAW10` بشكل Demo)
- Checkout مصمم للسوق المصري (الاسم، الموبايل، المحافظة، العنوان، الدفع، موعد التوصيل)
- إنشاء رسالة طلب منظمة وفتح WhatsApp
- Dark / Light mode
- Responsive Mobile / Tablet / Desktop
- Coffee Finder لترشيح المنتجات
- Favorites UI
- FAQ accordion
- إعدادات المتجر والمنتجات في `script.js`

## أهم ما تغيّره قبل بيع الموقع للعميل
افتح `script.js` ثم عدّل:
- `STORE_CONFIG.brand`
- `STORE_CONFIG.whatsappNumber`
- `STORE_CONFIG.shipping`
- `STORE_CONFIG.freeShippingThreshold`
- `STORE_CONFIG.coupon`
- مصفوفة `products`
- روابط السوشيال والتليفون والإيميل داخل `index.html`

## الدفع
هذه نسخة Front-End فقط. الـCheckout لا ينفذ دفعًا إلكترونيًا حقيقيًا؛ هو يجمع بيانات الطلب ويبني رسالة WhatsApp. لربط Visa/Meeza/Paymob/Fawry أو الدفع الإلكتروني الحقيقي ستحتاج تكامل Gateway + Backend أو خدمة وسيطة.

## التشغيل
افتح `index.html` مباشرة أو استخدم Live Server / Vercel.

## ملاحظة الهوية
التصميم يستخدم روحًا مصرية مع ألوان أزرق/كحلي وهيكل متجر قهوة حديث، لكنه لا يعتمد على لوجو أو أصول خاصة بعلامة أخرى. يمكن استبدال الهوية بالكامل من خلال الألوان واللوجو والمنتجات والإعدادات.

## تحديث UX (Upgrade Layer)
- `upgrade.css` + `upgrade.js` مضافين فوق الكود الأصلي بدون كسره.
- Validation فوري لرقم الموبايل المصري والعنوان مع رسائل خطأ جنب الحقل.
- شاشة تأكيد بعد الطلب (رابط واتساب احتياطي + نسخ الطلب) والسلة ما بتتمسحش قبل كده.
- حفظ بيانات العميل للطلب الجاي، زر واتساب عائم، أيقونات SVG، Focus ring، احترام reduced-motion، lazy-loading للصور.

## كوبونات الخصم (50 كود) — `coupons.js`
- الملف فيه 50 كود جاهزين (نسبة %، مبلغ ثابت، شحن مجاني). كلهم `active:false` ما عدا `RAW10`.
- **تفعّل كود:** غيّر `active` لـ `true`. **تحدد فترة:** `from` و`to` بصيغة `YYYY-MM-DD`.
- **تعلن كود:** غيّر `ANNOUNCED_COUPON` — بيظهر تلقائيًا في الشريط العلوي، والعميل يضغط عليه فيتفعّل.
- **لينك مباشر:** `https://موقعك/?coupon=RAW15` بيفعّل الكود لوحده (ينفع تنشره على واتساب/إنستجرام).
- الكود المستخدم بيتكتب في رسالة الواتساب عشان تراجعه.
- تنبيه: الأكواد بتبان لأي حد يفتح الكود المصدري، ومفيش تحكم في عدد مرات الاستخدام بدون Backend.

## طبقة النمو — `growth.js` + `growth.css`
- شريط طرق الدفع، بوكسات جاهزة وهدايا (تتعدّل من `BUNDLES`)، دليل التحضير، آراء العملاء، اشتراك شهري، أسعار جملة للكافيهات.
- سياسات (شحن/استبدال/خصوصية) في نافذة من الفوتر، بوب-أب خصم أول طلب، شريط تنقل سفلي للموبايل.
- SEO: JSON-LD (Store + FAQ)، `manifest.webmanifest`، `robots.txt`، `sitemap.xml`.
- **لازم تعدّل قبل الإطلاق:** آراء العملاء في `REVIEWS` (حاليًا أمثلة)، نص السياسات في `POL`، الدومين في `robots.txt` و`sitemap.xml`، أرقام الموبايل والسوشيال.

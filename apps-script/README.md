# ربط نموذج التواصل بـ Google Apps Script

هذه الملفات جاهزة لربط موقع الثانوية السابعة والستون بجدول Google Sheets والبريد الرسمي.

## الإعدادات المستخدمة
- البريد: jaf.sco67@gmail.com
- Google Sheet ID: 1v1yJOCyq-6PDja2QHM24lXuGb-KzAKtbtS1CuoLdPVo
- تبويب الاستفسارات: الاستفسارات

## خطوات التفعيل
1. افتح https://script.google.com بحساب jaf.sco67@gmail.com.
2. أنشئ مشروعًا جديدًا باسم: ربط بوابة الثانوية السابعة والستون.
3. استبدل محتوى Code.gs بمحتوى الملف Code.gs الموجود هنا.
4. من إعدادات المشروع تأكد أن المنطقة الزمنية Asia/Riyadh.
5. اختر Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. اضغط Deploy ووافق على الأذونات.
9. انسخ رابط Web app الذي ينتهي بـ /exec.
10. أرسل الرابط في ChatGPT ليتم وضعه في data/site.json داخل contactEndpoint.

بعد ذلك:
- يُحفظ كل استفسار في Google Sheet.
- تصل نسخة إلى jaf.sco67@gmail.com.
- إذا أدخل ولي الأمر بريده، تصله رسالة تأكيد ورقم متابعة.
- يظهر للمستخدم رقم متابعة مباشرة في الموقع.

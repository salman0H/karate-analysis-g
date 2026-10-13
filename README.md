# karate-analysis-g

## Smart Karate Body Analytics System
### باشگاه کاراته شرکت برق منطقه ای خراسان

سامانه هوشمند پایش بیومتریک و آنالیز تخصصی ۲۵ فاکتور فیزیولوژیکی ترکیب بدنی ورزشکاران با دستگاه Xiaomi S400 و تحلیل پیشرفته هوش مصنوعی (Llama-3).

---

## ویژگی‌های کلیدی (Key Features)

- **طرحواره باز دینامیک (Dynamic Schema Registry - OCP):** ذخیره کلیه ۲۵ شاخص در قالب ستون منفرد `JSONB` بدون نیاز به تغییر اسکیمای دیتابیس در آینده.
- **رابط کاربری ورزشکار (Athlete Intake Console):** ثبت مشخصات، تاریخ تولد شمسی، محاسبه دقیق سن با تقویم جلالی، عکاسی زنده با وب‌کم (`react-webcam`) همراه با قابلیت آپلود تصویر پرتره.
- **موتور هوش مصنوعی مربیگری کاراته (Groq Llama-3 AI Engine):** تحلیل تخصصی توان انفجاری کومیته، پایداری استاتیک کاتا، بالانس عضله به چربی و ارائه برنامه ۴ هفته‌ای عملیاتی.
- **صدور شناسنامه رسمی چاپی (Branded PDF Generation):** تولید فایل PDF با تایپوگرافی فارسی، سربرگ اختصاصی باشگاه و نمایش جدول ۲۵ شاخص با `@react-pdf/renderer`.
- **طراحی مدرن و واکنش‌گرا (Sports Analytics UI):** تم دارک ورزشی، شاخص‌های آنی HUD، پیش‌فرض‌های آماده برای تست سریع.

---

## پشته فناوری (Technology Stack)

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Glassmorphism
- **Database & ORM:** PostgreSQL + Prisma (JSONB Registry)
- **Forms & Validation:** react-hook-form + zod
- **AI Integration:** Groq SDK (Llama-3 model)
- **Reporting:** @react-pdf/renderer
- **Hardware Integration:** react-webcam

---

## راه‌اندازی و اجرا (Getting Started)

### ۱. نصب وابستگی‌ها
```bash
npm install
```

### ۲. تنظیم متغیرهای محیطی
یک فایل `.env.local` بر اساس `.env.example` ایجاد کنید:
```bash
cp .env.example .env.local
```

کلید واقعی را فقط در `.env.local` قرار دهید، نه در مخزن:
```env
GROQ_API_KEY="کلید-واقعی-ساخته-شده-در-console.groq.com"
DATABASE_URL="postgresql://user:password@localhost:5432/karate_analytics?schema=public"
```

### ۳. ساخت و همگام‌سازی دیتابیس (Prisma)
```bash
npx prisma generate
npx prisma db push
```

### واردکردن داده‌های اندازه‌گیری

پس از تنظیم `DATABASE_URL` در `.env.local` و همگام‌سازی دیتابیس، اطلاعات واقعی
جنسیت، تاریخ تولد شمسی و سن هر ورزشکار را در `athleteProfiles` در
`scripts/import-data.ts` وارد کنید؛ اسکریپت این مقادیر را حدس نمی‌زند و اگر کامل
نباشند، پیش از اتصال به دیتابیس متوقف می‌شود. سپس اجرا کنید:

```bash
npm run import:data
```

داده‌ها در `scripts/athlete-import-data.json` نگهداری می‌شوند. اجرای دوباره،
آنالیز همان ورزشکار در همان زمان اندازه‌گیری را به‌روزرسانی می‌کند و آنالیزهای
با زمان متفاوت را به‌عنوان رکورد جدید ثبت می‌کند.

### تولید PDF برای داده‌های ورودی

ابتدا سرور برنامه را اجرا کنید:

```bash
npm run dev
```

سپس در ترمینال دیگری، برای ساخت PDF جداگانه برای هر رکورد JSON (بدون اتصال به
دیتابیس) اجرا کنید:

```bash
npm run generate:pdfs
```

فایل‌ها در `generated-reports/` ساخته می‌شوند. برای هر ورزشکار گزارش از Groq
گرفته و داخل PDF قرار می‌گیرد. اگر کلید معتبر یا پاسخ Groq موجود نباشد، اسکریپت
خطا می‌دهد و گزارش محلی را به‌عنوان خروجی هوش مصنوعی جا نمی‌زند. چون داده ورودی
جنسیت، سن و تاریخ تولد ندارد، این موارد در PDF «ثبت نشده» می‌مانند.
اگر قبلاً کلید واقعی را در `.env.example` قرار داده‌اید، آن را در پنل Groq باطل
و کلید تازه‌ای را فقط در `.env.local` نگهداری کنید.

### ۴. اجرای برنامه
```bash
# حالت توسعه
npm run dev

# حالت پروداکشن
npm run build
npm start
```
برنامه در آدرس `http://localhost:3000` (یا پورت پیکربندی‌شده) در دسترس خواهد بود.

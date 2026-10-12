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

مقادیر زیر را در `.env.local` مقداردهی کنید:
```env
GROQ_API_KEY="your_groq_api_key_here"
DATABASE_URL="postgresql://user:password@localhost:5432/karate_analytics?schema=public"
```

### ۳. ساخت و همگام‌سازی دیتابیس (Prisma)
```bash
npx prisma generate
npx prisma db push
```

### ۴. اجرای برنامه
```bash
# حالت توسعه
npm run dev

# حالت پروداکشن
npm run build
npm start
```
برنامه در آدرس `http://localhost:3000` (یا پورت پیکربندی‌شده) در دسترس خواهد بود.

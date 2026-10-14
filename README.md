# karate-analysis-g

## Smart Karate Body Analytics System
### باشگاه کاراته شرکت برق منطقه ای خراسان

سامانه جامع پایش بیومتریک، آنالیز فیزیولوژیکی ۲۵ فاکتور ترکیب بدنی با تله‌متری Xiaomi S400، تحلیل هوشمند با مدل‌های Groq AI، تصویرسازی نموداری با پایتون و صدور شناسنامه ورزشی به دو فرمت PDF رسمی و مارک‌داون راست‌چین (RTL).

---

## ویژگی‌های کلیدی (Key Features)

- **طرحواره باز دینامیک (Dynamic Schema Registry - OCP):** ذخیره کلیه ۲۵ شاخص در قالب ستون منفرد `JSONB` در PostgreSQL با Prisma 7 بدون نیاز به تغییر اسکیمای دیتابیس در آینده.
- **موتور نمودارساز تصویری پایتون (Python Biometric Visualizer):** تولید خودکار داشبوردهای گرافیکی چندگانه (رادار ۶ فاکتور، تفکیک توده‌ها به کیلوگرم، شاخص‌های شتاب کومیته و پایداری کاتا) با بک‌اند سروری `Agg` و تایپوگرافی فارسی فونت وزیرمتن.
- **سامانه پالایش و ضد به‌هم‌ریختگی مارک‌داون (BiDi-Safe Markdown Sanitizer):** تبدیل ساختارهای خام جدول و نشانه‌گذاری‌های مارک‌داون به بلاک‌های تمیز متنی بدون گسیختگی BiDi در زبان فارسی (`src/lib/markdown-cleaner.ts`).
- **تولید شناسنامه مارک‌داون کاملاً راست‌چین (RTL Markdown Engine):** تولید گزارش‌های ساختاریافته محصور در تگ `<div dir="rtl">` همراه با نمودارهای بصری درون‌ریزی‌شده، مناسب برای رندر در سرور، وب و گیت‌هاب.
- **صدور شناسنامه رسمی چاپی (Branded PDF Generation):** تولید فایل PDF با تایپوگرافی فارسی، سربرگ و لوگوی رسمی شرکت برق منطقه‌ای خراسان، بنر اساتید (شیهان کریمی و شیهان غفاری) با `@react-pdf/renderer`.
- **موتور هوش مصنوعی مربیگری کاراته (Groq AI Engine):** تحلیل تخصصی توان انفجاری کومیته، پایداری استاتیک کاتا، بالانس عضله به چربی و ارائه برنامه ۴ هفته‌ای عملیاتی با کنترل سقف توکن و نرخ درخواست‌ها.

---

## پشته فناوری (Technology Stack)

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5, Python 3.12
- **Styling:** Tailwind CSS, Glassmorphism, Vazirmatn Font
- **Database & ORM:** PostgreSQL + Prisma 7 (`prisma.config.ts`, JSONB Dynamic Registry)
- **Data Visualization (Server-Ready):** Python Matplotlib (`Agg` backend), `arabic_reshaper`, `python-bidi`, `numpy`
- **Forms & Validation:** react-hook-form + zod
- **AI Integration:** Groq SDK
- **Document Engines:** @react-pdf/renderer, Custom RTL Markdown Compiler
- **Hardware Integration:** react-webcam (Xiaomi S400 Telemetry)

---

## ساختار دایرکتوری گزارش‌ها و اسکریپت‌ها

```
project/
├── scripts/
│   ├── generate_charts.py             # موتور رسم نمودارهای تصویری پایتون (Headless)
│   ├── generate_markdown_reports.ts   # تولید گزارش‌های مارک‌داون راست‌چین همراه نمودار
│   ├── generate-all-reports.ts        # پایپ‌لاین ارزیابی دیتابیس + هوش مصنوعی + PDF
│   ├── generate-athlete-pdfs.mts      # اسکریپت جایگزین تولید PDF از طریق API
│   ├── import-data.ts                 # اسکریپت ورود داده و همگام‌سازی دیتابیس
│   └── athlete-import-data.json       # داده‌های تله‌متری خام ورزشکاران
├── src/
│   ├── components/pdf/                # کامپوننت‌های رندر شناسنامه رسمی PDF
│   ├── config/metrics.config.ts       # رجیستری ۲۵ شاخص تله‌متری شیائومی
│   └── lib/markdown-cleaner.ts        # پالایشگر BiDi و تبدیل جدول‌های مارک‌داون
└── generated-reports/
    ├── charts/                        # نمودارهای تصویری PNG تولیدشده توسط پایتون
    ├── markdown/                      # گزارش‌های مارک‌داون راست‌چین و فایل شاخص README.md
    └── Report-*.pdf                   # شناسنامه‌های رسمی چاپی PDF
```

---

## راه‌اندازی و اجرا (Getting Started)

### ۱. نصب وابستگی‌ها
```bash
# نصب پکیج‌های Node.js
npm install

# نصب پیش‌نیازهای پایتون برای نمودارها (در صورت لزوم)
pip install arabic-reshaper python-bidi matplotlib numpy
```

### ۲. تنظیم متغیرهای محیطی
یک فایل `.env.local` بر اساس `.env.example` ایجاد کنید:
```bash
cp .env.example .env.local
```

مقادیر زیر را در `.env.local` تنظیم کنید:
```env
GROQ_API_KEY="gsk_..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/karate_analytics?schema=public"
GROQ_MODEL="openai/gpt-oss-120b"
```

### ۳. ساخت و همگام‌سازی دیتابیس (Prisma 7)
```bash
npx prisma generate
npx prisma db push
```

---

## دستورات اجرایی سرور و خط فرمان (CLI Commands)

تمامی فرآیندهای پردازش برای اجرا بر روی سرور بدون نیاز به مداخله دستی یا رابط کاربری مهیا شده‌اند:

### اجرای چرخه کامل (صفر تا صد)
دستور زیر به صورت زنجیره‌ای اطلاعات را وارد دیتابیس کرده، تحلیل‌های Groq را اخذ می‌کند، نمودارهای پایتون را رسم می‌کند، فایل‌های PDF را صادر کرده و شناسنامه‌های مارک‌داون راست‌چین را تولید می‌کند:
```bash
npm run process:all
```

### اجرای مستقل هر بخش

```bash
# ورود داده‌های ورزشکاران به دیتابیس PostgreSQL:
npm run import:data

# تولید نمودارهای تصویری پایتون (Headless بدون نیاز به X11):
npm run generate:charts
# یا مستقیماً:
python3 scripts/generate_charts.py

# کامپایل گزارش‌های مارک‌داون راست‌چین (RTL) همراه با نمودارها:
npm run generate:markdown

# تولید شناسنامه‌های PDF رسمی باشگاه:
npm run generate:pdfs
```

### اجرای وب‌اپلیکیشن
```bash
# محیط توسعه
npm run dev

# بیلد و اجرای پروداکشن
npm run build
npm run start
```
برنامه در آدرس `http://localhost:3000` در دسترس خواهد بود.

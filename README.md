# karate-analysis-g

## Smart Biometric & Sport Analytics Platform
### باشگاه کاراته شرکت برق منطقه ای خراسان

پلتفرم یکپارچه و هوشمند پایش بیومتریک، آنالیز فیزیولوژیکی ۲۵ فاکتور ترکیب بدنی با تله‌متری Xiaomi S400، ارزیابی هوش مصنوعی بر پایه مدل‌های Groq AI، تصویرسازی نموداری با پایتون و صدور شناسنامه ۲ صفحه‌ای کامل PDF با نمودارهای تصویری درون‌ریزی‌شده (Embedded Charts) و پشتیبانی از رشته‌های ورزشی متنوع (Multi-Sport Disciplines).

---

## ویژگی‌های کلیدی (Key Features)

- **شناسنامه ۲ صفحه‌ای رسمی با نمودارهای درون‌ریزی‌شده (2-Page PDF with Embedded Visual Charts):**
  - **صفحه اول:** پرونده هویتی ورزشکار، نشان رشته ورزشی انتخابی، کارت‌های KPI ۶ شاخص کلیدی و ماتریس ۲۵ فاکتور تله‌متری شیائومی در دسته‌بندی‌های بافت عضلانی، مایعات، تراکم استخوان، متابولیسم و اهداف وزنی.
  - **صفحه دوم:** داشبورد تصویری چندپنله رزولوشن بالا تولیدشده توسط پایتون (نمودار رادار، تفکیک توده‌ها، شاخص‌های شتاب و پایداری) به همراه تحلیل تخصصی هوش مصنوعی متناسب با رشته، پروتکل عملیاتی ۴ هفته‌ای و کادرهای رسمی تأیید کادر فنی.
- **انتخابگر رشته ورزشی و دامنه تحلیل (Multi-Sport Discipline Selector):**
  - امکان انتخاب رشته ورزشی از منوی دراپ‌داون در رابط کاربری، اسکریپت‌ها و API برای تولید گزارش متناسب با نیاز ورزشکار:
    1. **کاراته قهرمانی (WKF):** توان انفجاری کومیته، پایداری کاتا و انطباق با اوزان مسابقاتی.
    2. **آمادگی جسمانی عمومی و فیتنس:** ترکیب بدنی سلامت‌محور، پیشگیری از خستگی متابولیک و ثبات عضلات مرکزی.
    3. **بدنسازی و هایپرتروفی:** توده خالص عضلانی (FFM)، پتانسیل حجم خشک، تفکیک و تنظیم ماکروها.
    4. **فوتبال تخصصی:** چابکی، شتاب، تغییر جهت (COD) و استقامت بی‌هوازی تکرارشونده.
    5. **ورزش‌های رزمی ترکیبی (MMA / بوکس):** گشتاور ضربات چرخشی، پایداری کلینچ و استقامت در راندهای فشرده.
    6. **شنا و ورزش‌های آبی:** شناوری، کاهش درگ هیدرودینامیکی و تعادل هیدراتاسیون در آب سرد.
    7. **دوومیدانی و استقامت:** راندمان مکانیکی دویدن (Running Economy)، سبکی گام‌ها و کاهش فشار بر مفاصل.
- **تفکیک و تطبیق هوشمند مربی هوش مصنوعی (Dynamic Coach Personas):** تزریق خودکار پرامپت‌های تخصصی متناسب با رشته انتخابی به مدل‌های Groq AI با خروجی پاک‌سازی‌شده، شماره‌دار و بدون کاراکترهای مخرب چاپگر.
- **موتور نمودارساز تصویری پایتون (Headless Server Chart Generator):** رسم داشبوردهای بیومتریک ۳ پنله با فونت فارسی وزیرمتن و ذخیره در فرمت PNG جهت تزریق مستقیم به PDF و مارک‌داون.
- **طرحواره باز دینامیک (Dynamic Schema Registry - OCP):** ذخیره کلیه ۲۵ شاخص در قالب ستون منفرد `JSONB` در PostgreSQL با Prisma 7.
- **تولید شناسنامه مارک‌داون راست‌چین (RTL Markdown Engine):** تولید گزارش‌های ساختاریافته محصور در `<div dir="rtl">` همراه با نمودارهای بصری.

---

## پشته فناوری (Technology Stack)

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5, Python 3.12
- **Styling:** Tailwind CSS, Glassmorphism, Vazirmatn Persian Typography
- **Database & ORM:** PostgreSQL + Prisma 7 (`prisma.config.ts`, JSONB Dynamic Registry)
- **Data Visualization:** Python Matplotlib (`Agg` headless), `arabic_reshaper`, `python-bidi`, `numpy`
- **Forms & Validation:** react-hook-form + zod
- **AI Integration:** Groq SDK (Llama-3 / GPT-OSS)
- **Document Engines:** @react-pdf/renderer (2-Page Embedded Chart Architecture), RTL Markdown Compiler

---

## ساختار دایرکتوری گزارش‌ها و اسکریپت‌ها

```
project/
├── scripts/
│   ├── generate_charts.py             # موتور رسم داشبورد تصویری پایتون (Headless)
│   ├── generate_markdown_reports.ts   # تولید گزارش‌های مارک‌داون راست‌چین همراه نمودار
│   ├── generate-all-reports.ts        # پایپ‌لاین تولید شناسنامه‌های ۲ صفحه‌ای PDF با نمودار
│   ├── import-data.ts                 # اسکریپت ورود داده و همگام‌سازی دیتابیس PostgreSQL
│   └── athlete-import-data.json       # داده‌های تله‌متری خام ورزشکاران
├── src/
│   ├── app/api/
│   │   ├── analyze/route.ts           # سرویس هوش مصنوعی با پشتیبانی از رشته‌های مختلف
│   │   └── pdf/route.tsx              # سرویس صدور PDF ۲ صفحه‌ای با کشف خودکار نمودارها
│   ├── components/
│   │   ├── athlete-form.tsx           # فرم ورود اطلاعات و دراپ‌داون انتخاب رشته
│   │   └── pdf/report-document.tsx    # معماری ۲ صفحه‌ای شناسنامه با نمودار و تحلیل
│   ├── types/athlete.ts               # تعاریف رشته‌های ورزشی و اسکیمای فرم
│   └── config/metrics.config.ts       # رجیستری ۲۵ شاخص تله‌متری شیائومی
└── generated-reports/
    ├── charts/                        # نمودارهای تصویری PNG تولیدشده توسط پایتون
    ├── markdown/                      # گزارش‌های مارک‌داون راست‌چین
    └── Report-*.pdf                   # شناسنامه‌های رسمی ۲ صفحه‌ای PDF
```

---

## راه‌اندازی و اجرا (Getting Started)

### ۱. نصب وابستگی‌ها
```bash
# نصب پکیج‌های Node.js
npm install

# نصب پیش‌نیازهای پایتون برای نمودارها
pip install arabic-reshaper python-bidi matplotlib numpy
```

### ۲. تنظیم متغیرهای محیطی
یک فایل `.env.local` بر اساس `.env.example` ایجاد کنید:
```bash
cp .env.example .env.local
```

مقادیر زیر را در `.env.local` قرار دهید:
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

## دستورات اجرایی خط فرمان (CLI Commands)

### اجرای چرخه کامل (صفر تا صد)
ورود داده به دیتابیس، رسم نمودارهای تصویری، ایجاد گزارش‌های مارک‌داون و صدور شناسنامه‌های ۲ صفحه‌ای PDF با نمودار:
```bash
npm run process:all
```

### اجرای مستقل هر بخش
```bash
# ورود داده‌های ورزشکاران به دیتابیس PostgreSQL:
npm run import:data

# تولید نمودارهای تصویری پایتون (Headless بدون نیاز به X11):
npm run generate:charts

# صدور شناسنامه‌های ۲ صفحه‌ای PDF حاوی نمودار درون‌ریزی‌شده:
npm run generate:pdfs

# یا تولید PDF برای رشته خاص (مثلاً آمادگی جسمانی):
npx tsx scripts/generate-all-reports.ts --discipline=fitness
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

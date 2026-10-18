# سامانه پایش ترکیب بدنی و آنالیز عملکرد کاراته
## Smart Biometric & Sport Telemetry Platform
### باشگاه کاراته شرکت برق منطقه‌ای خراسان (KREC)

![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-JSONB-336791?style=flat-square&logo=postgresql)
![Prisma ORM](https://img.shields.io/badge/Prisma-7.10-2D3748?style=flat-square&logo=prisma)
![Groq AI](https://img.shields.io/badge/Groq_AI-Llama--3-f55036?style=flat-square)
![Vercel Ready](https://img.shields.io/badge/Vercel-Deployable-000000?style=flat-square&logo=vercel)

پلتفرم سازمانی، تخصصی و یکپارچه پایش ۲۵ شاخص تله‌متری ترکیب بدنی، آنالیز بیومکانیک آزمایشگاهی و فیزیولوژی عملکرد نخبگان کاراته. این سامانه با تلفیق داده‌های سخت‌افزاری ترازوی هوشمند **Xiaomi Body Composition Scale S400**، استنتاج مربی هوش مصنوعی مبتنی بر **Groq Llama-3**، دانشنامه مستند کیوکوشین و ماتریس آسیب‌شناسی بین‌المللی، بستر مدیریت بدنی هوشمند ورزشکاران ۸ تا ۷۰ سال را برای کادر فنی فراهم می‌سازد.

---

## ارکان پنج‌گانه معماری سامانه (Core Architecture Pillars)

```mermaid
graph TD
    A["سامانه پایش بدنی کاراته برق منطقه‌ای خراسان"] --> B["۱. تحلیل تیمی و رده‌های سنی"]
    A --> C["۲. سنجش S400 و ثبت بیومتریک"]
    A --> D["۳. مدیریت پرونده و شناسنامه"]
    A --> E["۴. دانشنامه تکنیک‌ها و سلاح‌ها"]
    A --> F["۵. استانداردهای ۸ تا ۷۰ سال"]

    B --> B1["تفکیک سنی زیستی همتا: U16, U21, Seniors, Masters"]
    B --> B2["پایگاه داده هنجارهای آزمایشگاهی جهان (Loturco, Benosmane, Camomilla)"]
    B --> B3["ماتریس آسیب‌های بیومکانیک و پروتکل RTP"]
    
    C --> C1["احراز چهره و ثبت سلفی بلادرنگ وبکم"]
    C --> C2["موتور ورودی ۲۵ فاکتور Xiaomi S400"]
    C --> C3["استنتاج استراتژیک هوش مصنوعی Groq Llama-3"]

    D --> D1["جدول سازمانی سوابق رزمی‌کاران"]
    D --> D2["روند پیشرفت طولی فردی (Time-Series SVG Chart)"]
    D --> D3["صدور شناسنامه ۲ صفحه‌ای رسمی PDF"]

    E --> E1["داچی‌ها و تکنیک‌های مصور جزوه کیوکوشین"]
    E --> E2["۲۰ سلاح طبیعی دست و پا با آناتومی کاربردی"]
    E --> E3["تحقیقات بیومکانیک Black Belt Magazine"]

    F --> F1["تفکیک هنجارهای اختصاصی کومیته و کاتا"]
    F --> F2["ارزیابی درصد چربی، عضله و آب بدن در طول عمر"]
```

---

## قابلیت‌های کلیدی (Key Features)

### ۱. ارزیابی تحلیلی تیم و مقایسه در رده‌های سنی زیستی همتا
- **حذف مقایسه‌های ناهمگون**: مقایسه شاخص‌های بدنی صرفاً بین همتایان هم‌گروه سنی:
  - **نوجوانان و پایه (زیر ۱۶ سال - U16 Cadets & Foundation):** تمرکز بر الگوهای مهارتی، چابکی، واکنش سرعتی و داچی‌های بنیادین بدون بارگذاری وزنه سنگین. هنجار چربی WKF: ۱۰٪ تا ۱۴٪.
  - **جوانان و امید (۱۶ تا ۲۱ سال - U21 Junior Division):** هایپرتروفی کاربردی، شتاب پرش اسکوات، توان بی‌هوازی انفجاری و استارت‌های سریع کومیته. هنجار چربی WKF: ۸٪ تا ۱۲٪.
  - **بزرگسالان قهرمانی (۲۲ تا ۳۵ سال - Seniors Elite):** اوج نرخ تولید نیرو (RFD)، زمان واکنش دیداری زیر ۰.۴۲ ثانیه، کاتاهای پیشرفته و کنترل دقیق سر وزن. هنجار چربی WKF: ۷٪ تا ۱۱٪.
  - **پیشکسوتان و اساتید (۳۶ تا ۷۰ سال - Masters):** پیشگیری از سارکوپنیا (تحلیل عضله)، حفظ تراکم استخوان، تثبیت زاویه مفصل زانو و کاتاهای تمرکزی. هنجار چربی WKF: ۱۲٪ تا ۱۸٪.
- **بانک داده نخبگان جهانی (Elite Benchmarks):**
  - شاخص‌های توان و قدرت تیم ملی برزیل (*Loturco et al.*)
  - زمان واکنش دیداری و کینتیک مشت چرخشی در برابر بدون چرخش (*Benosmane & Venkatraman*)
  - الکترومیوگرافی (EMG) همانقباضی فاز پرتاب و ترمزگیری و زوایای حرکتی ۳بعدی ضربه پا (*Camomilla et al.*)
  - ماتریس آسیب‌های بیومکانیک شایع کاراته به همراه تمرینات دوجو و معیارهای عینی آزمون‌های بازگشت به تاتامی (RTP)
  - تلمتری فواصل ماآی (SSI vs FS) و سهم سیستم‌های انرژی فسفاژن در مبارزات رسمی WKF
  - قابلیت کپی ساختار یکپارچه JSON کل داده‌ها جهت تحقیقات علوم ورزشی

### ۲. پایش ۲۵ شاخص تله‌متری ترکیب بدنی (Xiaomi S400)
- ثبت و تحلیل دقیق ۲۵ پارامتر زیستی با متد BIA دوفرکانسی:
  - شاخص‌های جرمی: وزن کل، توده عضلانی اسکلتی، توده چربی، وزن بدون چربی (FFM)، توده استخوانی
  - شاخص‌های نسبتی: درصد چربی بدن، شاخص توده بدنی (BMI)، درصد آب و هیدراتاسیون، درصد پروتئین
  - شاخص‌های متابولیک و احشایی: نرخ متابولیسم پایه (BMR)، سطح چربی احشایی، تیپ بدنی، سن بیولوژیکی
  - شاخص‌های سلامت سلولی: مایع درون‌سلولی (ICW)، مایع برون‌سلولی (ECW)، نسبت ECW/TBW و مقاومت الکتریکی بافت‌ها
- طراحی پایگاه‌داده منعطف با اصل OCP و استفاده از فیلد مدرن `JSONB` در PostgreSQL.

### ۳. پایش طولی پیشرفت فردی و تحلیل مقایسه‌ای
- ثبت سوابق جلسات متوالی هر ورزشکار و نمایش بر روی نمودار سری زمانی اختصاصی SVG.
- محاسبه هوشمند دلتا تغییرات (وزن، عضله، چربی، آب) نسبت به جلسه مبنا (Baseline) و آخرین جلسه.
- تشخیص خودکار جهت روند (صعودی مطلوب، خنثی، نیازمند بازنگری تمرینی) متناسب با ماهیت شاخص.
- تحلیل استراتژیک مقایسه‌ای دوره‌ای توسط هوش مصنوعی Groq.

### ۴. دانشنامه تکنیک‌ها، سلاح‌های طبیعی و پژوهش‌های مجله Black Belt
- **استقرارها و داچی‌ها:** زنکوتسو، کوکوتسو، کیباداچی، سانچین، نکوآشی، فودوداچی و تسوروآشی با تفکیک زاویه مفاصل، مرکز ثقل و اصول مکانیکی.
- **۲۰ سلاح طبیعی دست و پا:** سیکن، اوراکن، شوتو، هایتو، نوکیته، امپی، تتسوی، کوکن، چوسوکو، هایسوکو، کاکاتو، تیسوکو و سونی به همراه تصاویر رسمی و تشریح استخوان‌بندی و زوایای آسیب‌پذیر.
- **سوگندنامه دوجو (Dojokun):** ۷ بند فلسفی و اخلاقی سوسای اویاما با ترجمه رسمی و خط ژاپنی.
- **سیستم ارتقاء درجات:** از کمربند سفید تا دان ۱۰ به همراه تشریح معنای رنگ و فلسفه کمربندها.
- **پژوهش‌های Black Belt Magazine:** مستندسازی مکانیسم‌های بیومکانیک نیرو، تحلیل زمان برخورد و همبستگی آن با تله‌متری S400.

### ۵. ماتریس استانداردهای فیزیولوژیکی (۸ تا ۷۰ سال)
- دسته‌بندی استانداردهای سلامت و قهرمانی در گروه‌های سنی:
  - خردسالان و کودکان (۸ تا ۱۱ سال)
  - نوجوانان پایه (۱۲ تا ۱۵ سال)
  - جوانان و امید (۱۶ تا ۲۰ سال)
  - بزرگسالان حرفه‌ای (۲۱ تا ۳۵ سال)
  - پیشکسوتان کلاسیک (۳۶ تا ۵۰ سال)
  - اساتید و پیشکسوتان ارشد (۵۱ تا ۷۰ سال)
- تفکیک معیارهای ویژه کومیته (سرعت خطی، نسبت توان به وزن) و کاتا (پایداری، دانسیته اسکلتی عضلانی).

### ۶. سیستم طراحی دوتایی یکپارچه (Zero-FOUC Dual Theme)
- تم روشن مینیمال شرکتی (Enterprise Clean Light Palette) با کنتراست فوق‌العاده بالا و خوانایی کامل.
- تم تیره مدرن اسلیت (Enterprise Slate Dark Palette) با رنگ‌های عمیق و هایلایت‌های ملایم.
- مهار کامل مدیا کوئری ناخواسته در Tailwind CSS v4 از طریق `@custom-variant dark`.
- ذخیره‌سازی وضعیت تم در `localStorage` و اعمال آن در کلاینت بدون هیچ پرش نوری (Flash of Unstyled Content).

### ۷. صدور شناسنامه ورزشی ۲ صفحه‌ای PDF
- کامپایل مستقیم از طریق موتور `@react-pdf/renderer` در محیط Serverless.
- شامل عکس سلفی احراز هویت، ماتریس ۲۵ فاکتور، کارت‌های KPI، نمودارهای بیومکانیک و پروتکل پیشنهادی مربی هوش مصنوعی.

---

## پشته فناوری (Tech Stack)

| لایه | فناوری | هدف و کارکرد |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4 (App Router & Turbopack) | رندرینگ مدرن سرور/کلاینت، معماری ماژولار و سرعت بیلد زیر ۱ ثانیه |
| **Language** | TypeScript 5.0 | تایپ‌سیف بودن کامل داده‌های تله‌متری، رجیستری شاخص‌ها و هوش مصنوعی |
| **Styling** | Tailwind CSS v4 + Semantic CSS Variables | سیستم طراحی سازمانی ریسپانسیو با پشتیبانی RTL و فونت‌های استاندارد وزیرمتن |
| **Database** | PostgreSQL + JSONB | ذخیره امن اطلاعات هویتی و نگهداری بدون تغییرپذیری ۲۵ فاکتور BIA |
| **ORM** | Prisma 7.10 (`@prisma/adapter-pg`) | ارتباط بهینه‌سازی‌شده با استخرهای کانکشن بدون سرور (Connection Pooling) |
| **State Management** | Zustand 5 | مدیریت وضعیت‌های سراسری نرم‌افزار، تب‌های فعال و تم سیستم |
| **Server State** | TanStack React Query v5 | واکشی، کش هوشمند و همگام‌سازی بلادرنگ داده‌های ورزشکاران |
| **AI Engine** | Groq SDK (Llama-3 70B / Mixtral) | استنتاج فیزیولوژیکی و تدوین راهبردهای تمرینی اختصاصی تیم و ورزشکار |
| **Document Generation** | `@react-pdf/renderer` | صدور مستقیم شناسنامه‌های چاپی ۲ صفحه‌ای با رزولوشن بالا |
| **Hardware Integration** | WebRTC + Xiaomi S400 Protocol | دریافت بی‌درنگ تصویر سلفی و سازگاری با سنسورهای BIA ترازوی هوشمند |

---

## ساختار دایرکتوری پروژه (Project Architecture)

```
project/
├── prisma/
│   ├── schema.prisma                  # Prisma Schema (Athlete, Assessment, JSONB metrics)
│   └── migrations/                    # Database migrations history
├── public/
│   └── images/
│       ├── krec-logo.png              # Official KREC karate club emblem
│       └── kyokushin/                 # Documented Kyokushin stances and natural weapons visual assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts       # Groq AI athletic telemetry inference API route
│   │   │   ├── athletes/route.ts      # Athlete profile CRUD & telemetry record persistence
│   │   │   └── pdf/route.tsx          # Serverless 2-page athlete biometric passport PDF generator
│   │   ├── globals.css                # Global styles, semantic CSS variables and dark variant tokens
│   │   ├── layout.tsx                 # Root layout, Vazirmatn typography and zero-FOUC theme hydration
│   │   └── page.tsx                   # Enterprise dashboard single-page application entrypoint
│   ├── components/
│   │   ├── athlete-form.tsx           # 25-factor biometric input modal and telemetry validator
│   │   ├── athlete-progress-chart.tsx # Longitudinal SVG time-series progress tracker and delta metrics
│   │   ├── karate-roster-selector.tsx # Rapid athlete roster picker and telemetry badge selector
│   │   └── selfie-capture.tsx         # Live WebRTC webcam capture and identity portrait module
│   ├── core/
│   │   ├── providers/                 # TanStack React Query client provider
│   │   └── store/
│   │       ├── use-app-store.ts       # Global state: active tab, selected athlete, drawer states
│   │       └── use-theme-store.ts     # Dual theme state (light / dark) with localStorage persistence
│   ├── features/
│   │   ├── athletes/                  # Athlete management table and dossier viewer
│   │   ├── markdown/                  # Markdown report renderer with sanitized styling
│   │   ├── science/                   # Global scientific benchmarks (Loturco, Benosmane, Camomilla, RTP)
│   │   ├── shell/                     # Sticky enterprise header, navigation and dashboard scaffolding
│   │   ├── standards/                 # 8 to 70 years physiological & body composition conditioning norms
│   │   ├── team-analysis/             # Team-wide evaluation and biological age cohort analysis
│   │   └── techniques/                # Kyokushin encyclopedia, 20 natural weapons & research archive
│   ├── lib/
│   │   ├── jalali.ts                  # Jalali calendar converter, solar dates and biological age math
│   │   └── prisma.ts                  # Edge-compatible singleton Prisma client with connection pooling
│   └── types/
│       └── athlete.ts                 # TypeScript interfaces for biometric telemetry & assessment records
├── scripts/
│   ├── athlete-import-data.json       # Raw telemetry records for 11 initial KREC athletes
│   ├── generate-all-reports.ts        # Bulk report generation utility
│   ├── generate_charts.py             # Standalone Python visual analytics generator
│   └── import-data.ts                 # Database seed script for initial athlete profiles
├── package.json
└── tsconfig.json
```

---

## راه‌اندازی و اجرای محلی (Local Development)

### پیش‌نیازها
- Node.js نسخه 20 به بالا
- پکیج‌منیجر npm
- پایگاه داده PostgreSQL (محلی یا ابری)

### ۱. نصب وابستگی‌ها
```bash
git clone https://github.com/salman0H/karate-analysis-g.git
cd karate-analysis-g
npm install
```

### ۲. پیکربندی متغیرهای محیطی
یک فایل `.env.local` در ریشه پروژه بسازید:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/karate_db?schema=public"
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"
```

### ۳. ساخت و اعمال جداول پایگاه داده
```bash
npx prisma db push
```

### ۴. بارگذاری داده‌های اولیه رزمی‌کاران (اختیاری)
جهت بارگذاری ۱۱ رکورد واقعی ورزشکاران باشگاه کاراته شرکت برق منطقه‌ای خراسان:
```bash
npm run import:data
```

### ۵. اجرای محیط توسعه
```bash
npm run dev
```
سامانه در آدرس `http://localhost:3000` در دسترس خواهد بود.

---

## استقرار روی سرورهای ابری و Vercel (Deployment Guide)

این پروژه برای استقرار سرورلس روی پلتفرم **Vercel** بهینه‌سازی شده است:

1. **اتصال مخزن**: مخزن گیت‌هاب را در پنل [Vercel](https://vercel.com) ایمپورت کنید.
2. **پایگاه‌داده ابری**:
   - یک دیتابیس رایگان در سرویس **[Neon.tech](https://neon.tech)** یا **Supabase** ایجاد کنید.
   - رشته اتصال با Connection Pooling را کپی کنید.
3. **تنظیم Environment Variables در ورسل**:
   - `DATABASE_URL`: رشته اتصال دیتابیس ابری
   - `GROQ_API_KEY`: کلید اختصاصی Groq AI
4. **بیلد اتوماتیک**:
   - به واسطه اسکریپت `"postinstall": "prisma generate"` موجود در `package.json`، کلاینت پریزما در جریان پایپ‌لاین ورسل تولید شده و پروژه با موفقیت در سراسر جهان مستقر می‌شود.

---

## مجوز و مالکیت معنوی (License & Attribution)

کلیه حقوق مادی و معنوی این سامانه متعلق به **باشگاه کاراته شرکت برق منطقه ای خراسان** است.
استفاده از پایگاه داده بیومکانیک و استانداردهای آن با ذکر مراجع علمی (*WKF, Loturco et al., Benosmane et al., Camomilla et al., Black Belt Magazine*) بلامانع است.

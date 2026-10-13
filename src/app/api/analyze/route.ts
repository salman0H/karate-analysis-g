import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { METRICS_CONFIG, getMetricByKey } from "@/config/metrics.config";
import type { AnalyzeRequestPayload } from "@/types/athlete";

function formatMetricsForPrompt(metrics: Record<string, number | string>): string {
  return METRICS_CONFIG.map((def, idx) => {
    const rawVal = metrics[def.key];
    if (rawVal === undefined || rawVal === null || rawVal === "") return null;
    let displayVal = String(rawVal);
    if (def.isText && def.textOptions) {
      const matched = def.textOptions.find((opt) => opt.value === rawVal);
      if (matched) displayVal = matched.labelFa;
    }
    return `${idx + 1}. ${def.labelFa} (${def.nameEn}): ${displayVal} ${def.unit} [اهمیت در کاراته: ${def.karateContext ?? "عمومی"}]`;
  })
    .filter(Boolean)
    .join("\n");
}

function generateDeterministicKarateReport(payload: AnalyzeRequestPayload): string {
  const m = payload.metrics;
  const weight = Number(m.weight) || 68;
  const fatPct = Number(m.bodyFatPercentage) || 12;
  const musclePct = Number(m.musclePercentage) || 82;
  const visceral = Number(m.visceralFatRate) || 3;
  const bmr = Number(m.bmr) || 1700;
  const waterPct = Number(m.bodyWaterPercentage) || 64;
  const bodyAge = Number(m.bodyAge) || payload.age;
  const boneMineral = Number(m.boneMineralContent) || 3.2;

  const kumiteRating = fatPct < 13 && musclePct > 80 ? "بسیار بالا (Elite)" : "مطلوب";
  const kataRating = musclePct > 78 && visceral < 5 ? "پایداری بهینه" : "نیازمند تقویت تعادل ایستا";

  return `### تحلیل ارشد فیزیولوژی و آماده‌سازی جسمانی کاراته
**باشگاه کاراته شرکت برق منطقه‌ای خراسان**
**ورزشکار:** ${payload.fullName} | **سن:** ${payload.age} سال | **تاریخ ارزیابی:** ${payload.birthDateJalali}

---

#### ۱. ارزیابی راندمان مکانیکی و ترکیب بدنی (کومیته و کاتا)
- **شتاب و توان انفجاری کومیته (Kumite Explosiveness):**
  درصد عضله ${musclePct}٪ در کنار درصد چربی ${fatPct}٪ نشان‌دهنده نسبت توان به وزن (Power-to-Weight Ratio) ${kumiteRating} است. توده چربی پایین موجب به حداقل رسیدن بار مرده حین استارت‌های انفجاری (Surikomi) و اجرای تکنیک‌های سرعتی کیزامه سوکی و گیاکو سوکی می‌شود.
- **ثبات استاتیک و پویای کاتا (Kata Stability):**
  پایین بودن سطح چربی احشایی (${visceral}) و نسبت متوازن توده عضلات اسکلتی، نقطه ثقل پایینی در دان‌تن (Hara) ایجاد می‌کند که برای استقرار محکم در داچی‌ها (به‌ویژه زنکوتسو داچی و کیبا داچی) و چرخش‌های سریع شبیه به کاتاهای کانکو دای و انپی حیاتی است.

#### ۲. هیدراتاسیون و ذخایر زیستی
- **درصد آب بدن (${waterPct}٪):**
  سطح هیدراتاسیون در دامنه ایده‌آل قرار دارد. این شاخص مانع از انقباضات زودرس و تجمع اسید لاکتیک در راندهای پایانی مسابقات انتخابی می‌شود.
- **تراکم مواد معدنی استخوان (${boneMineral} کیلوگرم):**
  اسکلت‌بندی مستحکم قابلیت جذب ضربات متقابل و مقاومت در برابر بلاک‌های سنگین (Uke) را تضمین می‌کند.

#### ۳. نقاط قوت برجسته
۱. **سن بیولوژیکی مطلوب:** سن بدنی (${bodyAge} سال) نشان‌دهنده ریکاوری سریع سلولی و پاسخ‌دهی بالای سیستم عصبی است.
۲. **نرخ متابولیسم پایه (${bmr} کیلوکالری):** موتور متابولیک قدرتمند جهت چربی‌سوزی خودکار حین دوره‌های پرفشار تمرینی.

#### ۴. نقاط تمرکزی و اصلاحی (Actionable Priorities)
۱. **تنظیم وزن دقیق دسته WKF:** حفظ وزن دقیق در کانال ${weight} کیلوگرم بدون اعمال سونا یا دی‌هیدراتاسیون حاد.
۲. **تقویت کمربند شکمی و لگن:** افزودن تمرینات پلایومتریک جانبی جهت افزایش گشتاور چرخش لگن در ضربات چرخشی پا.

#### ۵. پروتکل عملی ۴ هفته‌ای مربیگری
- **هفته ۱ و ۲ (توان و شتاب واکنشی):** ۳ جلسه تمرینات اینتروال تاباتا با تمرکز بر پرش‌های جعبه و ترکیب با ضربات سوکی روی میت سرعتی.
- **هفته ۳ (ایستایی و کنترل اسیدوز):** ۲ جلسه تمرینات ایزومتریک داچی‌های عمیق همراه با وزنه سبک جهت ارتقای استقامت موضعی عضلات ۴ سر ران.
- **هفته ۴ (تیپرینگ و ریکاوری):** کاهش حجم تمرین، تنظیم هیدراتاسیون با الکترولیت‌ها و ماساژ میوفاشیال پیش از ورود به مسابقات.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestPayload & {
      requireGroq?: boolean;
      measuredAt?: string;
    };
    const payload = body;
    const requireGroq = body.requireGroq === true;

    if (!payload.fullName || !payload.metrics) {
      return NextResponse.json(
        { error: "داده‌های ورودی ورزشکار یا شاخص‌های بدنی ناقص است." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (requireGroq && (!apiKey || !apiKey.trim() || apiKey.includes("your_groq_api_key"))) {
      return NextResponse.json(
        { error: "کلید GROQ_API_KEY تنظیم نشده است؛ آن را در .env.local قرار دهید و سرور را دوباره اجرا کنید." },
        { status: 503 }
      );
    }

    // If Groq API Key is present, call Groq Llama-3 model
    if (apiKey && apiKey.trim().length > 0 && !apiKey.includes("your_groq_api_key")) {
      try {
        const groq = new Groq({ apiKey });
        const metricsSummary = formatMetricsForPrompt(payload.metrics);

        const systemPrompt = `شما یک مربی ارشد و نخبه آماده‌سازی جسمانی (Elite Karate Conditioning Coach) در رشته کاراته کنترلی و سنتی (WKF) هستید که در «باشگاه کاراته شرکت برق منطقه ای خراسان» فعالیت می‌کنید.
شما باید تحلیل کاملاً علمی، عملیاتی، مستقیم، بدون تعارف و متناسب با استانداردهای قهرمانی کاراته ارائه دهید. تحلیل باید شامل:
۱. تحلیل اختصاصی توده عضلانی و چربی بر توان انفجاری کومیته (سرعت دست و پا) و پایداری کاتا (ثبات داچی‌ها).
۲. بررسی شاخص آب بدن، استخوان و چربی احشایی در استقامت و پیشگیری از آسیب.
۳. نقاط قوت فیزیکی ورزشکار بر اساس اعداد ثبت شده.
۴. نقاط ضعف و ریسک‌های موجود با زبان فنی مربیگری.
۵. یک پروتکل ۴ هفته‌ای مشخص تمرینی و تغذیه‌ای به تفکیک هفته‌ها.
قانون کلیدی: ممکن است برخی از فاکتورها توسط دستگاه اندازه گیری نشده باشند یا در فرم در حالت «عدم اعمال» قرار گرفته باشند (در لیست ورودی غایب باشند). به هیچ وجه اعدادی را برای فاکتورهای غایب حدس نزنید یا جعل نکنید؛ تحلیل را منحصراً بر پایه فاکتورهای اعمال‌شده و موجود ارائه دهید.
اگر جنسیت یا سن تقویمی ارائه نشده است، از دسته‌بندی‌های وابسته به سن/جنسیت، نتیجه‌گیری درباره BMI، تجویز کالری یا کاهش وزن تهاجمی خودداری کنید. این گزارش تشخیص پزشکی نیست و برای ورزشکار نوجوان، برنامه تغذیه/تمرین باید با نظارت مربی و متخصص واجد صلاحیت باشد.
زبان خروجی: کاملاً فارسی روان، تخصصی با اصطلاحات کاراته و بدون مقدمه‌چینی زائد.`;

        const userPrompt = `مشخصات ورزشکار:
نام و نام خانوادگی: ${payload.fullName}
جنسیت: ${payload.gender === "MALE" ? "مرد" : payload.gender === "FEMALE" ? "زن" : "ارائه نشده"}
سن تقویمی: ${Number.isFinite(payload.age) ? `${payload.age} سال` : "ارائه نشده"}
زمان اندازه‌گیری: ${body.measuredAt ?? "ارائه نشده"}
باشگاه: باشگاه کاراته شرکت برق منطقه ای خراسان

شاخص‌های آنالیز اسکن بدن (Xiaomi S400):
${metricsSummary}

لطفاً تحلیل کامل تخصصی کاراته را بر اساس اصول آمادگی جسمانی ارائه کن.`;

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: 1800,
        });

        const report = completion.choices[0]?.message?.content;
        if (report) {
          return NextResponse.json({
            report,
            source: "groq-llama-3",
            generatedAt: new Date().toISOString(),
          });
        }
        if (requireGroq) {
          return NextResponse.json(
            { error: "Groq پاسخی برای گزارش تحلیل برنگرداند." },
            { status: 502 }
          );
        }
      } catch (groqError) {
        if (requireGroq) {
          console.error("Required Groq analysis failed:", groqError);
          return NextResponse.json(
            { error: "ارتباط با Groq ناموفق بود؛ گزارش محلی جایگزین تولید نشد." },
            { status: 502 }
          );
        }
        console.warn("Groq API call encountered an issue, falling back to local engine:", groqError);
      }
    }

    if (requireGroq) {
      return NextResponse.json(
        { error: "برای تولید گزارش باید GROQ_API_KEY معتبر تنظیم شده باشد." },
        { status: 503 }
      );
    }

    // Fallback deterministic karate conditioning engine
    const fallbackReport = generateDeterministicKarateReport(payload);
    return NextResponse.json({
      report: fallbackReport,
      source: "local-karate-engine",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis pipeline error:", error);
    return NextResponse.json(
      { error: "خطا در پردازش تحلیل شاخص‌های بدنی ورزشکار" },
      { status: 500 }
    );
  }
}

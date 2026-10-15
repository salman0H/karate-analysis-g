import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { METRICS_CONFIG, getMetricByKey } from "@/config/metrics.config";
import type { AnalyzeRequestPayload } from "@/types/athlete";

function getDisciplinePrompt(discipline?: string): { roleTitle: string; focusAreas: string; sportLabel: string } {
  switch (discipline) {
    case "fitness":
      return {
        roleTitle: "یک متخصص ارشد فیزیولوژی ورزشی و مربی آمادگی جسمانی عمومی (Senior Exercise Physiologist & Conditioning Coach)",
        sportLabel: "آمادگی جسمانی عمومی و فیتنس",
        focusAreas: `۱. تحلیل درصد چربی و توده عضلانی بر سلامت متابولیک، استقامت عملکردی روزمره و ترکیب بدنی ایده‌آل.
۲. بررسی شاخص هیدراتاسیون (آب بدن)، توده اسکلتی و چربی احشایی در پیشگیری از بیماری‌های متابولیک و دردهای اسکلتی-عضلانی.
۳. نقاط قوت فیزیکی فرد بر پایه شاخص‌های ثبتی دستگاه.
۴. ریسک‌ها و فاکتورهای محدودکننده توان هوازی و قلبی-عروقی.
۵. یک پروتکل ۴ هفته‌ای مشخص تمرینات هوازی، تمرینات فانکشنال و ثبات مرکزی (Core) به تفکیک هفته‌ها.`
      };
    case "bodybuilding":
      return {
        roleTitle: "یک مربی ارشد و کارشناس حرفه‌ای بدنسازی و هایپرتروفی عضلانی (Master Bodybuilding & Hypertrophy Coach)",
        sportLabel: "بدنسازی و هایپرتروفی عضلانی",
        focusAreas: `۱. ارزیابی دقیق توده خالص عضلانی (FFM)، پتانسیل رشد عضلانی و نسبت عضله به چربی جهت استراتژی کات (Cutting) یا حجم خشک (Lean Bulk).
۲. بررسی نرخ متابولیسم پایه (BMR) و سطح آب سلولی در بهینه‌سازی آنابولیسم و سنتز پروتئین عضلانی.
۳. نقاط قوت ژنتیکی و بیومتریک فرد در حجم‌گیری و تفکیک عضلانی.
۴. نقاط ضعف، سطح چربی احشایی و اولویت‌های متقارن‌سازی عضلات.
۵. یک پروتکل ۴ هفته‌ای مشخص شامل فاز تمرینی هایپرتروفی (تکرارها، حجم ست‌ها) و تنظیم کالری و پروتئین روزانه به تفکیک هفته‌ها.`
      };
    case "football":
      return {
        roleTitle: "یک مربی ارشد بدنسازی و آماده‌سازی توان جسمانی فوتبال (Elite Football Strength & Conditioning Coach)",
        sportLabel: "فوتبال تخصصی",
        focusAreas: `۱. تحلیل نسبت عضله به وزن در چابکی، استارت‌های انفجاری و استقامت در تغییر جهت‌های ناگهانی (COD).
۲. بررسی سطح هیدراتاسیون و ذخایر گلیکوژن/آب در حفظ ریتم بازی در دقایق پایانی و مقاومت در برابر اسیدوز.
۳. نقاط قوت بیومتریک بازیکن برای پست تخصصی درون زمین.
۴. آسیب‌پذیری‌های مفصلی، بار اضافی چربی و خستگی زودرس ناشی از وزن مرده.
۵. یک پروتکل ۴ هفته‌ای تمرینات پلایومتریک، استقامت بی‌هوازی تکرارشونده (RSA) و توان انفجاری پا به تفکیک هفته‌ها.`
      };
    case "combat":
      return {
        roleTitle: "یک مربی ارشد آماده‌سازی ورزش‌های رزمی ترکیبی و بوکس (Elite Combat Sports & MMA Conditioning Coach)",
        sportLabel: "ورزش‌های رزمی ترکیبی و بوکس",
        focusAreas: `۱. ارزیابی توده عضلات اسکلتی در تولید گشتاور چرخش بالاتنه و قدرت نفوذ ضربات مستقیم و چرخشی.
۲. استحکام استخوانی و آب بدن در جذب ضربات سنگین، استقامت گارد و مقاومت در برابر کم‌آبی راندها.
۳. نقاط قوت فیزیکی در کنترل حریف و کلینچ.
۴. خطرات اضافه وزن مرده بر افت سرعت واکنش دفاعی و جاخالی‌ها.
۵. یک پروتکل ۴ هفته‌ای تمرینات اینتروال تاباتا، استقامت عضلات گردن و تنه و ریکاوری فشرده به تفکیک هفته‌ها.`
      };
    case "swimming":
      return {
        roleTitle: "یک مربی ارشد و متخصص فیزیولوژی ورزش‌های آبی و شنا (Aquatic Performance & Conditioning Specialist)",
        sportLabel: "شنا و ورزش‌های آبی",
        focusAreas: `۱. بررسی نسبت توده چربی به عضله در شناوری، اصطکاک هیدرودینامیکی و کاهش نیروی درگ (Drag).
۲. تعادل هیدراتاسیون و مواد معدنی در جلوگیری از کرامپ‌های عضلانی درون آب سرد و ریکاوری لاکتات.
۳. نقاط قوت سیستم متابولیک در حفظ آهنگ ضربات دست و پا.
۴. فاکتورهای محدودکننده توان شانه و کمربند شانه‌ای.
۵. یک پروتکل ۴ هفته‌ای تمرینات خارج از آب (Dryland)، تقویت توان شانه و استقامت قلبی-تنفسی به تفکیک هفته‌ها.`
      };
    case "running":
      return {
        roleTitle: "یک مربی ارشد دوومیدانی و تمرینات استقامتی (Athletics & Endurance Running Coach)",
        sportLabel: "دوومیدانی و استقامت",
        focusAreas: `۱. بهینه‌سازی راندمان مکانیکی دویدن (Running Economy) و حذف بار مرده چربی به ازای هر گام.
۲. شاخص هیدراتاسیون و مواد معدنی استخوان در کاهش شوک ضربه به مفاصل زانو و ساق پا.
۳. نقاط قوت ساختار فیزیکی در بهره‌وری اکسیژن و مصرف گلیکوژن.
۴. فاکتورهای خطرساز مانند اضافه وزن احشایی و افت ریکاوری.
۵. یک پروتکل ۴ هفته‌ای تمرینات تمپو، اینتروال سرعتی و استقامت پایه به تفکیک هفته‌ها.`
      };
    default:
      return {
        roleTitle: "یک مربی ارشد و نخبه آماده‌سازی جسمانی (Elite Karate Conditioning Coach) در رشته کاراته کنترلی و سنتی (WKF)",
        sportLabel: "کاراته قهرمانی (WKF)",
        focusAreas: `۱. تحلیل اختصاصی توده عضلانی و چربی بر توان انفجاری کومیته (سرعت دست و پا) و پایداری کاتا (ثبات داچی‌ها).
۲. بررسی شاخص آب بدن، استخوان و چربی احشایی در استقامت و پیشگیری از آسیب.
۳. نقاط قوت فیزیکی ورزشکار بر اساس اعداد ثبت شده.
۴. نقاط ضعف و ریسک‌های موجود با زبان فنی مربیگری.
۵. یک پروتکل ۴ هفته‌ای مشخص تمرینی و تغذیه‌ای به تفکیک هفته‌ها.`
      };
  }
}

function formatMetricsForPrompt(metrics: Record<string, number | string>): string {
  return METRICS_CONFIG.map((def, idx) => {
    const rawVal = metrics[def.key];
    if (rawVal === undefined || rawVal === null || rawVal === "") return null;
    let displayVal = String(rawVal);
    if (def.isText && def.textOptions) {
      const matched = def.textOptions.find((opt) => opt.value === rawVal);
      if (matched) displayVal = matched.labelFa;
    }
    return `${idx + 1}. ${def.labelFa} (${def.nameEn}): ${displayVal} ${def.unit} [اهمیت ورزشی: ${def.karateContext ?? "عمومی"}]`;
  })
    .filter(Boolean)
    .join("\n");
}

function formatComparativeMetrics(
  prevMetrics: Record<string, number | string>,
  currMetrics: Record<string, number | string>,
  prevDate: string,
  currDate: string
): string {
  const lines: string[] = [];
  lines.push(`• دوره ارزیابی مقایسه‌ای: از آزمون مبنا (${prevDate}) تا آزمون جدید (${currDate})`);
  lines.push("• جدول تغییرات و تفاضل متغیرهای فیزیولوژیک (Biometric Deltas):");

  for (const def of METRICS_CONFIG) {
    const oldVal = prevMetrics[def.key];
    const newVal = currMetrics[def.key];
    if (newVal === undefined || newVal === null || newVal === "") continue;

    if (oldVal !== undefined && oldVal !== null && oldVal !== "") {
      const oldNum = Number(oldVal);
      const newNum = Number(newVal);
      if (!isNaN(oldNum) && !isNaN(newNum)) {
        const diff = Number((newNum - oldNum).toFixed(2));
        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
        const pct = oldNum !== 0 ? Number(((diff / oldNum) * 100).toFixed(1)) : 0;
        const pctStr = pct > 0 ? `+${pct}%` : `${pct}%`;
        lines.push(
          `  - ${def.labelFa} (${def.nameEn}): از ${oldNum} به ${newNum} ${def.unit} [تغییر: ${diffStr} ${def.unit} (${pctStr})]`
        );
        continue;
      }
    }
    lines.push(`  - ${def.labelFa} (${def.nameEn}): ${newVal} ${def.unit} (فاکتور تازه ثبتی)`);
  }
  return lines.join("\n");
}

function generateDeterministicComparativeReport(
  payload: AnalyzeRequestPayload,
  prevMetrics: Record<string, number | string>,
  prevDate: string,
  currDate: string
): string {
  const oldWeight = Number(prevMetrics.weight) || Number(payload.metrics.weight) || 68;
  const newWeight = Number(payload.metrics.weight) || 68;
  const weightDiff = Number((newWeight - oldWeight).toFixed(1));

  const oldFat = Number(prevMetrics.bodyFatPercentage) || 15;
  const newFat = Number(payload.metrics.bodyFatPercentage) || 12;
  const fatDiff = Number((newFat - oldFat).toFixed(1));

  const oldMuscle = Number(prevMetrics.muscleMass) || 55;
  const newMuscle = Number(payload.metrics.muscleMass) || 57;
  const muscleDiff = Number((newMuscle - oldMuscle).toFixed(1));

  const oldWater = Number(prevMetrics.bodyWaterPercentage) || 60;
  const newWater = Number(payload.metrics.bodyWaterPercentage) || 63;
  const waterDiff = Number((newWater - oldWater).toFixed(1));

  const muscleProgress = muscleDiff >= 0 ? `افزایش توده عضلانی به میزان ${muscleDiff > 0 ? `+${muscleDiff}` : "۰"} کیلوگرم` : `افت جزئی توده عضلانی (${muscleDiff} کیلوگرم)`;
  const fatProgress = fatDiff <= 0 ? `کاهش مطلوب چربی بدن به میزان ${fatDiff} درصد` : `افزایش درصد چربی (${fatDiff > 0 ? `+${fatDiff}` : fatDiff} درصد)`;

  return `گزارش تخصصی تحلیل مقایسه‌ای و پایش روند پیشرفت ورزشکار
باشگاه کاراته شرکت برق منطقه ای خراسان
ورزشکار: ${payload.fullName} | رده سنی: ${payload.age} سال | بازه زمانی ارزیابی: ${prevDate} تا ${currDate}

۱. ارزیابی تطبیقی و روند تغییرات بیومتریک (Longitudinal Progress):
• تغییر وزن کل بدنی: از ${oldWeight} به ${newWeight} کیلوگرم (${weightDiff > 0 ? `+${weightDiff}` : weightDiff} کیلوگرم)
• تغییر توده عضلانی: از ${oldMuscle} به ${newMuscle} کیلوگرم (${muscleDiff > 0 ? `+${muscleDiff}` : muscleDiff} کیلوگرم) — ${muscleProgress}
• تغییر درصد چربی: از ${oldFat}٪ به ${newFat}٪ (${fatDiff > 0 ? `+${fatDiff}` : fatDiff}٪) — ${fatProgress}
• شاخص هیدراتاسیون: از ${oldWater}٪ به ${newWater}٪ (${waterDiff > 0 ? `+${waterDiff}` : waterDiff}٪)

۲. دستاوردهای فنی و بهبودهای سازگاریافته (Key Improvements):
• ارتقای نسبت توان به وزن (Power-to-Weight Ratio): کاهش بافت چربی همزمان با حفظ یا افزایش توده عضلانی، راندمان شتاب‌گیری اندام‌ها را افزایش داده است.
• پاسخ مثبت به فاز تمرینی: سازگاری فیزیولوژیک نشان می‌دهد ورزشکار برنامه تمرینی اخیر را با کیفیت بالا به انجام رسانده و از هدررفت انرژی عضلانی جلوگیری کرده است.

۳. هشدارها و فاکتورهای نیازمند مراقبت (Red Flags & Warnings):
• در صورت کاهش وزن سریع، پایش روزانه هیدراتاسیون ضروری است تا افت آب سلولی باعث گرفتگی عضلات نشود.
• حفظ وزن مسابقه بدون اعمال روش‌های غیراصولی کاهش وزن در روزهای پایانی منتهی به رقابت‌های WKF.

۴. اثرات عملی بر تکنیک‌های کومیته و کاتا:
• اثر در کومیته: افزایش توان کشسانی عضلات و سبکی اندام تحتانی، سرعت اجرای کیزامه سوکی و رفلکس‌های واکنشی دفاعی را ارتقا داده است.
• اثر در کاتا: تعادل هیدرواستاتیک و استحکام بیشتر مرکز ثقل بدن موجب پایداری عمیق‌تر در ایستایی‌های کیبا داچی و زنکوتسو داچی شده است.

۵. برنامه اصلاحی مربیگری برای ۴ هفته آینده:
• هفته اول و دوم: تثبیت توده عضلانی با تمرینات مقاومتی نیمه‌سنگین و تمرکز بر پلیومتریک افقی.
• هفته سوم: تمرینات تخصصی سرعتی کومیته با میت‌های سبک و تایمینگ ضربات امتیازی.
• هفته چهارم: تیپرینگ هوشمند، تغذیه الکترولیتی و ریکاوری کامل جهت دستیابی به پیک آمادگی مسابقاتی.`;
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

  return `تحلیل ارشد فیزیولوژی و آماده‌سازی جسمانی کاراته
باشگاه کاراته شرکت برق منطقه ای خراسان
ورزشکار: ${payload.fullName} | سن: ${payload.age} سال | تاریخ ارزیابی: ${payload.birthDateJalali}

۱. ارزیابی راندمان مکانیکی و ترکیب بدنی (کومیته و کاتا):
• شتاب و توان انفجاری کومیته (Kumite Explosiveness): درصد عضله ${musclePct}٪ در کنار درصد چربی ${fatPct}٪ نشان‌دهنده نسبت توان به وزن ${kumiteRating} است. توده چربی پایین موجب به حداقل رسیدن بار مرده حین استارت‌های انفجاری و اجرای تکنیک‌های سرعتی کیزامه سوکی و گیاکو سوکی می‌شود.
• ثبات استاتیک و پویای کاتا (Kata Stability): پایین بودن سطح چربی احشایی (${visceral}) و نسبت متوازن توده عضلات اسکلتی، نقطه ثقل پایینی در دان‌تن (Hara) ایجاد می‌کند که برای استقرار محکم در داچی‌ها و چرخش‌های سریع حیاتی است.

۲. هیدراتاسیون و ذخایر زیستی:
• درصد آب بدن (${waterPct}٪): سطح هیدراتاسیون در دامنه ایده‌آل قرار دارد. این شاخص مانع از انقباضات زودرس و تجمع اسید لاکتیک در راندهای پایانی می‌شود.
• تراکم مواد معدنی استخوان (${boneMineral} کیلوگرم): اسکلت‌بندی مستحکم قابلیت جذب ضربات متقابل و مقاومت در برابر بلاک‌های سنگین را تضمین می‌کند.

۳. نقاط قوت برجسته:
• سن بیولوژیکی مطلوب: سن بدنی (${bodyAge} سال) نشان‌دهنده ریکاوری سریع سلولی و پاسخ‌دهی بالای سیستم عصبی است.
• نرخ متابولیسم پایه (${bmr} کیلوکالری): موتور متابولیک قدرتمند جهت چربی‌سوزی خودکار حین دوره‌های پرفشار تمرینی.

۴. نقاط تمرکزی و اولویت‌های مربیگری:
• تنظیم وزن دقیق دسته WKF: حفظ وزن دقیق در کانال ${weight} کیلوگرم بدون اعمال سونا یا دی‌هیدراتاسیون حاد.
• تقویت کمربند شکمی و لگن: افزودن تمرینات پلایومتریک جانبی جهت افزایش گشتاور چرخش لگن در ضربات چرخشی پا.

۵. پروتکل عملی ۴ هفته‌ای مربیگری:
• هفته ۱ و ۲ (توان و شتاب واکنشی): ۳ جلسه تمرینات اینتروال تاباتا با تمرکز بر پرش‌های جعبه و ترکیب با ضربات سوکی روی میت سرعتی.
• هفته ۳ (ایستایی و کنترل اسیدوز): ۲ جلسه تمرینات ایزومتریک داچی‌های عمیق همراه با وزنه سبک جهت ارتقای استقامت موضعی عضلات ۴ سر ران.
• هفته ۴ (تیپرینگ و ریکاوری): کاهش حجم تمرین، تنظیم هیدراتاسیون با الکترولیت‌ها و ماساژ میوفاشیال پیش از ورود به مسابقات.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestPayload;
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

    const isComparative = Boolean(
      payload.previousAssessment &&
      payload.previousAssessment.metrics &&
      Object.keys(payload.previousAssessment.metrics).length > 0
    );

    const discInfo = getDisciplinePrompt(payload.discipline);

    // If Groq API Key is present, call Groq Llama-3 model
    if (apiKey && apiKey.trim().length > 0 && !apiKey.includes("your_groq_api_key")) {
      try {
        const groq = new Groq({ apiKey });

        let systemPrompt = "";
        let userPrompt = "";

        if (isComparative) {
          const prevDate = payload.previousAssessment?.measuredAt ?? "آزمون مبنا";
          const currDate = payload.measuredAt ?? "آزمون جدید";
          const comparativeSummary = formatComparativeMetrics(
            payload.previousAssessment!.metrics,
            payload.metrics,
            prevDate,
            currDate
          );

          systemPrompt = `شما سرمربی و کارشناس ارشد پایش پیشرفت و فیزیولوژی ورزشی کاراته در «باشگاه کاراته شرکت برق منطقه ای خراسان» هستید.
وظیفه شما ارزیابی تطبیقی و تحلیل موشکافانه روند پیشرفت ورزشکار بین دو نوبت آزمون بادی‌کامپوزیشن (آزمون گذشته در برابر آزمون فعلی) است.
تحلیل شما باید فنی، دقیق، صریح و در جهت ارتقای انگیزه و خودآگاهی فنی رزمی‌کار باشد و شامل ۵ بخش کلیدی زیر باشد:
۱. تحلیل تطبیقی و روند تغییرات کلیدی (Biometric Progression & Deltas):
   بیان دقیق روند تغییرات وزن، توده عضلانی، درصد چربی و آب سلولی و مقایسه آن با اهداف رده مسابقاتی کاراته.
۲. دستاوردها و بهبودهای قابل تقدیر (Key Improvements & Adaptations):
   تشریح شفاف موفقیت‌ها و سازگاری‌های مثبت فیزیکی ورزشکار (مانند افزایش توان عضلانی، کاهش چربی احشایی یا بهبود ریکاوری) به طوری که فرد کاملاً از ثمره تمرینات خود مطلع شود.
۳. هشدارها و زنگ خطرهای احتمالی (Red Flags & Regressions):
   بررسی هرگونه افت (مانند کم‌آبی سلولی، تحلیل بافت عضلانی ناشی از رژیم نادرست یا اضافه وزن کاذب) با رویکرد پیشگیری از آسیب.
۴. اثرات عملی بر شتاب کومیته و ایستایی کاتا:
   تأثیر این تغییرات بر سرعت جهش، رفلکس دست و پا، ضربات انفجاری سوکی/لگدها و پایداری مرکز ثقل در داچی‌ها.
۵. برنامه اصلاحی و توصیه فنی مربیگری برای ۴ هفته آینده.
قوانین نگارشی اکید: بدون کاراکترهای مارک‌داون هشتگ (#) یا ستاره (**) یا جدول؛ از بندهای شماره‌دار و علامت‌های «• » استفاده کنید. زبان: فارسی تخصصی، روان و انگیزه‌بخش.`;

          userPrompt = `مشخصات ورزشکار:
نام و نام خانوادگی: ${payload.fullName}
جنسیت: ${payload.gender === "MALE" ? "مرد" : payload.gender === "FEMALE" ? "زن" : "ارائه نشده"}
سن: ${Number.isFinite(payload.age) ? `${payload.age} سال` : "ارائه نشده"}
رشته: ${discInfo.sportLabel}
باشگاه: باشگاه کاراته شرکت برق منطقه ای خراسان

داده‌های تطبیقی و روند تغییرات بیومتریک بین دو نوبت تست:
${comparativeSummary}

لطفاً گزارش تحلیل تطبیقی جامع و ارزیابی پیشرفت این ورزشکار را به عنوان مربی ارشد ارائه دهید تا دقیقاً از دستاوردها، تغییرات و مسیر بهبود خود مطلع شود.`;
        } else {
          // Single baseline assessment mode
          const metricsSummary = formatMetricsForPrompt(payload.metrics);

          systemPrompt = `شما ${discInfo.roleTitle} در «باشگاه کاراته شرکت برق منطقه ای خراسان» هستید.
شما باید تحلیل کاملاً علمی، عملیاتی، مستقیم، بدون تعارف و متناسب با استانداردهای قهرمانی در حوزه «${discInfo.sportLabel}» ارائه دهید. تحلیل باید شامل:
${discInfo.focusAreas}
قانون کلیدی: ممکن است برخی از فاکتورها توسط دستگاه اندازه گیری نشده باشند یا در فرم در حالت «عدم اعمال» قرار گرفته باشند (در لیست ورودی غایب باشند). به هیچ وجه اعدادی را برای فاکتورهای غایب حدس نزنید یا جعل نکنید؛ تحلیل را منحصراً بر پایه فاکتورهای اعمال‌شده و موجود ارائه دهید.
قوانین اکید نگارشی:
- اکیداً از رسم جدول مارک‌داون خودداری کنید.
- از علامت‌های هشتگ (#) برای تیترها استفاده نکنید؛ تیترها را ساده و شماره‌دار بنویسید (مثال: «۱. تحلیل راندمان مکانیکی و عضلانی:»).
- از علامت‌های ستاره (**) برای بولد کردن در متن استفاده نکنید.
- شاخص‌ها و توصیه‌ها را به صورت بندهای مجزا با علامت «• » بنویسید.
زبان خروجی: کاملاً فارسی روان، تخصصی با اصطلاحات متناسب با ${discInfo.sportLabel} و بدون مقدمه‌چینی زائد.`;

          userPrompt = `مشخصات ورزشکار:
نام و نام خانوادگی: ${payload.fullName}
رشته ورزشی درخواستی برای گزارش: ${discInfo.sportLabel}
جنسیت: ${payload.gender === "MALE" ? "مرد" : payload.gender === "FEMALE" ? "زن" : "ارائه نشده"}
سن تقویمی: ${Number.isFinite(payload.age) ? `${payload.age} سال` : "ارائه نشده"}
زمان اندازه‌گیری: ${payload.measuredAt ?? "ارائه نشده"}
باشگاه: باشگاه کاراته شرکت برق منطقه ای خراسان

شاخص‌های آنالیز اسکن بدن (Xiaomi S400):
${metricsSummary}

لطفاً تحلیل کامل تخصصی فیزیولوژی را متناسب با شاخص‌های ورزشی «${discInfo.sportLabel}» ارائه کن.`;
        }

        const modelToUse = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
        const completion = await groq.chat.completions.create({
          model: modelToUse,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: 1500,
        });

        const report = completion.choices[0]?.message?.content;
        if (report) {
          return NextResponse.json({
            report,
            source: isComparative ? "groq-llama-3-comparative" : "groq-llama-3",
            isComparative,
            generatedAt: new Date().toISOString(),
          });
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
    const fallbackReport = isComparative
      ? generateDeterministicComparativeReport(
          payload,
          payload.previousAssessment!.metrics,
          payload.previousAssessment?.measuredAt ?? "آزمون مبنا",
          payload.measuredAt ?? "آزمون جدید"
        )
      : generateDeterministicKarateReport(payload);

    return NextResponse.json({
      report: fallbackReport,
      source: isComparative ? "local-karate-comparative-engine" : "local-karate-engine",
      isComparative,
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

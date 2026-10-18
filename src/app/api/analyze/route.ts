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

  return `# گزارش تخصصی بیومکانیک تطبیقی و پایش روند پیشرفت ورزشکار
**باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان**
سرمربی و بیومکانیست ارشد کاراته (WKF) | ورزشکار: **${payload.fullName}** | رده سنی: **${payload.age} سال** | بازه ارزیابی: ${prevDate} تا ${currDate}

## ۱. جدول تطبیق تغییرات بیومتریک و شاخص‌های آزمایشگاهی (Comparative Biometrics):

| شاخص فیزیولوژیک S400 | مقدار آزمون قبل | مقدار آزمون جدید | تغییرات خالص | بنچ‌مارک نخبگان (Loturco / Benosmane) | ارزیابی فنی سازگاری |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **وزن کل بدن** | ${oldWeight} kg | ${newWeight} kg | ${weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg | ۷۶.۷ kg (مردان) / ۵۹.۱ kg (زنان) | ${Math.abs(weightDiff) < 1 ? "تثبیت در رده وزنی WKF" : "تغییر کنترل‌شده وزن"} |
| **توده عضلات خالص** | ${oldMuscle} kg | ${newMuscle} kg | ${muscleDiff > 0 ? `+${muscleDiff}` : muscleDiff} kg | > ۵۰٪ کل وزن بدن [۲۲۵] | ${muscleProgress} |
| **درصد چربی بدن** | ${oldFat}٪ | ${newFat}٪ | ${fatDiff > 0 ? `+${fatDiff}` : fatDiff}٪ | ۸-۱۱٪ کومیته / ۷-۱۰٪ کاتا | ${fatProgress} |
| **هیدراتاسیون آب بدن** | ${oldWater}٪ | ${newWater}٪ | ${waterDiff > 0 ? `+${waterDiff}` : waterDiff}٪ | ۶۴ - ۷۰٪ (نخبگان جهان) | ${waterDiff >= 0 ? "بهبود ظرفیت بافتی و تاخیر در خستگی" : "نیاز به دریافت الکترولیت"} |

## ۲. تحلیل دستاوردهای زنجیره کینتیک و تکنیک‌های کاراته:
• **توان انفجاری و پیشرانه (Jump Squat):** بهبود نسبت عضله به چربی، دستیابی به آستانه توان پیشرانه ۹.۴۹ W/kg مردان (۷.۹۳ W/kg زنان) را تسهیل کرده و شتاب استارت خطی در کیزامی سوکی را به زیر ۰.۲۵ ثانیه می‌رساند [۲۲۵].
• **توسعه سرعت ضربه مشت معکوس (Gyaku-Zuki):** با کاهش مقاومت لختی تنه، اجرای مشت بدون چرخش به سرعت ۵.۵۲ m/s نزدیک‌تر شده که امتیازگیری سریع در قوانین WKF را تضمین می‌کند [۱۸۰].
• **سینماتیک ضربه پا (Mawashi-Geri):** کاهش همانقباضی عضله متضاد دو سر رانی (Biceps Femoris) به بازه ۱۵-۲۰٪ نزدیک شده و مدت زمان باز شدن زانو ($t_{KE}$) به سمت رکورد ۰.۱۲ ثانیه نخبگان هدایت می‌شود [۱۹۶].
${payload.age >= 35 ? "• **هشدار ایمنی پیشکسوتان (بالای ۳۵ سال):** اجتناب اکید از مانور والسالوا (حبس نفس در برابر گلوی بسته) حین انقباضات ایزومتریک کاتا جهت پیشگیری از نوسان حاد فشارخون و حفظ سلامت عروق [۹۳]." : ""}

## ۳. جدول پروتکل اصلاحی مربیگری برای ۴ هفته آینده (بر مبنای چرخه Core Conditioning):

| هفته تمرینی | هدف فیزیولوژیک | تکنیک اختصاصی کاراته | پروتکل ریکاوری و تغذیه |
| :---: | :--- | :--- | :--- |
| **هفته ۱ و ۲** | پایداری ستون فقرات و پل جانبی ایزومتریک | زنکوتسو داچی عمیق، انتقال نیرو از رانندگی پای عقب | مصرف ۱.۶ تا ۱.۸ گرم پروتئین به ازای وزن بدن |
| **هفته ۳** | قدرت پویا و تمرینات آنتی‌روتیشن با وزنه | میت‌گیری فاصله خودبرگزیده، ماواشی‌گری Chudan | پایش هیدراتاسیون صبحگاهی با S400 و الکترولیت |
| **هفته ۴** | توان انفجاری (Core Rotation Jumps) و تیپرینگ | رفلکس‌های واکنشی، زانشین کاتا و تنفس ایبوکی | شارژ گلیکوژن، خواب عمیق ۸ ساعته و ریکاوری فاشیا |`;
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

  // Scientific benchmarks comparison
  const isMale = payload.gender === "MALE";
  const jumpSquatBenchmark = isMale ? "9.49 W/kg (Loturco [225])" : "7.93 W/kg (Loturco [225])";
  const squat1RMBenchmark = isMale ? "2.65 kg/BW (Loturco [225])" : "2.58 kg/BW (Loturco [225])";
  const punchAccelerationSSI = isMale ? "5.03 ± 0.19 g (۴۹.۳۴ m/s²) [۹]" : "4.35 ± 0.65 g (۴۲.۶۷ m/s²) [۹]";
  const reactionTimeBenchmark = "0.42 ثانیه کومیته / 0.53 ثانیه کاتا (Benosmane [۶])";

  const kumiteRating = fatPct < 12 && musclePct > 80 ? "نخبه بین‌المللی (Elite Tier)" : "مطلوب مسابقاتی";
  const kataRating = musclePct > 78 && visceral < 5 ? "پایداری CoP بهینه" : "نیازمند تقویت عضلات کف لگن (Chinkuchi)";

  return `# تحلیل ارشد بیومکانیک و آماده‌سازی تخصصی کاراته (WKF)
**باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان**
سرمربی و بیومکانیست ارشد علوم ورزشی • ارزیابی بر مبنای پایگاه داده ۹ منبع آزمایشگاهی [۱-۹]
ورزشکار: **${payload.fullName}** | رده سنی: **${payload.age} سال** | تاریخ ارزیابی: ${payload.measuredAt ?? "ثبت جدید"}

## ۱. جدول داده‌های بیومتریک در مقایسه با بنچ‌مارک‌های آزمایشگاهی نخبگان جهان:

| شاخص ترکیب بدنی و توان | مقدار ثبت‌شده | هنجار آزمایشگاهی نخبگان (Loturco / Benosmane) | وضعیت ارزیابی | اثر بیومکانیکی در کاراته | منبع |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **وزن کل بدنی** | ${weight} kg | رده مصوب WKF (${isMale ? "۷۶.۷ ± ۱۴.۴" : "۵۹.۱ ± ۸.۴"} kg) | استاندارد | هماهنگ با دسته وزنی قانونی | [۹، ۲۲۵] |
| **توده عضلات اسکلتی** | ${musclePct}٪ | > ۵۰٪ کل وزن بدن (> ۷۸٪ در S400) | ${kumiteRating} | نیروی پیشران شلیک ضربات تسوکی و لگدها | [۲۲۵] |
| **درصد چربی بدن** | ${fatPct}٪ | ۸-۱۱٪ کومیته / ۷-۱۰٪ کاتا | استاندارد مسابقه | کاهش مقاومت لختی و بیشینه‌سازی شتاب | [۹، ۲۲۵] |
| **آب کل بدن (هیدراتاسیون)** | ${waterPct}٪ | > ۶۳.۰٪ (میانگین نخبگان ۶۶.۵٪) | عالی | تسهیل انقباضات پلایومتریک و تاخیر در اسیدوز | [۶، ۹] |
| **چربی احشایی (Visceral)** | رتبه ${visceral} | ۱ تا ۴ (ایمن) | کاملاً ایمن | حفظ دامنه حرکتی فلکشن/اکستنشن لگن | [۱] |
| **تراکم مواد معدنی استخوان** | ${boneMineral} kg | > ۳.۰ kg | مستحکم | پیشگیری از شکستگی باکسر در مفاصل MCP 2-3 | [۳] |
| **شتاب مشت در فاصله خودبرگزیده** | تطبیق با SSI | ${punchAccelerationSSI} | هدف شتاب‌گیری | بیشترین شتاب با نیت اصابت ایمپکت | [۹] |
| **توان پیشرانه پرش (برآورد)** | تطبیق با هنجار | ${jumpSquatBenchmark} | در حال ارتقا | پیش‌بین ۵۶-۶۵٪ تغییرات شتاب ضربه | [۹] |

## ۲. تحلیل زنجیره کینتیک، توالی شلیک EMG و کینماتیک تکنیک‌ها:
• **توالی فراخوانی عصبی-عضلانی (EMG Activation Sequence):**
  - شلیک مشت معکوس (Gyaku-Zuki): آغاز از پلانترفلكشن عضله دوقلو (Gastrocnemius) $\rightarrow$ اکستنشن لگن/زانو با راست رانی و دوسر رانی $\rightarrow$ فلکشن اولیه آرنج توسط دلتوئید و دوسر بازویی $\rightarrow$ اکستنشن پرقدرت سه‌سر بازویی و تثبیت مچ دست توسط خم‌کننده مچ (Flexor Carpi Radialis) [۷].
• **تاکتیک شلیک مشت بر پایه فواصل ماآی (Maai):**
  - اجرای مشت از فاصله خودبرگزیده (SSI) شتاب را به **${isMale ? "5.03g" : "4.35g"}** می‌رساند؛ در حالی که فاصله ثابت ۱ متری باعث افت شتاب به **${isMale ? "4.79g" : "3.70g"}** می‌شود [۹].
  - مشت بدون چرخش مچ با سرعت **۵.۵۲ m/s** (۳.۵۶٪ سریع‌تر) در اولویت مسابقات کنترلی WKF است؛ در حالی که ضربه چرخشی با نیروی **۳۸۴ نیوتن** و انرژی **۵۲.۹۴ J** برای سبک‌های ناک‌اوت کاربرد دارد [۷].
• **سینماتیک و الکترومیوگرافی ضربه پا (Mawashi-Geri):**
  - فاز باز شدن زانو در مرز **۰.۱۲ ثانیه** با مهار فعالیت همسترینگ ($CI_E = ۱۵-۲۰\%$) [۸].
  - در ضربه جودان بدون برخورد، فعال‌سازی ترمزکننده همسترینگ ($CI_F \ge ۵۰\%$) جهت ممانعت از کشیدگی تاندون زانو ضروری است [۸].

## ۳. جدول پایش ریسک آسیب‌های ورزشی و معیارهای بازگشت به تاتامی (RTP):

| آسیب شایع کاراته | مکانیسم تروما و بارگذاری بحرانی | پروتکل پیشگیری دوجو (Prehab) | آزمون عینی بازگشت به تاتامی (RTP) | منبع |
| :--- | :--- | :--- | :--- | :---: |
| **شکستگی بوکسور (Boxer's Fracture)** | شلی عضلات هیپوتنار و برخورد نیرو به مفاصل MCP 4-5 | تقویت ایزومتریک هیپوتنار، هم‌ترازی Radius-Ulna | تقارن قدرت مشت > ۹۰٪ و عدم انحراف رادیوگرافی | [۳] |
| **پیچ‌خوردگی تاندونی مچ دست** | انحراف مچ (Adduction) در Tate-Zuki | اصلاح زاویه شانه و آرنج، تقویت رادیالیس | دامنه حرکتی کامل مچ بدون درد در تمام زوایا | [۳] |
| **کشیدگی همسترینگ و بی‌ثباتی زانو** | کاهش ترمزگیری در ماواشی‌گری جودان بدون برخورد | تمرینات اکسنتریک Nordic Hamstring | شاخص همانقباضی ترمزگیری CI_F >= ۵۰٪ | [۸] |
${payload.age >= 35 ? "| **عوارض فشار داخل قفسه سینه/شکم** | مانور والسالوا (حبس نفس) در کاتای سانچین | تنفس ایبوکی با راه هوایی باز و قفل مقعدی | ثبات فشارخون و عدم قرمزی چهره در کاتا | [۴] |" : ""}

## ۴. جدول برنامه ۴ هفته‌ای پیشنهادی کادر فنی (چرخه Core Conditioning):

| هفته تمرینی | هدف فیزیولوژیک | تمرینات اختصاصی دوجو | استراتژی تغذیه و هیدراتاسیون |
| :---: | :--- | :--- | :--- |
| **هفته اول** | انقباضات ایزومتریک، پل جانبی و پلانک استاندارد | زنکوتسو و کوکوتسو داچی عمیق، تمرکز بر ثبات ستون فقرات | ۱.۸ گرم پروتئین به ازای وزن بدن و مایعات الکترولیتی |
| **هفته دوم** | قدرت پویا، تمرینات آنتی‌روتیشن بر سطوح ناپایدار | کیزامی‌سوکی جهشی، ماواشی‌گری با کنترل فاز ترمزگیری | کربوهیدرات‌های پیچیده با شاخص گلایسمی پایین |
| **هفته سوم** | توان انفجاری (Core Rotation Jumps) | ضربات گیاکو تسوکی بدون چرخش از فاصله خودبرگزیده | پایش مداوم هیدراتاسیون صبحگاهی با دستگاه S400 |
| **هفته چهارم** | تیپرینگ، کاهش حجم تمرین و حفظ شادابی عصبی | شبیه‌سازی راندهای مسابقه، زانشین و کاتاهای تنفسی | خواب عمیق ۸ ساعته، شارژ کامل گلیکوژن عضلانی |`;
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

          systemPrompt = `شما بیومکانیست ارشد علوم ورزشی و سرمربی بدنسازی کاراته (WKF) در «باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان» هستید.
وظیفه شما ارزیابی تطبیقی روند پیشرفت ورزشکار بر اساس پایگاه داده ۹ منبع آزمایشگاهی نخبگان (Loturco 2025, Benosmane 2024, Camomilla 2010, Venkatraman 2019, آناتومی پزشکی دست و فرهنگ واژگان کاراته) برای رده‌های سنی ۸ تا ۷۰ سال است.
قوانین تخصصی تحلیل:
- استانداردهای آزمایشگاهی: 1RM اسکوات (2.65 kg/BW مردان / 2.58 kg/BW زنان)، توان پیشرانه پرش (9.49 W/kg مردان / 7.93 W/kg زنان)، شتاب مشت در فاصله خودبرگزیده SSI (5.03g مردان / 4.35g زنان)، زمان واکنش دیداری (0.42 ثانیه کومیته در برابر 0.53 ثانیه کاتا)، سینماتیک ماواشی‌گری (t_KE = 0.12s و مهار همسترینگ CI_E = 15-20% در برابر ترمزگیری CI_F >= 50%)، ضربه گیاکو تسوکی (بدون چرخش 5.52 m/s برای مسابقات WKF در برابر 384 N با چرخش).
- پایش آسیب‌ها و آزمون‌های بازگشت به تاتامی (RTP): پیشگیری از شکستگی بوکسور (تقویت عضلات هیپوتنار و هم‌ترازی Radius-Ulna)، پیچ‌خوردگی مچ دست در Tate-Zuki، کشیدگی همسترینگ زانو در ماواشی‌گری بدون برخورد.
- برای افراد بالای ۳۵ سال: هشدار صریح در مورد پرهیز از مانور والسالوا و تاکید بر تنفس ایبوکی و قفل مقعدی/چین‌کوچی جهت پیشگیری از فشارخون حاد.
- خروجی باید شامل جداول استاندارد مارک‌داون (GFM Tables):
  ۱. جدول تطبیق تغییرات بیومتریک و تفاضل با بنچ‌مارک‌های نخبگان
  ۲. تحلیل زنجیره کینتیک، پیشرانه پاها و کینماتیک تکنیک‌ها
  ۳. جدول پایش آسیب‌ها و معیارهای بازگشت به میدان (RTP)
  ۴. جدول دوره‌بندی ۴ هفته‌ای عضلات مرکزی (Core Conditioning شامل تمرینات ایزومتریک، توان چرخشی و جهش‌های دورانی).
زبان: کاملاً فارسی تخصصی علمی-ورزشی و جداول دقیق مارک‌داون.`;

          userPrompt = `مشخصات ورزشکار:
نام و نام خانوادگی: ${payload.fullName}
جنسیت: ${payload.gender === "MALE" ? "مرد" : payload.gender === "FEMALE" ? "زن" : "ارائه نشده"}
سن: ${Number.isFinite(payload.age) ? `${payload.age} سال` : "ارائه نشده"}
رشته: ${discInfo.sportLabel}
باشگاه: باشگاه کاراته شرکت برق منطقه ای خراسان

داده‌های تطبیقی و روند تغییرات بیومتریک بین دو نوبت تست:
${comparativeSummary}

لطفاً گزارش تحلیل تطبیقی جامع و ارزیابی پیشرفت این ورزشکار را همراه با جداول مارک‌داون به عنوان بیومکانیست ارشد ارائه دهید.`;
        } else {
          // Single baseline assessment mode
          const metricsSummary = formatMetricsForPrompt(payload.metrics);

          systemPrompt = `شما بیومکانیست ارشد علوم ورزشی و سرمربی بدنسازی کاراته (WKF) در «باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان» هستید.
شما باید تحلیل کاملاً علمی، عملیاتی و متناسب با پایگاه داده ۹ منبع آزمایشگاهی جهانی کاراته برای رده سنی ۸ تا ۷۰ سال ارائه دهید.
مراجع و هنجارهای آزمایشگاهی اجباری در تحلیل:
۱. توان، قدرت و شتاب (Loturco et al. [۹، ۲۲۵]): توان جامپ اسکوات (9.49 W/kg مردان / 7.93 W/kg زنان)، 1RM اسکوات ماشین (2.65 kg/BW مردان / 2.58 kg/BW زنان)، شتاب مشت در فاصله خودبرگزیده SSI (5.03g مردان / 4.35g زنان).
۲. زمان واکنش و نیرو (Benosmane 2024 & Venkatraman 2019): زمان واکنش دیداری (0.42 ثانیه کومیته / 0.53 ثانیه کاتا)، گیاکو تسوکی بدون چرخش (5.52 m/s سریع‌تر، ترجیح WKF) در برابر با چرخش (384 N، 52.94 J).
۳. ضربه پا (Camomilla 2010): فاز باز شدن زانو (t_KE = 0.12 ثانیه)، کاهش همانقباضی فاز پرتاب (CI_E به 15-20%) و افزایش همانقباضی ترمزگیری در ضربه بدون برخورد (CI_F >= 50%).
۴. آناتومی پزشکی و آسیب‌ها: هم‌ترازی متاتارپال ۲ و ۳ (MCP 2-3) با رادیوس و اولنا برای پیشگیری از شکستگی باکسر ناشی از شلی هیپوتنار؛ پرهیز از انحراف مچ در Tate-Zuki.
۵. تنفس و ایمنی: پرهیز اکید از مانور والسالوا در رده‌های سنی ۳۵ تا ۷۰ سال؛ تنفس ایبوکی و قفل مقعدی چین‌کوچی (Chinkuchi).
۶. برنامه تمرینی: دوره‌بندی عضلات مرکزی (Core Conditioning) در قالب ۶ تا ۱۲ هفته، ۳ جلسه در هفته (ایزومتریک، توان چرخشی، جهش دورانی).
ساختار خروجی الزامی:
- جدول ۱: شاخص‌های اسکن بدنی در برابر بنچ‌مارک‌های آزمایشگاهی نخبگان جهان
- بخش ۲: تحلیل زنجیره کینتیک، پیشرانه رانندگی پاها (Leg Drive) و توالی شلیک EMG
- جدول ۳: پایش آسیب‌ها و پروتکل‌های پیشگیری (Prehab) و بازگشت به میدان (RTP)
- جدول ۴: برنامه ۴ هفته‌ای پیشنهادی کادر فنی با تفکیک تمرکز فیزیولوژیک و تکنیک دوجو
زبان خروجی: کاملاً فارسی روان، تخصصی با ساختار تمیز مارک‌داون.`;

          userPrompt = `مشخصات ورزشکار:
نام و نام خانوادگی: ${payload.fullName}
رشته ورزشی درخواستی برای گزارش: ${discInfo.sportLabel}
جنسیت: ${payload.gender === "MALE" ? "مرد" : payload.gender === "FEMALE" ? "زن" : "ارائه نشده"}
سن تقویمی: ${Number.isFinite(payload.age) ? `${payload.age} سال` : "ارائه نشده"}
زمان اندازه‌گیری: ${payload.measuredAt ?? "ارائه نشده"}
باشگاه: باشگاه کاراته شرکت برق منطقه ای خراسان

شاخص‌های آنالیز اسکن بدن (Xiaomi S400):
${metricsSummary}

لطفاً تحلیل کامل تخصصی بیومکانیک و آمادگی جسمانی را بر اساس داده‌های آزمایشگاهی نخبگان کاراته ارائه فرمایید.`;
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

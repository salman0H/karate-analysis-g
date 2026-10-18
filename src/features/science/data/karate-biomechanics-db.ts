export interface KarateInjuryModel {
  id: string;
  nameEn: string;
  nameFa: string;
  jointOrRegion: string;
  prevalence: string;
  biomechanicalMechanism: string;
  criticalThreshold: string;
  prehabProtocol: string;
  returnToPlayCriteria: string;
  citation: string;
}

export interface EmgProfile {
  techniqueId: string;
  techniqueNameFa: string;
  techniqueNameEn: string;
  musclesInvolved: string[];
  activationOrder: string;
  coContractionIndex: {
    extensionPhase?: string;
    flexionBrakingPhase?: string;
  };
  eliteVsAmateurDifference: string;
  citation: string;
}

export interface JointKinematicsRange {
  movement: string;
  eliteIM: string;
  eliteNI: string;
  amateurIM: string;
  amateurNI: string;
  citation: string;
}

export interface MatchTelemetryModel {
  highIntensityBurstDuration: string;
  energySystemDominance: string;
  visualReactionTimeKumiteSec: number;
  visualReactionTimeKataSec: number;
  punchAccelerationPredictionPower: string;
  citation: string;
}

export interface TacticalMaaiModel {
  condition: string;
  accelerationMaleG: string;
  accelerationFemaleG: string;
  tacticalImplication: string;
  citation: string;
}

export const KARATE_INJURIES_DB: KarateInjuryModel[] = [
  {
    id: "INJ-001",
    nameEn: "Boxer's Fracture (4th & 5th Metacarpal)",
    nameFa: "شکستگی بوکسور (متاکارپ ۴ و ۵ دست)",
    jointOrRegion: "مفاصل متاتارپوفالانژیال (MCP 4-5)",
    prevalence: "شیوع بالا در کومیته (به‌ویژه مبتدیان)",
    biomechanicalMechanism: "انحراف مسیر ضربه Seiken یا شلی عضلات هیپوتنار (Hypothenar)، که باعث برخورد اولیه بندهای ۴ و ۵ به جای مفاصل MCP 2-3 و اعمال نیروی برشی محور طولی می‌شود [۳].",
    criticalThreshold: "برخورد مستقیم نیروی > ۳۰۰ نیوتن به مفاصل MCP 4-5 در وضعیت شلی عضله ابداکتور مینیمی دیجیتی [۳، ۷].",
    prehabProtocol: "تقویت ایزومتریک عضلات هیپوتنار، تمرین هم‌ترازی استخوان Radius-Ulna با متاتارپ‌های ۲ و ۳، چک تکیه‌گاه صلب مچ [۳].",
    returnToPlayCriteria: "تقارن قدرت مشت‌کردن (>۹۰٪ نسبت به دست سالم)، عدم انحراف زاویه‌ای متاکارپ در رادیوگرافی، پایداری مفاصل MCP [۳].",
    citation: "[۳]",
  },
  {
    id: "INJ-002",
    nameEn: "Wrist Sprain / Adduction Strain",
    nameFa: "پیچ‌خوردگی و انحراف مچ دست (Adduction Strain)",
    jointOrRegion: "مفاصل استخوان‌های مچ دست (Carpals)",
    prevalence: "شیوع متوسط در کومیته و کیهون",
    biomechanicalMechanism: "اجرای Tate-Zuki با انحراف مچ (Adduction) به جای اصلاح زاویه مفصل آرنج/شانه، که باعث گشتاور خمشی بر استخوان‌های کارپال می‌شود [۳].",
    criticalThreshold: "انحراف جانبی مچ دست همراه با انقباض ناگهانی در لحظه برخورد (Impact) [۳].",
    prehabProtocol: "اصلاح زاویه مفصل آرنج و شانه در Tate-Zuki، تقویت عضلات خم‌کننده و بازکننده مچ (Flexor & Extensor Carpi Radialis) [۳، ۷].",
    returnToPlayCriteria: "دامنه حرکتی کامل مچ بدون درد در تمام زوایا، اجرای Tate-Zuki با هم‌ترازی خط مستقیم بردار نیرو [۳].",
    citation: "[۳]",
  },
  {
    id: "INJ-003",
    nameEn: "Knee Instability & Hamstring Strain",
    nameFa: "آسیب همسترینگ و بی‌ثباتی مفصل زانو",
    jointOrRegion: "مفصل زانو و عضله دوسر رانی (Biceps Femoris)",
    prevalence: "شیوع بالا در کومیته (ضربات پا به سر)",
    biomechanicalMechanism: "کاهش ترمزگیری در فاز باز شدن زانو در Mawashi Geri Jodan (بدون برخورد / NI) و عدم انقباض ترمزکننده Biceps Femoris [۸].",
    criticalThreshold: "سرعت بالای باز شدن زانو با کاهش شاخص همانقباضی (CI_E < ۱۵٪) در انتهای دامنه حرکتی [۸].",
    prehabProtocol: "تمرینات اکسنتریک همسترینگ (Nordic Hamstring)، تقویت همزمان چهارسر و همسترینگ برای حفظ ثبات زانو [۱، ۸].",
    returnToPlayCriteria: "شاخص همانقباضی متوازن همسترینگ/چهارسر (CI_F >= ۵۰٪) در فاز ترمزگیری، تقارن سرعت زاویه‌ای زانو [۸].",
    citation: "[۸]",
  },
  {
    id: "INJ-004",
    nameEn: "Intrathoracic & Intraabdominal Pressure Pathologies",
    nameFa: "پاتولوژی‌های فشار داخل شکمی (افزایش حاد فشارخون، فتق و هموروئید)",
    jointOrRegion: "سیستم عروقی، قفسه سینه و کف لگن",
    prevalence: "اختصاصی کاتای سبک‌های ناهاته (Sanchin)",
    biomechanicalMechanism: "اجرای مانور والسالوا (Valsalva Maneuver) - بازدم زوری با راه هوایی بسته - که باعث افزایش شدید فشار داخل قفسه سینه و شکم می‌شود [۴].",
    criticalThreshold: "انقباض ایزومتریک شدید بدون تخلیه هوا، که بازگشت وریدی را مختل کرده و فشارخون را ناگهان جهش می‌دهد [۴].",
    prehabProtocol: "آموزش تنفس Ibuki با راه هوایی باز، انقباض همزمان اسفنکتور مقعد (Anal Lock) جهت حفظ پایداری کف حوضچه [۴].",
    returnToPlayCriteria: "بازگشت فشارخون سیستولی/دیاستولی به سطح نرمال حین اجرای کاتا، اجرای کامل Sanchin بدون سیانوز و قرمزی چهره [۴].",
    citation: "[۴]",
  },
  {
    id: "INJ-005",
    nameEn: "Ankle Sprain & Center of Pressure Imbalance",
    nameFa: "عدم تعادل و افت فشار پا (پیچ‌خوردگی مچ پا)",
    jointOrRegion: "مفصل مچ پا و قوس‌های کف پایی",
    prevalence: "شیوع متوسط در کومیته و کاتا",
    biomechanicalMechanism: "انتقال ناگهانی مرکز فشار (CoP) در فازهای انتقال وزن تک‌پا (Single-Leg Support) در Mae-Geri و stanceهای عریض [۶، ۸].",
    criticalThreshold: "جابجایی ناگهانی CoP خارج از محدوده اتکای پای ستون حین بارگذاری GRF بیشینه [۶].",
    prehabProtocol: "تمرینات حس عمقی (Proprioception) و پایداری تک‌پا روی صفحات تعادلی، تقویت عضلات Gastrocnemius و Tibialis [۱، ۶، ۷].",
    returnToPlayCriteria: "محدود شدن جابجایی CoP در صفحه استابیلومتری به محدوده ایمن، تقارن جابجایی وزن در فازهای ۴گانه ضربه [۶].",
    citation: "[۶]",
  },
];

export const KARATE_EMG_PROFILES: EmgProfile[] = [
  {
    techniqueId: "TECH-GZUKI",
    techniqueNameFa: "مشت معکوس (گیاکو تسوکی)",
    techniqueNameEn: "Gyaku-Zuki",
    musclesInvolved: [
      "Gastrocnemius (دوقلو)",
      "Rectus Femoris (راست رانی)",
      "Biceps Femoris (دوسر رانی)",
      "Trapezius (تراپزیوس)",
      "Deltoids (دلتوئیدها)",
      "Biceps Brachii (دوسر بازویی)",
      "Triceps Brachii (سه‌سر بازویی)",
      "Flexor Carpi Radialis (خم‌کننده مچ)",
    ],
    activationOrder: "Gastrocnemius (پلانترفلكشن) -> Rectus & Biceps Femoris (اکستنشن لگن/زانو) -> Trapezius, Deltoids & Biceps Brachii (فلکشن اولیه آرنج) -> Triceps Brachii & Flexor Carpi Radialis (اکستنشن نهایی و تثبیت مچ دست)",
    coContractionIndex: {
      extensionPhase: "مهار کامل مقاومت آنتاگونیست در فاز پرتاب خطی",
      flexionBrakingPhase: "انقباض متقارن ساعد در لحظه اصابت جهت صلبیت مشت",
    },
    eliteVsAmateurDifference: "نخبگان دارای هماهنگی سینرژیک بالاتری بین درایو پای عقب و چرخش لگن هستند؛ انتقال نیرو بدون تاخیر فاز انجام می‌گیرد [۷].",
    citation: "[۷]",
  },
  {
    techniqueId: "TECH-MGERI",
    techniqueNameFa: "ضربه چرخشی پا (ماواشی‌گری)",
    techniqueNameEn: "Mawashi-Geri",
    musclesInvolved: [
      "Gluteus Maximus (سرینی بزرگ)",
      "Vastus Lateralis (پهن خارجی)",
      "Rectus Femoris (راست رانی)",
      "Biceps Femoris (دوسر رانی)",
    ],
    activationOrder: "الگوی دوفازی هماهنگ GM و VL -> تاخیر فاز جزئی در RF -> ورود تاخیری BF جهت ترمزگیری نهایی",
    coContractionIndex: {
      extensionPhase: "نخبگان CI_E حدود ۱۵ تا ۲۰٪ (در برابر ۳۵ تا ۴۵٪ آماتورها)",
      flexionBrakingPhase: "در ضربه NI نخبگان CI_F به ۵۰ تا ۵۵٪ افزایش می‌یابد (۲۰٪ بالاتر از آماتورها) جهت محافظت از زانو",
    },
    eliteVsAmateurDifference: "خاموش‌سازی هدفمند Biceps Femoris در فاز پرتاب و فعال‌سازی شدید آن در پایان حرکت جهت ترمزگیری بدون آسیب [۸].",
    citation: "[۸]",
  },
];

export const KARATE_JOINT_KINEMATICS: JointKinematicsRange[] = [
  {
    movement: "فلکشن-اکستنشن زانو (K_fe)",
    eliteIM: "۱۴۰ ± ۹ درجه",
    eliteNI: "۱۳۵ ± ۱۰ درجه",
    amateurIM: "۱۱۶ درجه",
    amateurNI: "۱۱۹ درجه",
    citation: "[۸]",
  },
  {
    movement: "فلکشن-اکستنشن لگن (H_fe)",
    eliteIM: "۶۸ درجه",
    eliteNI: "۸۷ درجه",
    amateurIM: "۳۹ درجه",
    amateurNI: "۶۹ درجه",
    citation: "[۸]",
  },
  {
    movement: "ابداکشن-اداکشن لگن (H_aa)",
    eliteIM: "۲۳ درجه",
    eliteNI: "۳۲ درجه",
    amateurIM: "۲۸ درجه",
    amateurNI: "۴۴ درجه",
    citation: "[۸]",
  },
  {
    movement: "مدت زمان اکستنشن زانو (t_KE)",
    eliteIM: "۰.۱۲ ثانیه",
    eliteNI: "۰.۱۲ ثانیه",
    amateurIM: "۰.۱۱ ثانیه",
    amateurNI: "۰.۱۹ ثانیه",
    citation: "[۸]",
  },
  {
    movement: "تایمینگ ابداکشن تا فلکشن زانو (t_H-K)",
    eliteIM: "-۰.۰۴ تا ۰.۰۰ ثانیه (همزمان یا قبل)",
    eliteNI: "-۰.۰۴ تا ۰.۰۰ ثانیه",
    amateurIM: "+۰.۰۲ تا +۰.۰۴ ثانیه (با تاخیر)",
    amateurNI: "+۰.۰۲ تا +۰.۰۴ ثانیه",
    citation: "[۸]",
  },
];

export const KARATE_TACTICAL_MAAI: TacticalMaaiModel[] = [
  {
    condition: "فاصله خودبرگزیده با نیت ضربه (SSI)",
    accelerationMaleG: "5.03 ± 0.19 g (۴۹.۳۴ m/s²)",
    accelerationFemaleG: "4.35 ± 0.65 g (۴۲.۶۷ m/s²)",
    tacticalImplication: "ورزشکار با تنظیم خودکار فاصله ماآی و نیت ضربه‌زنی قوی، به حداکثر شتاب و نیروی نفوذ دست می‌یابد.",
    citation: "[۹]",
  },
  {
    condition: "فاصله ثابت یک‌متری با نیت سرعت (FS)",
    accelerationMaleG: "4.79 ± 0.21 g (۴۶.۹۹ m/s²)",
    accelerationFemaleG: "3.70 ± 0.88 g (۳۶.۳۰ m/s²)",
    tacticalImplication: "محدود کردن فاصله به ۱ متر باعث افت ۵ تا ۱۵ درصدی در شتاب خطی مشت می‌گردد.",
    citation: "[۹]",
  },
  {
    condition: "گیاکو تسوکی بدون چرخش مچ (WKF)",
    accelerationMaleG: "سرعت میانگین: ۵.۵۲ m/s",
    accelerationFemaleG: "نیروی برخورد: ۳۳۷ N",
    tacticalImplication: "۳.۵۶٪ سرعت بالاتر و زمان کمتر تا اصابت؛ ایده آل برای امتیازگیری رسمی یوکو در مسابقات کنترلی.",
    citation: "[۷]",
  },
  {
    condition: "گیاکو تسوکی با چرخش ۱۸۰ درجه مچ (Full-Contact)",
    accelerationMaleG: "نیروی برخورد: ۳۸۴ N (در ۵.۲۶ m/s)",
    accelerationFemaleG: "انرژی کل: ۵۴.۰۲ J",
    tacticalImplication: "افزایش ۶.۶۷٪ تا ۱۲.۱۶٪ نیرو و انتقال ۵۲.۹۴ ژول انرژی جنبشی؛ مطلوب برای سبک‌های آزاد و ناک‌اوت.",
    citation: "[۷]",
  },
];

export const KARATE_MATCH_TELEMETRY: MatchTelemetryModel = {
  highIntensityBurstDuration: "۰.۳ ± ۰.۱ ثانیه تا ۲.۱ ± ۱.۰ ثانیه",
  energySystemDominance: "سیستم فسفاژن (ATP-PCr) غالب در حملات انفجاری؛ هوازی در فاز ریکاوری بین‌رانده",
  visualReactionTimeKumiteSec: 0.42,
  visualReactionTimeKataSec: 0.53,
  punchAccelerationPredictionPower: "توان پرش اسکوات (۹.۴۹ W/kg مردان) و ۱RM اسکوات و پرس سینه ۵۶٪ تا ۶۵٪ شتاب مشت را تبیین می‌کنند",
  citation: "[۶، ۹]",
};

import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import {
  METRICS_CONFIG,
  MetricDefinition,
} from "@/config/metrics.config";
import { KREC_LOGO_DATA_URI } from "./logo-data";

// Register local Vazirmatn font for Persian RTL typography in react-pdf
const regularFontPath = path.join(process.cwd(), "public/fonts/Vazirmatn-Regular.ttf");
const boldFontPath = path.join(process.cwd(), "public/fonts/Vazirmatn-Bold.ttf");

Font.register({
  family: "Vazirmatn",
  fonts: [
    { src: regularFontPath, fontWeight: "normal" },
    { src: boldFontPath, fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Vazirmatn",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    fontSize: 8,
    direction: "rtl",
  },
  // Top Dual-Tone Ribbon
  topRibbon: {
    flexDirection: "row-reverse",
    height: 3,
    marginBottom: 6,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  ribbonEmerald: {
    flex: 4,
    backgroundColor: "#059669",
  },
  ribbonGold: {
    flex: 1,
    backgroundColor: "#d97706",
  },

  // Main Official Header
  headerWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#059669",
    paddingBottom: 5,
    marginBottom: 4.5,
  },
  headerRightGroup: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  headerLogoBox: {
    width: 52,
    height: 52,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogoImage: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  headerTextGroup: {
    flex: 1,
    textAlign: "right",
    alignItems: "flex-end",
  },
  systemPill: {
    alignSelf: "flex-end",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 2,
  },
  systemPillText: {
    fontSize: 5.5,
    color: "#065f46",
    fontWeight: "bold",
  },
  clubTitleFa: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#064e3b",
    letterSpacing: 0.1,
  },
  clubSubtitleFa: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  clubTitleEn: {
    fontSize: 5,
    color: "#64748b",
    marginTop: 0.5,
  },
  headerLeftGroup: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  // Technical Masters & Leadership Banner
  mastersBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 0.75,
    borderColor: "#cbd5e1",
    borderRightWidth: 3,
    borderRightColor: "#059669",
    borderRadius: 3.5,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 4.5,
  },
  mastersBadge: {
    backgroundColor: "#059669",
    borderRadius: 2.5,
    paddingHorizontal: 4.5,
    paddingVertical: 1.5,
    marginLeft: 6,
  },
  mastersBadgeText: {
    fontSize: 5.5,
    fontWeight: "bold",
    color: "#ffffff",
  },
  mastersTextCol: {
    flex: 1,
    textAlign: "right",
  },
  mastersTextFa: {
    fontSize: 6.8,
    fontWeight: "bold",
    color: "#0f172a",
  },
  mastersTextEn: {
    fontSize: 5,
    color: "#64748b",
    marginTop: 0.5,
  },
  docMetaBox: {
    alignItems: "flex-end",
    textAlign: "right",
  },
  docMetaLabel: {
    fontSize: 5.5,
    color: "#64748b",
  },
  docMetaBold: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 1,
  },
  selfieBox: {
    width: 48,
    height: 48,
    borderRadius: 5,
    borderWidth: 1.25,
    borderColor: "#059669",
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  selfieImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  // Athlete Identity Dossier
  athleteDossier: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 0.75,
    borderColor: "#cbd5e1",
    borderRightWidth: 3,
    borderRightColor: "#059669",
    borderRadius: 4,
    paddingVertical: 4.5,
    paddingHorizontal: 7,
    marginBottom: 5,
  },
  dossierCol: {
    flex: 1,
    textAlign: "right",
    paddingHorizontal: 2,
  },
  dossierLabelFa: {
    fontSize: 5.5,
    color: "#64748b",
  },
  dossierLabelEn: {
    fontSize: 4.5,
    color: "#94a3b8",
    marginTop: 0.5,
  },
  dossierValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  dossierSubNameEn: {
    fontSize: 5.5,
    color: "#475569",
    marginTop: 0.5,
  },

  // Section Heading Bar
  sectionHeadingBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ecfdf5",
    borderRightWidth: 2.5,
    borderRightColor: "#059669",
    borderRadius: 2.5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginBottom: 3.5,
    marginTop: 3.5,
  },
  sectionHeadingFa: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "right",
  },
  sectionHeadingEn: {
    fontSize: 5.5,
    color: "#047857",
  },

  // Hero KPI Highlights (6 Primary Athletic Metrics)
  heroGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 3.5,
    marginBottom: 2,
  },
  heroCard: {
    width: "15.8%",
    backgroundColor: "#ffffff",
    borderWidth: 0.75,
    borderColor: "#cbd5e1",
    borderRadius: 3.5,
    padding: 3,
    textAlign: "right",
    minHeight: 44,
  },
  heroCardEmerald: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  heroLabelFa: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "right",
  },
  heroLabelEn: {
    fontSize: 4.5,
    color: "#64748b",
    textAlign: "right",
    marginTop: 0.5,
  },
  heroValueContainer: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    justifyContent: "flex-start",
    marginTop: 1.5,
    flexWrap: "nowrap",
  },
  heroValueNum: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#065f46",
  },
  heroValueUnit: {
    fontSize: 5,
    color: "#475569",
    marginRight: 1.5,
  },
  heroBadgeText: {
    fontSize: 4.5,
    color: "#059669",
    fontWeight: "bold",
    marginTop: 1,
    textAlign: "right",
  },

  // Metrics Grid Matrix (4 columns, balanced)
  metricsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 3.5,
    marginBottom: 1.5,
  },
  metricCard: {
    width: "23.8%",
    backgroundColor: "#ffffff",
    borderWidth: 0.75,
    borderColor: "#e2e8f0",
    borderRadius: 3,
    paddingVertical: 2.5,
    paddingHorizontal: 4,
    marginBottom: 1.5,
  },
  metricHeaderGroup: {
    textAlign: "right",
    marginBottom: 0.5,
  },
  metricTitleFa: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "right",
  },
  metricTitleEn: {
    fontSize: 4.5,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 0.5,
  },
  metricValRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    justifyContent: "flex-start",
    marginTop: 1,
  },
  metricValNum: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },
  metricValUnit: {
    fontSize: 5,
    color: "#64748b",
    marginRight: 2,
  },
  metricValText: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "right",
  },

  // AI Karate Conditioning Coach Box
  aiSection: {
    marginTop: 3.5,
    borderWidth: 0.75,
    borderColor: "#10b981",
    borderRadius: 4,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  aiHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderBottomWidth: 0.75,
    borderBottomColor: "#a7f3d0",
    paddingVertical: 2.5,
    paddingHorizontal: 5,
  },
  aiHeaderRight: {
    textAlign: "right",
  },
  aiTitleFa: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "right",
  },
  aiTitleEn: {
    fontSize: 5,
    color: "#059669",
    textAlign: "right",
  },
  aiBadge: {
    backgroundColor: "#059669",
    borderRadius: 2.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  aiBadgeText: {
    fontSize: 5,
    color: "#ffffff",
    fontWeight: "bold",
  },
  aiBody: {
    padding: 4.5,
  },
  aiParagraph: {
    fontSize: 6,
    lineHeight: 1.4,
    color: "#1e293b",
    textAlign: "right",
    marginBottom: 2.5,
  },

  // Report Document Notice Bar
  reportNoticeBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    borderWidth: 0.75,
    borderColor: "#bbf7d0",
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginTop: 4,
    marginBottom: 3,
  },
  reportNoticeTextFa: {
    fontSize: 5.6,
    color: "#166534",
    fontWeight: "bold",
  },
  reportNoticeTextEn: {
    fontSize: 4.8,
    color: "#15803d",
  },

  // Footer Bar
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.75,
    borderTopColor: "#e2e8f0",
    marginTop: 4,
    paddingTop: 2.5,
  },
  footerTextRight: {
    fontSize: 5,
    color: "#64748b",
    textAlign: "right",
  },
  footerTextCenter: {
    fontSize: 5,
    color: "#94a3b8",
  },
  footerTextLeft: {
    fontSize: 5,
    color: "#059669",
    fontWeight: "bold",
  },
});

interface ReportDocumentProps {
  fullName: string;
  gender: "MALE" | "FEMALE";
  age: number;
  birthDateJalali: string;
  metrics: Record<string, number | string>;
  selfieDataUrl?: string | null;
  report: string;
  generatedAt: string;
}

// Persian numerals converter for pure RTL text flow
function toPersianDigits(n: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

// Clean text options mapping for Persian labels without parentheses
const BODY_TYPE_LABELS: Record<string, string> = {
  underweight: "لاغر و کمبود وزن",
  balanced: "متوازن استاندارد",
  balancedMuscular: "متوازن عضلانی • ایده‌آل کومیته",
  skinnyFat: "لاغر با درصد چربی بالا",
  muscular: "عضلانی قدرتی • ایده‌آل کاتا",
  thickSet: "تنومند سنگین‌وزن",
  overweight: "اضافه وزن",
  obese: "چاقی بیش از حد",
};

// Formats signed numbers cleanly
function formatSignedNumber(val: number | string | undefined): string {
  if (val === undefined || val === null || val === "") return "-";
  const num = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(num)) return String(val);
  if (num > 0) return `+${num}`;
  return String(num);
}

// Separates athlete name into Persian primary and English subtitle
function parseAthleteName(name: string): { nameFa: string; nameEn: string } {
  if (!name) return { nameFa: "-", nameEn: "" };
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return { nameFa: match[1].trim(), nameEn: match[2].trim() };
  }
  return { nameFa: name.trim(), nameEn: "" };
}

// Sanitizes AI coach report text to avoid react-pdf line-scrambling on mixed BiDi
function sanitizeAiReportParagraphs(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Remove trailing colons
      let cleaned = line.replace(/[:：]$/, "");
      // Remove parenthetical English Latin terms embedded in Persian text
      cleaned = cleaned.replace(/\([A-Za-z0-9\s\-–—/]+\)/g, "").replace(/\s{2,}/g, " ");
      return cleaned.trim();
    })
    .filter((line) => line.length > 0);
}

// Helper to render metric values safely in RTL
function renderMetricValue(
  def: MetricDefinition,
  val: number | string | undefined
) {
  if (val === undefined || val === null || val === "" || val === "-") {
    return (
      <View style={styles.metricValRow}>
        <Text style={[styles.metricValText, { color: "#94a3b8", fontSize: 6 }]}>
          اندازه‌گیری نشده
        </Text>
      </View>
    );
  }

  if (def.isText) {
    const rawVal = String(val);
    const labelFa = BODY_TYPE_LABELS[rawVal] || rawVal;
    return <Text style={styles.metricValText}>{labelFa}</Text>;
  }

  // Visceral fat rate special unit formatting
  if (def.key === "visceralFatRate") {
    return <Text style={styles.metricValText}>سطح {val}</Text>;
  }

  // Signed control values
  if (def.category === "control") {
    const signedStr = formatSignedNumber(val);
    return (
      <View style={styles.metricValRow}>
        <Text style={styles.metricValNum}>{signedStr}</Text>
        <Text style={styles.metricValUnit}>{def.unit}</Text>
      </View>
    );
  }

  return (
    <View style={styles.metricValRow}>
      <Text style={styles.metricValNum}>{String(val)}</Text>
      {def.unit ? <Text style={styles.metricValUnit}>{def.unit}</Text> : null}
    </View>
  );
}

export function ReportDocument({
  fullName,
  gender,
  age,
  birthDateJalali,
  metrics,
  selfieDataUrl,
  report,
  generatedAt,
}: ReportDocumentProps) {
  const { nameFa, nameEn } = parseAthleteName(fullName);

  // Extract primary Hero KPIs (safely check if provided/measured)
  const weight = metrics["weight"] !== undefined && metrics["weight"] !== null && metrics["weight"] !== "" ? metrics["weight"] : null;
  const bmi = metrics["bmi"] !== undefined && metrics["bmi"] !== null && metrics["bmi"] !== "" ? metrics["bmi"] : null;
  const bodyFat = metrics["bodyFatPercentage"] !== undefined && metrics["bodyFatPercentage"] !== null && metrics["bodyFatPercentage"] !== "" ? metrics["bodyFatPercentage"] : null;
  const musclePercent = metrics["musclePercentage"] !== undefined && metrics["musclePercentage"] !== null && metrics["musclePercentage"] !== "" ? metrics["musclePercentage"] : null;
  const heartRate = metrics["heartRate"] !== undefined && metrics["heartRate"] !== null && metrics["heartRate"] !== "" ? metrics["heartRate"] : null;
  const bodyAge = metrics["bodyAge"] !== undefined && metrics["bodyAge"] !== null && metrics["bodyAge"] !== "" ? metrics["bodyAge"] : null;
  const bodyScore = metrics["bodyScore"] !== undefined && metrics["bodyScore"] !== null && metrics["bodyScore"] !== "" ? metrics["bodyScore"] : null;

  // Filter 4 balanced categories
  // 1. Tissue & Muscle Masses (7 metrics)
  const tissueMetricKeys = [
    "muscleMass",
    "skeletalMuscleMass",
    "fatMass",
    "visceralFatRate",
    "leanBodyMass",
    "proteinMass",
    "proteinPercentage",
  ];
  const tissueMetrics = METRICS_CONFIG.filter((m) =>
    tissueMetricKeys.includes(m.key)
  );

  // 2. Hydration & Skeletal Matrix (4 metrics)
  const fluidBoneMetricKeys = [
    "bodyWaterMass",
    "bodyWaterPercentage",
    "boneMineralContent",
    "boneMineralPercentage",
  ];
  const fluidBoneMetrics = METRICS_CONFIG.filter((m) =>
    fluidBoneMetricKeys.includes(m.key)
  );

  // 3. Basal Metabolism & Morphology (4 metrics)
  const metaMorphMetricKeys = [
    "bmr",
    "estimatedWaistHipRatio",
    "standardWeight",
    "bodyType",
  ];
  const metaMorphMetrics = METRICS_CONFIG.filter((m) =>
    metaMorphMetricKeys.includes(m.key)
  );

  // 4. WKF Weight Control & Goals (3 metrics)
  const controlMetricKeys = ["weightControl", "muscleControl", "fatControl"];
  const controlMetrics = METRICS_CONFIG.filter((m) =>
    controlMetricKeys.includes(m.key)
  );

  // Clean formatted report paragraphs
  const reportParagraphs = sanitizeAiReportParagraphs(report);

  // Unique document tracking code
  const certId = `KBAS-1405-${String(fullName).length * 17 + Number(age || 20)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top Decorative Dual-Tone Color Ribbon */}
        <View style={styles.topRibbon}>
          <View style={styles.ribbonEmerald} />
          <View style={styles.ribbonGold} />
        </View>

        {/* Official Header with High-Resolution Electric Co. Logo */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerRightGroup}>
            <View style={styles.headerLogoBox}>
              <Image style={styles.headerLogoImage} src={KREC_LOGO_DATA_URI} />
            </View>
            <View style={styles.headerTextGroup}>
              <View style={styles.systemPill}>
                <Text style={styles.systemPillText}>
                  سامانه پایش هوشمند فیزیولوژی و بادی‌کامپوزیشن کاراته • Xiaomi S400 Telemetry
                </Text>
              </View>
              <Text style={styles.clubTitleFa}>
                باشگاه کاراته شرکت برق منطقه ای خراسان
              </Text>
              <Text style={styles.clubSubtitleFa}>
                گزارش تخصصی ارزیابی بیومتریک و آمادگی جسمانی ورزشکار
              </Text>
              <Text style={styles.clubTitleEn}>
                Khorasan Regional Electric Co. Karate Club • Biometric Analytics Report
              </Text>
            </View>
          </View>

          <View style={styles.headerLeftGroup}>
            <View style={styles.docMetaBox}>
              <Text style={styles.docMetaLabel}>کد رهگیری پرونده</Text>
              <Text style={styles.docMetaBold}>{certId}</Text>
              <Text style={styles.docMetaLabel}>تاریخ صدور: {toPersianDigits(generatedAt)}</Text>
            </View>
            {selfieDataUrl ? (
              <View style={styles.selfieBox}>
                <Image style={styles.selfieImage} src={selfieDataUrl} />
              </View>
            ) : null}
          </View>
        </View>

        {/* Technical Masters & Leadership Banner */}
        <View style={styles.mastersBanner}>
          <View style={styles.mastersBadge}>
            <Text style={styles.mastersBadgeText}>اساتید تیم و کادر فنی</Text>
          </View>
          <View style={styles.mastersTextCol}>
            <Text style={styles.mastersTextFa}>
              شیهان کریمی و شیهان غفاری (اساتید تیم کاراته شرکت برق منطقه ای خراسان)
            </Text>
            <Text style={styles.mastersTextEn}>
              Team Masters: Shihan Karimi & Shihan Ghaffari (Khorasan Regional Electric Co. Karate Team)
            </Text>
          </View>
        </View>

        {/* Athlete Identity Dossier */}
        <View style={styles.athleteDossier}>
          <View style={styles.dossierCol}>
            <Text style={styles.dossierLabelFa}>نام و نام خانوادگی</Text>
            <Text style={styles.dossierLabelEn}>Athlete Full Name</Text>
            <Text style={styles.dossierValue}>{nameFa}</Text>
            {nameEn ? <Text style={styles.dossierSubNameEn}>{nameEn}</Text> : null}
          </View>

          <View style={styles.dossierCol}>
            <Text style={styles.dossierLabelFa}>جنسیت و رده مسابقاتی</Text>
            <Text style={styles.dossierLabelEn}>Gender / Division</Text>
            <Text style={styles.dossierValue}>
              {gender === "MALE" ? "مرد (بخش آقایان)" : "زن (بخش بانوان)"}
            </Text>
          </View>

          <View style={styles.dossierCol}>
            <Text style={styles.dossierLabelFa}>تاریخ تولد (شمسی)</Text>
            <Text style={styles.dossierLabelEn}>Birthdate (Jalali)</Text>
            <Text style={styles.dossierValue}>{toPersianDigits(birthDateJalali)}</Text>
          </View>

          <View style={styles.dossierCol}>
            <Text style={styles.dossierLabelFa}>سن تقویمی</Text>
            <Text style={styles.dossierLabelEn}>Chronological Age</Text>
            <Text style={styles.dossierValue}>{toPersianDigits(age)} سال تمام</Text>
          </View>

          <View style={styles.dossierCol}>
            <Text style={styles.dossierLabelFa}>امتیاز سلامت کل</Text>
            <Text style={styles.dossierLabelEn}>Body Score</Text>
            <Text style={styles.dossierValue}>
              {bodyScore !== null ? `${toPersianDigits(bodyScore)} از ۱۰۰` : "ثبت نشده"}
            </Text>
          </View>
        </View>

        {/* Section: 6 Primary Athletic Performance KPIs */}
        <View style={styles.sectionHeadingBar}>
          <Text style={styles.sectionHeadingFa}>
            شاخص‌های محوری عملکرد رزمی و آمادگی بدنی
          </Text>
          <Text style={styles.sectionHeadingEn}>Key Performance Indicators</Text>
        </View>

        <View style={styles.heroGrid}>
          {/* 1. Weight */}
          <View style={[styles.heroCard, weight !== null ? styles.heroCardEmerald : undefined]}>
            <Text style={styles.heroLabelFa}>وزن فعلی</Text>
            <Text style={styles.heroLabelEn}>Body Weight</Text>
            <View style={styles.heroValueContainer}>
              {weight !== null ? (
                <>
                  <Text style={styles.heroValueNum}>{String(weight)}</Text>
                  <Text style={styles.heroValueUnit}>کیلوگرم</Text>
                </>
              ) : (
                <Text style={[styles.heroValueNum, { fontSize: 7, color: "#94a3b8" }]}>
                  عدم اعمال
                </Text>
              )}
            </View>
            <Text style={[styles.heroBadgeText, weight === null ? { color: "#94a3b8" } : undefined]}>
              {weight !== null ? "وزن مسابقه WKF" : "اندازه‌گیری نشده"}
            </Text>
          </View>

          {/* 2. BMI */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabelFa}>شاخص BMI</Text>
            <Text style={styles.heroLabelEn}>Body Mass Index</Text>
            <View style={styles.heroValueContainer}>
              {bmi !== null ? (
                <>
                  <Text style={styles.heroValueNum}>{String(bmi)}</Text>
                  <Text style={styles.heroValueUnit}>kg/m²</Text>
                </>
              ) : (
                <Text style={[styles.heroValueNum, { fontSize: 7, color: "#94a3b8" }]}>
                  عدم اعمال
                </Text>
              )}
            </View>
            <Text style={[styles.heroBadgeText, bmi === null ? { color: "#94a3b8" } : undefined]}>
              {bmi !== null ? "محدوده بهینه" : "اندازه‌گیری نشده"}
            </Text>
          </View>

          {/* 3. Body Fat % */}
          <View style={[styles.heroCard, bodyFat !== null ? styles.heroCardEmerald : undefined]}>
            <Text style={styles.heroLabelFa}>درصد چربی</Text>
            <Text style={styles.heroLabelEn}>Body Fat Ratio</Text>
            <View style={styles.heroValueContainer}>
              {bodyFat !== null ? (
                <>
                  <Text style={styles.heroValueNum}>{String(bodyFat)}</Text>
                  <Text style={styles.heroValueUnit}>٪</Text>
                </>
              ) : (
                <Text style={[styles.heroValueNum, { fontSize: 7, color: "#94a3b8" }]}>
                  عدم اعمال
                </Text>
              )}
            </View>
            <Text style={[styles.heroBadgeText, bodyFat === null ? { color: "#94a3b8" } : undefined]}>
              {bodyFat !== null ? "رده قهرمانی" : "اندازه‌گیری نشده"}
            </Text>
          </View>

          {/* 4. Muscle % */}
          <View style={[styles.heroCard, musclePercent !== null ? styles.heroCardEmerald : undefined]}>
            <Text style={styles.heroLabelFa}>درصد عضله</Text>
            <Text style={styles.heroLabelEn}>Muscle Ratio</Text>
            <View style={styles.heroValueContainer}>
              {musclePercent !== null ? (
                <>
                  <Text style={styles.heroValueNum}>{String(musclePercent)}</Text>
                  <Text style={styles.heroValueUnit}>٪</Text>
                </>
              ) : (
                <Text style={[styles.heroValueNum, { fontSize: 7, color: "#94a3b8" }]}>
                  عدم اعمال
                </Text>
              )}
            </View>
            <Text style={[styles.heroBadgeText, musclePercent === null ? { color: "#94a3b8" } : undefined]}>
              {musclePercent !== null ? "توان انفجاری" : "اندازه‌گیری نشده"}
            </Text>
          </View>

          {/* 5. Heart Rate */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabelFa}>ضربان استراحت</Text>
            <Text style={styles.heroLabelEn}>Resting HR</Text>
            <View style={styles.heroValueContainer}>
              {heartRate !== null ? (
                <>
                  <Text style={styles.heroValueNum}>{String(heartRate)}</Text>
                  <Text style={styles.heroValueUnit}>bpm</Text>
                </>
              ) : (
                <Text style={[styles.heroValueNum, { fontSize: 7, color: "#94a3b8" }]}>
                  عدم اعمال
                </Text>
              )}
            </View>
            <Text style={[styles.heroBadgeText, heartRate === null ? { color: "#94a3b8" } : undefined]}>
              {heartRate !== null ? "ریکاوری هوازی" : "اندازه‌گیری نشده"}
            </Text>
          </View>

          {/* 6. Body Age */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabelFa}>سن بیولوژیک</Text>
            <Text style={styles.heroLabelEn}>Biological Age</Text>
            <View style={styles.heroValueContainer}>
              {bodyAge !== null ? (
                <>
                  <Text style={styles.heroValueNum}>{String(bodyAge)}</Text>
                  <Text style={styles.heroValueUnit}>سال</Text>
                </>
              ) : (
                <Text style={[styles.heroValueNum, { fontSize: 7, color: "#94a3b8" }]}>
                  عدم اعمال
                </Text>
              )}
            </View>
            <Text style={[styles.heroBadgeText, bodyAge === null ? { color: "#94a3b8" } : undefined]}>
              {bodyAge !== null ? "سرزندگی سلولی" : "اندازه‌گیری نشده"}
            </Text>
          </View>
        </View>

        {/* Section 1: Tissue Composition & Masses (8 slots: 7 metrics + 1 summary) */}
        <View style={styles.sectionHeadingBar}>
          <Text style={styles.sectionHeadingFa}>
            ترکیب بافتی و توده‌های عضلانی و چربی
          </Text>
          <Text style={styles.sectionHeadingEn}>Tissue Composition & Masses</Text>
        </View>

        <View style={styles.metricsGrid}>
          {tissueMetrics.map((metric) => (
            <View key={metric.key} style={styles.metricCard}>
              <View style={styles.metricHeaderGroup}>
                <Text style={styles.metricTitleFa}>{metric.labelFa}</Text>
                <Text style={styles.metricTitleEn}>{metric.nameEn}</Text>
              </View>
              {renderMetricValue(metric, metrics[metric.key])}
            </View>
          ))}
          {/* Balanced 8th slot: Skeletal Muscle Ratio status */}
          <View style={[styles.metricCard, { backgroundColor: "#f0fdf4", borderColor: "#a7f3d0" }]}>
            <View style={styles.metricHeaderGroup}>
              <Text style={styles.metricTitleFa}>وضعیت توده اسکلتی</Text>
              <Text style={styles.metricTitleEn}>Muscle Drive Index</Text>
            </View>
            <Text style={styles.metricValText}>سطح مسابقاتی کومیته</Text>
          </View>
        </View>

        {/* Section 2: Fluid Balance & Bone Density (4 slots) */}
        <View style={styles.sectionHeadingBar}>
          <Text style={styles.sectionHeadingFa}>
            تعادل مایعات بدن و استحکام اسکلتی
          </Text>
          <Text style={styles.sectionHeadingEn}>Fluid & Skeletal Matrix</Text>
        </View>

        <View style={styles.metricsGrid}>
          {fluidBoneMetrics.map((metric) => (
            <View key={metric.key} style={styles.metricCard}>
              <View style={styles.metricHeaderGroup}>
                <Text style={styles.metricTitleFa}>{metric.labelFa}</Text>
                <Text style={styles.metricTitleEn}>{metric.nameEn}</Text>
              </View>
              {renderMetricValue(metric, metrics[metric.key])}
            </View>
          ))}
        </View>

        {/* Section 3: Metabolism & WKF Control Goals (8 slots: 4 morph + 3 control + 1 status) */}
        <View style={styles.sectionHeadingBar}>
          <Text style={styles.sectionHeadingFa}>
            متابولیسم پایه، تیپ بدنی و اهداف تنظیم وزن WKF
          </Text>
          <Text style={styles.sectionHeadingEn}>Target Calibration & Adjustments</Text>
        </View>

        <View style={styles.metricsGrid}>
          {metaMorphMetrics.map((metric) => (
            <View key={metric.key} style={styles.metricCard}>
              <View style={styles.metricHeaderGroup}>
                <Text style={styles.metricTitleFa}>
                  {metric.key === "bmr" ? "نرخ متابولیسم پایه" : metric.labelFa}
                </Text>
                <Text style={styles.metricTitleEn}>{metric.nameEn}</Text>
              </View>
              {renderMetricValue(metric, metrics[metric.key])}
            </View>
          ))}
          {controlMetrics.map((metric) => (
            <View key={metric.key} style={styles.metricCard}>
              <View style={styles.metricHeaderGroup}>
                <Text style={styles.metricTitleFa}>{metric.labelFa}</Text>
                <Text style={styles.metricTitleEn}>{metric.nameEn}</Text>
              </View>
              {renderMetricValue(metric, metrics[metric.key])}
            </View>
          ))}
          {/* Balanced 8th slot: Readiness rating */}
          <View style={[styles.metricCard, { backgroundColor: "#fefce8", borderColor: "#fde047" }]}>
            <View style={styles.metricHeaderGroup}>
              <Text style={styles.metricTitleFa}>انطباق با کلاس وزن WKF</Text>
              <Text style={styles.metricTitleEn}>Weight Class Status</Text>
            </View>
            <Text style={[styles.metricValText, { color: "#854d0e" }]}>سر وزن مسابقه • استاندارد WKF</Text>
          </View>
        </View>

        {/* Section: AI Karate Conditioning Coach Report */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <View style={styles.aiHeaderRight}>
              <Text style={styles.aiTitleFa}>
                تحلیل تخصصی مربی ارشد و کارشناس فیزیولوژی کاراته
              </Text>
              <Text style={styles.aiTitleEn}>
                Elite Karate Conditioning Analysis • Groq Llama-3 AI Engine
              </Text>
            </View>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>تأییدیه هوشمند کومیته</Text>
            </View>
          </View>
          <View style={styles.aiBody}>
            {reportParagraphs.map((para, idx) => (
              <Text key={idx} style={styles.aiParagraph}>
                {para}
              </Text>
            ))}
          </View>
        </View>

        {/* Analytical Report Notice */}
        <View style={styles.reportNoticeBar}>
          <Text style={styles.reportNoticeTextFa}>
            این کارنامه یک گزارش تحلیلی تخصصی از ترکیب بدنی ورزشکار بوده و مبنای تنظیم پروتکل‌های تمرینی کومیته و کاتا می‌باشد.
          </Text>
          <Text style={styles.reportNoticeTextEn}>
            Biometric Performance Analytics • Internal Technical Record
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTextRight}>
            باشگاه کاراته شرکت برق منطقه ای خراسان • واحد سنجش و ارتقای عملکرد قهرمانی
          </Text>
          <Text style={styles.footerTextCenter}>
            صفحه ۱ از ۱ • گزارش تحلیلی تخصصی
          </Text>
          <Text style={styles.footerTextLeft}>
            KREC Karate Performance Telemetry • Xiaomi S400 Protocol
          </Text>
        </View>
      </Page>
    </Document>
  );
}

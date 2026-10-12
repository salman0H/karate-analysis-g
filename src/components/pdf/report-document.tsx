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
  MetricCategory,
  CATEGORY_LABELS_FA,
} from "@/config/metrics.config";

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
    padding: 28,
    fontSize: 9,
    direction: "rtl",
  },
  headerWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#059669",
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerTextGroup: {
    flex: 1,
    textAlign: "right",
  },
  clubBadge: {
    fontSize: 7,
    color: "#059669",
    fontWeight: "bold",
    marginBottom: 2,
  },
  clubTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subHeader: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  selfieBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#059669",
    overflow: "hidden",
    marginLeft: 12,
  },
  selfieImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  athleteProfileBar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  profileItem: {
    textAlign: "right",
  },
  profileLabel: {
    fontSize: 7,
    color: "#64748b",
  },
  profileValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  categoryBlock: {
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRightWidth: 3,
    borderRightColor: "#059669",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 5,
  },
  categoryTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "right",
  },
  metricsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 4,
  },
  metricCard: {
    width: "24%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 4,
    marginBottom: 2,
  },
  metricLabelFa: {
    fontSize: 7,
    color: "#64748b",
    textAlign: "right",
  },
  metricValueText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
    marginTop: 1,
  },
  aiSection: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    backgroundColor: "#fafafa",
    padding: 8,
  },
  aiHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
    marginBottom: 6,
  },
  aiTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  aiBadge: {
    fontSize: 7,
    color: "#0284c7",
    fontWeight: "bold",
    marginRight: 6,
  },
  aiContent: {
    fontSize: 7.5,
    lineHeight: 1.5,
    color: "#334155",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 6.5,
    color: "#94a3b8",
    textAlign: "right",
  },
  footerBrand: {
    fontSize: 6.5,
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

const CATEGORY_ORDER: MetricCategory[] = [
  "general",
  "composition",
  "water",
  "bone",
  "metabolic",
  "control",
];

function getDisplayValue(
  def: (typeof METRICS_CONFIG)[number],
  val: number | string | undefined
): string {
  if (val === undefined || val === null || val === "") return "-";
  if (def.isText && def.textOptions) {
    const opt = def.textOptions.find((o) => o.value === val);
    return opt ? opt.labelFa : String(val);
  }
  return `${val} ${def.unit}`.trim();
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.clubBadge}>
              سامانه هوشمند پایش بدنی و فیزیولوژی ورزشی
            </Text>
            <Text style={styles.clubTitle}>
              باشگاه کاراته شرکت برق منطقه ای خراسان
            </Text>
            <Text style={styles.subHeader}>
              گزارش رسمی سنجش بیومتریک و ترکیب بدنی آنالایزر هوشمند Xiaomi S400
            </Text>
          </View>
          {selfieDataUrl ? (
            <View style={styles.selfieBox}>
              {/* react-pdf Image tag */}
              <Image style={styles.selfieImage} src={selfieDataUrl} />
            </View>
          ) : null}
        </View>

        {/* Athlete Profile Bar */}
        <View style={styles.athleteProfileBar}>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>نام و نام خانوادگی:</Text>
            <Text style={styles.profileValue}>{fullName}</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>جنسیت:</Text>
            <Text style={styles.profileValue}>
              {gender === "MALE" ? "مرد (آقایان)" : "زن (بانوان)"}
            </Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>تاریخ تولد (شمسی):</Text>
            <Text style={styles.profileValue}>{birthDateJalali}</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>سن محاسبه‌شده:</Text>
            <Text style={styles.profileValue}>{age} سال</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>تاریخ صدور:</Text>
            <Text style={styles.profileValue}>{generatedAt}</Text>
          </View>
        </View>

        {/* Dynamic 25 Metrics Registry Grid */}
        {CATEGORY_ORDER.map((category) => {
          const catConfig = CATEGORY_LABELS_FA[category];
          const catMetrics = METRICS_CONFIG.filter((m) => m.category === category);
          if (catMetrics.length === 0) return null;

          return (
            <View key={category} style={styles.categoryBlock}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{catConfig.titleFa}</Text>
              </View>
              <View style={styles.metricsGrid}>
                {catMetrics.map((metric) => (
                  <View key={metric.key} style={styles.metricCard}>
                    <Text style={styles.metricLabelFa}>{metric.labelFa}</Text>
                    <Text style={styles.metricValueText}>
                      {getDisplayValue(metric, metrics[metric.key])}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* AI Karate Conditioning Analysis Report */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>
              تحلیل تخصصی مربی ارشد بدنسازی کاراته (AI Karate Conditioning)
            </Text>
            <Text style={styles.aiBadge}>مدل تحلیلی Llama-3 / Groq</Text>
          </View>
          <Text style={styles.aiContent}>{report}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            صادر شده توسط واحد سنجش و سلامت بدنی باشگاه کاراته شرکت برق منطقه ای خراسان
          </Text>
          <Text style={styles.footerBrand}>
            Smart Karate Body Analytics Engine
          </Text>
        </View>
      </Page>
    </Document>
  );
}

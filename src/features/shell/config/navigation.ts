import {
  LayoutDashboard,
  Users,
  Activity,
  LineChart,
  BookOpen,
  Award,
  Contact,
  type LucideIcon,
} from "lucide-react";
import type { DashboardView } from "@/core/store/use-app-store";

export interface NavItem {
  id: string;
  labelFa: string;
  labelEn: string;
  view: DashboardView;
  icon: LucideIcon;
}

export const ENTERPRISE_NAV_ITEMS: NavItem[] = [
  {
    id: "nav-analytics",
    labelFa: "داشبورد کلیدی",
    labelEn: "Dashboard",
    view: "analytics",
    icon: LayoutDashboard,
  },
  {
    id: "nav-team",
    labelFa: "آنالیز تیم",
    labelEn: "Team Analysis",
    view: "team",
    icon: Users,
  },
  {
    id: "nav-techniques",
    labelFa: "اطلس تکنیک‌ها و واژه‌نامه",
    labelEn: "Techniques & Biomechanics",
    view: "techniques",
    icon: BookOpen,
  },
  {
    id: "nav-standards",
    labelFa: "استانداردها (۸ تا ۷۰ سال)",
    labelEn: "Conditioning Norms",
    view: "standards",
    icon: Award,
  },
  {
    id: "nav-assessment",
    labelFa: "سنجش بیومتریک S400",
    labelEn: "Assessment S400",
    view: "assessment",
    icon: Activity,
  },
  {
    id: "nav-roster",
    labelFa: "لیست ورزشکاران",
    labelEn: "Roster",
    view: "roster",
    icon: Contact,
  },
  {
    id: "nav-comparative",
    labelFa: "تحلیل مقایسه‌ای",
    labelEn: "Progress Trends",
    view: "comparative",
    icon: LineChart,
  },
];

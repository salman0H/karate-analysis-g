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
    id: "nav-team",
    labelFa: "بررسی کل تیم و رده‌های سنی",
    labelEn: "Team & Age Brackets",
    view: "team",
    icon: Users,
  },
  {
    id: "nav-assessment",
    labelFa: "سنجش بیومتریک و ثبت عضو",
    labelEn: "Assessment S400",
    view: "assessment",
    icon: Activity,
  },
  {
    id: "nav-roster",
    labelFa: "لیست ورزشکاران و پرونده‌ها",
    labelEn: "Athletes & Records",
    view: "roster",
    icon: Contact,
  },
  {
    id: "nav-techniques",
    labelFa: "اطلس تکنیک‌ها و واژه‌نامه",
    labelEn: "Techniques Atlas",
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
];

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Users,
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  Bell,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
const iconMap = {
  Overview: LayoutDashboard,
  Internships: BriefcaseBusiness,
  Applications: FileText,
  Students: GraduationCap,
  Companies: Building2,
  Analytics: ChartNoAxesCombined,
  Reports: FileText,
  Allocations: Users,
  "Weekly Reports": ClipboardCheck,
  Evaluations: ClipboardCheck,
  Notifications: Bell,
  Meetings: CalendarDays,
  Certificates: GraduationCap,
};
export const navByRole = {
  student: [
    ["Overview", "/student/dashboard"],
    ["Internships", "/internships"],
    ["Applications", "/student/applications"],
    ["Weekly Reports", "/student/reports"],
    ["Certificates", "/student/certificates"],
    ["Notifications", "/student/notifications"],
  ],
  admin: [
    ["Overview", "/admin/dashboard"],
    ["Students", "/admin/students"],
    ["Internships", "/admin/internships"],
    ["Applications", "/admin/applications"],
    // ["Evaluations", "/admin/evaluations"],
    ["Allocations", "/admin/allocations"],
    ["Reports", "/admin/reports"],
  ],
  mentor: [
    ["Overview", "/mentor/dashboard"],
    ["Applications", "/mentor/applications"],
    ["Students", "/mentor/students"],
    ["Weekly Reports", "/mentor/reports"],
    ["Evaluations", "/mentor/evaluations"],
  ],
};
export function Sidebar({ role, onNavigate }) {
  return (
    <nav aria-label="Workspace navigation" className="space-y-1">
      {(navByRole[role] || []).map(([label, url]) => {
        const Icon = iconMap[label] || LayoutDashboard;
        return (
          <NavLink
            key={url}
            onClick={onNavigate}
            to={url}
            className={({ isActive }) =>
              `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}

import { OverviewCharts } from "../../components/dashboard/OverviewCharts";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Users,
  ChartNoAxesCombined,
  CheckCircle2,
  CalendarDays,
  FileText,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { api, apiError } from "../../services/api";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { QueryState } from "../../components/common/QueryState";
import { PageHeader } from "../../components/common/PageHeader";
import { roleHome } from "../../lib/utils";
const labels = {
  student: {
    applications: "Applications",
    selected: "Selected",
    activeInternships: "Active internships",
    weeklyReports: "Weekly reports",
  },
  admin: {
    students: "Students",
    activeInternships: "Open internships",
    applications: "Applications",
    selected: "Selected",
  },
  mentor: {
    assignedStudents: "Assigned students",
    pendingReports: "Pending reviews",
  },
};
const subtitles = {
  student: "Your applications, active internship, and growth in one place.",
  admin: "A clear picture of institutional internship performance.",
  mentor: "Keep every student supported and every report reviewed.",
};
const actions = {
  student: [
    ["Browse internships", "/internships"],
    ["My applications", "/student/applications"],
    ["Weekly reports", "/student/reports"],
  ],
  admin: [
    ["Manage internships", "/admin/internships"],
    ["Review applications", "/admin/applications"],
    ["Allocate mentors", "/admin/allocations"],
    ["View reports", "/admin/reports"],
  ],
  mentor: [
    ["Review reports", "/mentor/reports"],
    ["My students", "/mentor/students"],
    ["Evaluations", "/mentor/evaluations"],
  ],
};
export function DashboardPage() {
  const { user } = useAuth(),
    role = user.role;
  const q = useQuery({
    queryKey: ["analytics", role],
    queryFn: async () =>
      (await api.get(`/analytics/${role}/overview`)).data.data,
    refetchInterval: 60000,
  });
  const app = useQuery({
    queryKey: ["applications", "preview", role],
    queryFn: async () =>
      (await api.get("/applications", { params: { limit: 5 } })).data.data,
  });
  const notices = useQuery({
    queryKey: ["notifications", "preview"],
    queryFn: async () => (await api.get("/notifications")).data.data,
    refetchInterval: 60000,
  });
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="OVERVIEW"
        title={`Welcome back, ${user.name?.split(" ")[0] || "there"} 👋`}
        description={subtitles[role]}
        action={
          <button
            onClick={() => {
              q.refetch();
              app.refetch();
              notices.refetch();
            }}
            className="focus-ring rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Refresh dashboard
          </button>
        }
      />
      {q.error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive p-4 text-destructive"
        >
          {apiError(q.error)}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {q.isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="surface h-32 animate-pulse bg-secondary"
              />
            ))
          : Object.entries(labels[role]).map(([key, label], i) => (
              <StatCard
                key={key}
                label={label}
                value={q.data?.[key]}
                icon={
                  [BriefcaseBusiness, Users, ChartNoAxesCombined, CheckCircle2][
                    i % 4
                  ]
                }
              />
            ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <DashboardCard
          title="Recent applications"
          action={
            <Link
              to={`/${role}/applications`}
              className="text-xs font-semibold text-primary"
            >
              View all <ArrowUpRight size={14} className="inline" />
            </Link>
          }
        >
          <QueryState
            loading={app.isLoading}
            error={app.error}
            empty={!app.data?.length}
            emptyTitle="No recent applications"
          >
            {(app.data || []).map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0"
              >
                <div>
                  <p className="font-semibold">
                    {a.internshipId?.title || "Internship"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.studentId?.name || "Application"} ·{" "}
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </QueryState>
        </DashboardCard>
        <DashboardCard title="Quick actions">
          <div className="space-y-2">
            {actions[role].map(([label, url]) => (
              <Link
                key={url}
                to={url}
                className="focus-ring flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm font-semibold hover:text-primary"
              >
                {label}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </DashboardCard>
      </div>
      {role !== "admin" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <DashboardCard
            title="Latest notifications"
            action={
              <Link
                to={`/${role}/notifications`}
                className="text-xs font-semibold text-primary"
              >
                View inbox
              </Link>
            }
          >
            <QueryState
              loading={notices.isLoading}
              error={notices.error}
              empty={!notices.data?.length}
              emptyTitle="No notifications"
            >
              {(notices.data || []).slice(0, 4).map((n) => (
                <div
                  key={n._id}
                  className="border-b border-border py-3 last:border-0"
                >
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.message}
                  </p>
                </div>
              ))}
            </QueryState>
          </DashboardCard>
          <DashboardCard title="Insights and trends">
            <p className="mb-5 text-sm text-muted-foreground">
              Understand monthly application volume and current selection
              outcomes using real records.
            </p>
            <Link
              to={`/${role}/reports`}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Explore reports <ChartNoAxesCombined size={17} />
            </Link>
          </DashboardCard>
        </div>
      )}
      <OverviewCharts role={role} />
    </div>
  );
}

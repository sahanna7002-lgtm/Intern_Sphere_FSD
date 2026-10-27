import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
// import { Download } from "lucide-react";
import {
  Download,
  GraduationCap,
  Users,
  BriefcaseBusiness,
  FileText,
  Activity,
  CheckCircle2,
  UserRoundCheck,
  Clock3,
} from "lucide-react";

import { api, apiError } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { PageHeader } from "../../components/common/PageHeader";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import { StatCard } from "../../components/dashboard/StatCard";
import { Button } from "../../components/ui/Button";

// Approved InternSphere palette
const COLORS = ["#5003C0", "#AB03A9", "#FF467A", "#FFD51E"];

const LIGHT_PURPLE = "#A78BFA";
const EXTRA_COLORS = [...COLORS, LIGHT_PURPLE, "#DB83E0", "#FF9BB7", "#E9B84B"];

const STATUS_COLORS = {
  selected: "#5003C0",
  applied: "#AB03A9",
  under_review: "#FF467A",
  shortlisted: "#FFD51E",
  rejected: "#A78BFA",
  withdrawn: "#94A3B8",
};

const readable = (value) =>
  String(value ?? "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const numeric = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const safeRows = (data, key = "count") =>
  (Array.isArray(data) ? data : []).filter((row) => numeric(row?.[key]) > 0);

const totalOf = (rows, key = "count") =>
  rows.reduce((total, row) => total + numeric(row[key]), 0);

const percentage = (value, total) =>
  total > 0 ? ((numeric(value) / total) * 100).toFixed(1) : "0.0";

// Existing Mentor Reports chart component.
// Its data fields and chart types are preserved.
function ChartCard({
  title,
  data,
  kind = "bar",
  x = "name",
  y = "count",
  empty = "No records available yet",
}) {
  return (
    <DashboardCard title={title}>
      {!data?.length ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <div className="h-64 w-full" role="img" aria-label={title}>
          <ResponsiveContainer width="100%" height="100%">
            {kind === "pie" ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey={y}
                  nameKey={x}
                  innerRadius={54}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={EXTRA_COLORS[i % EXTRA_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : kind === "radar" ? (
              <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey={x} />
                <PolarRadiusAxis domain={[0, 10]} />
                <Radar
                  dataKey={y}
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.25}
                />
                <Tooltip />
              </RadarChart>
            ) : kind === "line" ? (
              <LineChart
                data={data}
                margin={{
                  top: 8,
                  right: 16,
                  bottom: 8,
                  left: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={x} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={y}
                  stroke={COLORS[0]}
                  strokeWidth={3}
                  dot
                />
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{
                  top: 8,
                  right: 16,
                  bottom: 8,
                  left: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={x} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey={y} fill={COLORS[0]} radius={[5, 5, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}

// Compact Admin report card
function SummaryCard({ title, description, children }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-display text-base font-bold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

// Reusable horizontal segmented progress bar
function SegmentedBar({ segments, total, label }) {
  if (total <= 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No records available yet.
      </p>
    );
  }

  return (
    <div
      className="flex h-4 w-full overflow-hidden rounded-full bg-secondary"
      role="img"
      aria-label={label}
    >
      {segments
        .filter((segment) => numeric(segment.value) > 0)
        .map((segment, index) => (
          <div
            key={`${segment.name}-${index}`}
            title={`${readable(segment.name)}: ${segment.value} (${percentage(
              segment.value,
              total,
            )}%)`}
            style={{
              width: `${(numeric(segment.value) / total) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
    </div>
  );
}

// Chart 1: Internship category distribution
// function InternshipCategories({ data }) {
//   const rows = safeRows(data).sort(
//     (a, b) => numeric(b.count) - numeric(a.count)
//   );
//   const total = totalOf(rows);

//   const segments = rows.map((row, index) => ({
//     name: row.name,
//     value: numeric(row.count),
//     color: EXTRA_COLORS[index % EXTRA_COLORS.length],
//   }));

//   return (
//     <SummaryCard
//       title="Internship categories"
//       description="Distribution of available internship opportunities"
//     >
//       <div className="mb-4 flex items-center justify-between gap-3">
//         <div>
//           <p className="text-2xl font-extrabold">{total}</p>
//           <p className="text-xs text-muted-foreground">
//             Total opportunities
//           </p>
//         </div>
//         <div
//           className="rounded-xl px-3 py-2 text-xs font-semibold"
//           style={{
//             backgroundColor: "#5003C012",
//             color: COLORS[0],
//           }}
//         >
//           {rows.length} categories
//         </div>
//       </div>

//       <SegmentedBar
//         segments={segments}
//         total={total}
//         label="Distribution of internship opportunities by category"
//       />

//       {rows.length > 0 && (
//         <div className="mt-5 space-y-2">
//           {rows.slice(0, 5).map((row, index) => (
//             <div
//               key={`${row.name}-${index}`}
//               className="flex items-center justify-between gap-3 text-xs"
//             >
//               <div className="flex min-w-0 items-center gap-2">
//                 <span
//                   className="h-3 w-3 shrink-0 rounded-full"
//                   style={{
//                     backgroundColor:
//                       EXTRA_COLORS[index % EXTRA_COLORS.length],
//                   }}
//                 />
//                 <span className="truncate text-muted-foreground">
//                   {readable(row.name)}
//                 </span>
//               </div>

//               <span className="shrink-0 font-bold tabular-nums">
//                 {numeric(row.count)} (
//                 {percentage(row.count, total)}%)
//               </span>
//             </div>
//           ))}

//           {rows.length > 5 && (
//             <p className="border-t border-border pt-3 text-xs text-muted-foreground">
//               {rows.length - 5} additional categories are
//               represented in the distribution above.
//             </p>
//           )}
//         </div>
//       )}
//     </SummaryCard>
//   );
// }

function InternshipCategories({ data }) {
  // Use real category data from the existing MongoDB reporting API
  const rows = safeRows(data).sort(
    (a, b) =>
      numeric(b.count) - numeric(a.count) ||
      String(a.name).localeCompare(String(b.name)),
  );

  const total = totalOf(rows);

  return (
    <SummaryCard
      title="Internship categories"
      description="Internship opportunities available across different fields"
    >
      {/* Summary statistics */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-3xl font-extrabold">{total}</p>
          <p className="text-xs text-muted-foreground">Total opportunities</p>
        </div>

        <div
          className="rounded-xl px-3 py-2 text-xs font-semibold"
          style={{
            backgroundColor: "#5003C012",
            color: COLORS[0],
          }}
        >
          {rows.length} Categories
        </div>
      </div>

      {/* Category coverage grid */}
      {rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No internship opportunities available yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rows.map((row, index) => {
            const color = COLORS[index % COLORS.length];
            const count = numeric(row.count);

            return (
              <div
                key={`${row.name}-${index}`}
                className="flex min-h-28 flex-col justify-between rounded-xl border border-border bg-secondary/40 p-3 transition-colors hover:bg-secondary"
              >
                {/* Category name */}
                <div className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />

                  <p className="break-words text-xs font-semibold leading-relaxed text-foreground">
                    {readable(row.name)}
                  </p>
                </div>

                {/* Opportunity count */}
                <div className="mt-3">
                  <p
                    className="text-2xl font-extrabold tabular-nums"
                    style={{ color }}
                  >
                    {count}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {count === 1 ? "Opportunity" : "Opportunities"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {rows.length > 0 && (
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          Showing all {rows.length} internship categories from the database.
        </p>
      )}
    </SummaryCard>
  );
}

// Chart 2: Mentor workload
function MentorWorkload({ data }) {
  const rows = safeRows(data).sort(
    (a, b) => numeric(b.count) - numeric(a.count),
  );

  const total = totalOf(rows);
  const maximum = Math.max(1, ...rows.map((row) => numeric(row.count)));

  return (
    <SummaryCard
      title="Mentor workload"
      description="Number of assigned students per faculty mentor"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-extrabold">{total}</p>
          <p className="text-xs text-muted-foreground">
            Active mentor assignments
          </p>
        </div>
        <span
          className="rounded-xl px-3 py-2 text-xs font-semibold"
          style={{
            color: COLORS[1],
            backgroundColor: "#AB03A912",
          }}
        >
          {rows.length} mentors
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          No mentor allocations available yet.
        </p>
      ) : (
        <div className="max-h-[800px] space-y-10 overflow-y-auto pr-2">
          {rows.map((row, index) => {
            const color = EXTRA_COLORS[index % EXTRA_COLORS.length];

            return (
              <div key={`${row.name}-${index}`}>
                <div className="mb-1 flex justify-between gap-3 text-xs">
                  <span className="truncate font-medium">{row.name}</span>
                  <span className="font-bold tabular-nums">
                    {numeric(row.count)}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(numeric(row.count) / maximum) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SummaryCard>
  );
}

// Chart 3: Application decisions
function ApplicationDecisions({ data }) {
  const rows = safeRows(data);
  const total = totalOf(rows);

  const segments = rows.map((row, index) => ({
    name: row.name,
    value: numeric(row.count),
    color:
      STATUS_COLORS[String(row.name).toLowerCase()] ||
      EXTRA_COLORS[index % EXTRA_COLORS.length],
  }));

  const order = [
    "selected",
    "applied",
    "under_review",
    "shortlisted",
    "rejected",
    "withdrawn",
  ];

  segments.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

  return (
    <SummaryCard
      title="Application decisions"
      description="Current selection status of student applications"
    >
      <div className="mb-4">
        <span className="text-2xl font-extrabold">{total}</span>
        <span className="ml-2 text-xs text-muted-foreground">Applications</span>
      </div>

      <SegmentedBar
        segments={segments}
        total={total}
        label="Application status distribution"
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {segments.map((segment) => (
          <div
            key={segment.name}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: segment.color,
                }}
              />
              <span className="truncate text-muted-foreground">
                {readable(segment.name)}
              </span>
            </div>

            <span className="shrink-0 font-bold">
              {segment.value} ({percentage(segment.value, total)}%)
            </span>
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No application decisions available.
        </p>
      )}
    </SummaryCard>
  );
}

// Chart 4: Mentor allocation
function MentorAllocation({ data }) {
  const rows = safeRows(data);
  const total = totalOf(rows);

  const assigned = rows
    .filter((row) => String(row.name).toLowerCase() === "assigned")
    .reduce((sum, row) => sum + numeric(row.count), 0);

  const unassigned = rows
    .filter((row) => String(row.name).toLowerCase() === "unassigned")
    .reduce((sum, row) => sum + numeric(row.count), 0);

  return (
    <SummaryCard
      title="Mentor allocation"
      description="Students assigned and awaiting a mentor"
    >
      <div className="mb-4 flex items-end gap-3">
        <p className="text-3xl font-extrabold">
          {percentage(assigned, total)}%
        </p>
        <p className="pb-1 text-xs text-muted-foreground">Students assigned</p>
      </div>

      <SegmentedBar
        segments={[
          {
            name: "Assigned",
            value: assigned,
            color: COLORS[0],
          },
          {
            name: "Unassigned",
            value: unassigned,
            color: COLORS[3],
          },
        ]}
        total={total}
        label="Student mentor allocation status"
      />

      <div className="mt-5 flex flex-wrap justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS[0] }}
          />
          <span className="text-muted-foreground">Assigned</span>
          <strong>{assigned}</strong>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS[3] }}
          />
          <span className="text-muted-foreground">Unassigned</span>
          <strong>{unassigned}</strong>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {total > 0
          ? `${assigned} of ${total} students have an assigned mentor.`
          : "No allocation records available."}
      </p>
    </SummaryCard>
  );
}

// Chart 5: Applications Trend
function ApplicationsTrend({ data }) {
  const rows = safeRows(data);
  const total = totalOf(rows);
  const hasTrend = rows.length >= 2;

  return (
    <SummaryCard
      title="Internship applications trend"
      description="Monthly applications recorded in the internship database"
    >
      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No monthly application data available.
        </p>
      ) : !hasTrend ? (
        <div className="py-8 text-center">
          <p className="text-5xl font-extrabold" style={{ color: COLORS[0] }}>
            {total}
          </p>

          <p className="mt-2 text-sm font-semibold">
            Applications in {rows[0].name}
          </p>

          <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
            Only one month of application records is available. A trend graph
            will appear automatically when applications have been recorded
            across at least two months.
          </p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rows}
              margin={{
                top: 16,
                right: 24,
                bottom: 8,
                left: 0,
              }}
            >
              <CartesianGrid
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="name" tick={{ fontSize: 11 }} />

              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

              <Tooltip formatter={(value) => [value, "Applications"]} />

              <Line
                type="monotone"
                dataKey="count"
                name="Applications"
                stroke={COLORS[0]}
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: COLORS[0],
                }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </SummaryCard>
  );
}

// Existing CSV export logic
function exportCSV(rows, name) {
  if (!rows?.length) return;

  const cols = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;

  const csv = [
    cols.join(","),
    ...rows.map((row) =>
      cols
        .map((c) =>
          escape(typeof row[c] === "object" ? JSON.stringify(row[c]) : row[c]),
        )
        .join(","),
    ),
  ].join("\r\n");

  const url = URL.createObjectURL(
    new Blob([csv], {
      type: "text/csv;charset=utf-8",
    }),
  );

  const a = document.createElement("a");
  a.href = url;
  a.download = `internsphere-${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ADMIN_KPI_CONFIG = [
  {
    key: "students",
    label: "Total students",
    description: "Registered students",
    icon: GraduationCap,
    color: "#5003C0",
    background: "#F3ECFF",
  },
  {
    key: "mentors",
    label: "Total mentors",
    description: "Faculty mentors",
    icon: Users,
    color: "#AB03A9",
    background: "#FCEBFA",
  },
  {
    key: "opportunities",
    label: "Internship opportunities",
    description: "Available programs",
    icon: BriefcaseBusiness,
    color: "#FF467A",
    background: "#FFF0F4",
  },
  {
    key: "applications",
    label: "Total applications",
    description: "Submitted applications",
    icon: FileText,
    color: "#B18C00",
    background: "#FFF9D8",
  },
  {
    key: "activeInternships",
    label: "Active internships",
    description: "Currently in progress",
    icon: Activity,
    color: "#5003C0",
    background: "#F3ECFF",
  },
  {
    key: "completedInternships",
    label: "Completed internships",
    description: "Successfully completed",
    icon: CheckCircle2,
    color: "#AB03A9",
    background: "#FCEBFA",
  },
  {
    key: "assignedStudents",
    label: "Students with mentors",
    description: "Allocated to faculty mentors",
    icon: UserRoundCheck,
    color: "#5003C0",
    background: "#F3ECFF",
  },
  {
    key: "pendingEvaluations",
    label: "Pending evaluations",
    description: "Awaiting evaluation",
    icon: Clock3,
    color: "#FF467A",
    background: "#FFF0F4",
  },
];

function AdminKpiCard({ config, kpis }) {
  const { key, label, description, icon: Icon, color, background } = config;

  const rawValue = kpis?.[key];
  const hasValue = rawValue !== undefined && rawValue !== null;

  const value = hasValue ? rawValue : "—";
  const count = Number(rawValue);

  const students = Number(kpis?.students);
  const active = Number(kpis?.activeInternships);
  const completed = Number(kpis?.completedInternships);

  let progress = null;
  let progressText = null;

  // Meaningful ratios only — no invented growth data.
  if (
    key === "assignedStudents" &&
    Number.isFinite(students) &&
    students > 0 &&
    Number.isFinite(count)
  ) {
    progress = (count / students) * 100;
    progressText = `${progress.toFixed(1)}% of students assigned`;
  }

  if (
    (key === "activeInternships" || key === "completedInternships") &&
    Number.isFinite(active) &&
    Number.isFinite(completed) &&
    active + completed > 0 &&
    Number.isFinite(count)
  ) {
    progress = (count / (active + completed)) * 100;
    progressText = `${progress.toFixed(1)}% of active and completed internships`;
  }

  const safeProgress =
    progress === null ? null : Math.min(100, Math.max(0, progress));

  return (
    <div
      className="group flex min-h-44 flex-col justify-between
                 rounded-2xl border border-border bg-card p-5
                 shadow-sm transition-all duration-200
                 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center
                     justify-center rounded-xl"
          style={{ backgroundColor: background }}
        >
          <Icon size={21} style={{ color }} />
        </div>

        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Metric */}
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <p className="font-display text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
            {value}
          </p>

          {key === "assignedStudents" &&
            Number.isFinite(students) &&
            students > 0 && (
              <span className="text-sm text-muted-foreground">
                / {students}
              </span>
            )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          {safeProgress !== null ? (
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${safeProgress}%`,
                backgroundColor: color,
              }}
            />
          ) : (
            <div
              className="h-full w-12 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}
        </div>

        {progressText && (
          <p className="mt-2 text-xs text-muted-foreground">{progressText}</p>
        )}
      </div>
    </div>
  );
}

const adminLabels = {
  students: "Total students",
  mentors: "Total mentors",
  opportunities: "Internship opportunities",
  applications: "Total applications",
  activeInternships: "Active internships",
  completedInternships: "Completed internships",
  assignedStudents: "Students with mentors",
  pendingEvaluations: "Pending evaluations",
};

const mentorLabels = {
  assignedStudents: "Assigned students",
  activeInternships: "Active internships",
  reportsSubmitted: "Reports submitted",
  pendingReviews: "Pending reviews",
  approvedReports: "Approved reports",
  averageStudentProgress: "Average progress (not recorded)",
  completionRate: "Completion rate (%)",
};

export function ReportsPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState("");
  const role = user.role;

  const q = useQuery({
    queryKey: ["reporting", role],
    queryFn: async () => (await api.get(`/reporting/${role}`)).data.data,
  });

  const d = q.data;

  const filtered =
    role === "mentor" && student
      ? d?.reports?.filter((r) => String(r.studentId) === student)
      : d?.reports;

  const mentorWeeks = filtered
    ? Object.values(
        filtered.reduce((acc, r) => {
          const k = r.weekNumber;
          acc[k] ??= {
            week: k,
            submitted: 0,
            approved: 0,
          };

          acc[k].submitted++;

          if (r.status === "approved") {
            acc[k].approved++;
          }

          return acc;
        }, {}),
      ).sort((a, b) => a.week - b.week)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "mentor" ? "Mentor Reports" : "Institution Reports"}
        description="Live reporting from your internship database."
      />

      {q.isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="surface h-28 animate-pulse bg-secondary" />
          ))}
        </div>
      ) : q.error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive p-4 text-destructive"
        >
          {apiError(q.error)}
        </p>
      ) : (
        <>
          {/* Existing KPI cards */}

          {/* Role-specific KPI cards */}
          {role === "admin" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ADMIN_KPI_CONFIG.map((config) => (
                <AdminKpiCard key={config.key} config={config} kpis={d?.kpis} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(mentorLabels).map(([key, label]) => (
                <StatCard
                  key={key}
                  label={label}
                  value={d?.kpis?.[key] ?? "—"}
                />
              ))}
            </div>
          )}

          {role === "mentor" ? (
            <>
              {/* Mentor reporting functionality retained */}
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="report-student"
                  className="text-sm font-semibold"
                >
                  Student
                </label>

                <select
                  id="report-student"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className="rounded-xl border border-border bg-card p-2 text-sm"
                >
                  <option value="">All assigned students</option>

                  {(d?.students || []).map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  onClick={() => exportCSV(filtered, "mentor-reports")}
                >
                  <Download size={16} />
                  Export reports
                </Button>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <ChartCard
                  title="Weekly report submissions"
                  data={mentorWeeks}
                  x="week"
                  y="submitted"
                />

                <ChartCard
                  title="Weekly approvals"
                  data={mentorWeeks}
                  kind="line"
                  x="week"
                  y="approved"
                />

                <ChartCard
                  title="Report status distribution"
                  data={
                    student
                      ? Object.entries(
                          (filtered || []).reduce(
                            (a, r) => (
                              (a[r.status] = (a[r.status] || 0) + 1),
                              a
                            ),
                            {},
                          ),
                        ).map(([name, count]) => ({
                          name,
                          count,
                        }))
                      : d?.statuses
                  }
                  kind="pie"
                />

                <ChartCard
                  title="Student evaluation comparison"
                  data={d?.studentPerformance}
                  y="score"
                />

                <ChartCard
                  title="Evaluation skills overview"
                  data={d?.studentPerformance?.length ? d?.skills : []}
                  kind="radar"
                  y="score"
                />

                <ChartCard
                  title="Internship completion status"
                  data={d?.completion}
                  kind="pie"
                />
              </div>

              <DashboardCard title="Student reports">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3">Student</th>
                        <th className="p-3">Week</th>
                        <th className="p-3">Hours</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Tasks</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(filtered || []).map((r) => (
                        <tr key={r._id} className="border-b border-border">
                          <td className="p-3">{r.studentName}</td>
                          <td className="p-3">{r.weekNumber}</td>
                          <td className="p-3">{r.hoursWorked}</td>
                          <td className="p-3">{r.status}</td>
                          <td className="p-3">{r.tasksCompleted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!filtered?.length && (
                    <p className="p-5 text-muted-foreground">
                      No reports available for this selection.
                    </p>
                  )}
                </div>
              </DashboardCard>
            </>
          ) : (
            <>
              {/* Existing Admin exports */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => exportCSV(d?.workloads, "mentor-workload")}
                >
                  <Download size={16} />
                  Export workload
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    exportCSV(d?.applicationStatuses, "application-statuses")
                  }
                >
                  <Download size={16} />
                  Export statuses
                </Button>
              </div>

              {/* New Admin Reports layout */}
              <div className="space-y-2">
                <h2 className="font-display text-xl font-bold">
                  Institutional performance
                </h2>

                <p className="text-sm text-muted-foreground">
                  An overview of internship opportunities, application
                  decisions, mentor allocations, and institutional progress.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <InternshipCategories data={d?.categories} />

                <MentorWorkload data={d?.workloads} />

                <ApplicationDecisions data={d?.applicationStatuses} />

                <MentorAllocation data={d?.allocationOverview} />

                <div className="lg:col-span-2">
                  <ApplicationsTrend data={d?.applicationTrend} />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

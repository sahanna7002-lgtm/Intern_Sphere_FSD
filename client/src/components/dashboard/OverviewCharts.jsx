import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import {
  BriefcaseBusiness,
  UsersRound,
  ClipboardList,
  UserRoundCheck,
} from "lucide-react";
import { api } from "../../services/api";
import { DashboardCard } from "./DashboardCard";

// Approved InternSphere chart palette. No database values are hardcoded.
const PALETTE = {
  purple: "#5003C0",
  magenta: "#AB03A9",
  pink: "#FF467A",
  yellow: "#FFD51E",
  lilac: "#B6A0F7",
  palePink: "#F7A4D7",
};

const CATEGORY_COLORS = [
  PALETTE.purple,
  PALETTE.magenta,
  PALETTE.pink,
  PALETTE.yellow,
  PALETTE.lilac,
  PALETTE.palePink,
];

const STATUS_COLORS = {
  selected: PALETTE.purple,
  applied: PALETTE.magenta,
  under_review: PALETTE.pink,
  shortlisted: PALETTE.yellow,
  rejected: PALETTE.lilac,
  withdrawn: "#A6A3AF",
  submitted: PALETTE.magenta,
  approved: PALETTE.purple,
  revision_requested: PALETTE.pink,
  revision_required: PALETTE.pink,
  assigned: PALETTE.purple,
  unassigned: PALETTE.yellow,
};

const humanize = (value) =>
  String(value ?? "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const asRows = (data, key = "count") =>
  (Array.isArray(data) ? data : [])
    .map((item) => ({ ...item, [key]: Number(item?.[key]) || 0 }))
    .filter((item) => item[key] > 0);

const sumRows = (rows, key = "count") =>
  rows.reduce((total, row) => total + row[key], 0);

function EmptyChart() {
  return (
    <p className="py-12 text-center text-sm text-muted-foreground">
      No records available for this chart yet.
    </p>
  );
}

function ChartHeading({ subtitle, count, countLabel, icon: Icon, accent }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}16`, color: accent }}
        >
          <Icon size={21} aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div
        className="rounded-xl px-3 py-2 text-xs font-semibold tabular-nums"
        style={{ backgroundColor: `${accent}10`, color: accent }}
      >
        {countLabel}: {count}
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E9E5F2",
  boxShadow: "0 10px 30px rgba(35, 24, 67, 0.09)",
  fontSize: 12,
};

function CategoryChart({ data }) {
  const raw = asRows(data).sort((a, b) => b.count - a.count);
  // Show the largest seven categories, combining the rest without losing totals.
  const visible = raw.slice(0, 7);
  const otherCount = sumRows(raw.slice(7));
  const chartRows = otherCount
    ? [...visible, { name: "Other categories", count: otherCount }]
    : visible;
  const total = sumRows(raw);

  return (
    <DashboardCard title="Internship opportunities by category">
      <ChartHeading
        subtitle="Number of available opportunities in each field"
        count={total}
        countLabel="Total"
        icon={BriefcaseBusiness}
        accent={PALETTE.purple}
      />
      {!total ? (
        <EmptyChart />
      ) : (
        <div style={{ height: Math.max(290, chartRows.length * 42 + 35) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartRows}
              layout="vertical"
              margin={{ top: 5, right: 28, bottom: 5, left: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid stroke="#EAE7F2" strokeDasharray="3 4" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={135}
                tick={{ fontSize: 11, fill: "#55617A" }}
                interval={0}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [value, "Opportunities"]}
              />
              <Bar dataKey="count" name="Opportunities" radius={[0, 7, 7, 0]} maxBarSize={20}>
                {chartRows.map((row, index) => (
                  <Cell key={`${row.name}-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
                <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 600, fill: "#24243D" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}

function WorkloadChart({ data }) {
  const rows = asRows(data).sort((a, b) => b.count - a.count);
  const total = sumRows(rows);
  return (
    <DashboardCard title="Mentor workload — assigned students">
      <ChartHeading
        subtitle="Number of students assigned to each faculty mentor"
        count={total}
        countLabel="Assigned"
        icon={UsersRound}
        accent={PALETTE.magenta}
      />
      {!total ? (
        <EmptyChart />
      ) : (
        <div style={{ height: Math.max(290, rows.length * 32 + 35) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 5, right: 28, bottom: 5, left: 0 }}
              barCategoryGap="32%"
            >
              <CartesianGrid stroke="#EAE7F2" strokeDasharray="3 4" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={135}
                interval={0}
                tick={{ fontSize: 11, fill: "#55617A" }}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Assigned students"]} />
              <Bar dataKey="count" name="Assigned students" radius={[0, 7, 7, 0]} maxBarSize={18}>
                {rows.map((row, index) => (
                  <Cell
                    key={`${row.name}-${index}`}
                    fill={index === 0 ? PALETTE.purple : index < 4 ? PALETTE.magenta : index < 8 ? PALETTE.pink : PALETTE.lilac}
                  />
                ))}
                <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 600, fill: "#24243D" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}

function DonutChart({ title, subtitle, data, countLabel, icon, allocation = false }) {
  const rows = asRows(data);
  const total = sumRows(rows);
  const getColor = (row, index) =>
    STATUS_COLORS[String(row.name ?? "").toLowerCase()] || CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  const assigned = rows.find((row) => String(row.name).toLowerCase() === "assigned")?.count || 0;
  const unassigned = rows.find((row) => String(row.name).toLowerCase() === "unassigned")?.count || 0;

  return (
    <DashboardCard title={title}>
      <ChartHeading
        subtitle={subtitle}
        count={total}
        countLabel="Total"
        icon={icon}
        accent={allocation ? PALETTE.pink : PALETTE.yellow}
      />
      {!total ? (
        <EmptyChart />
      ) : (
        <div className="flex flex-col items-center gap-6 xl:flex-row xl:items-center">
          <div className="relative h-64 w-full min-w-0 xl:w-1/2" role="img" aria-label={title}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="name"
                  innerRadius="61%"
                  outerRadius="88%"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  paddingAngle={rows.length > 1 ? 1 : 0}
                >
                  {rows.map((row, index) => (
                    <Cell key={`${row.name}-${index}`} fill={getColor(row, index)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    `${value} (${((Number(value) / total) * 100).toFixed(1)}%)`,
                    humanize(name),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tabular-nums text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground">{countLabel}</span>
            </div>
          </div>
          <div className="w-full min-w-0 flex-1 space-y-1">
            {rows.map((row, index) => (
              <div key={`${row.name}-${index}`} className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-b-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: getColor(row, index) }} />
                  <span className="min-w-0 text-muted-foreground">{humanize(row.name)}</span>
                </div>
                <span className="shrink-0 font-semibold tabular-nums">
                  {row.count} ({((row.count / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
            {allocation && (
              <div className="mt-4 rounded-xl px-3 py-3 text-xs leading-relaxed" style={{ backgroundColor: `${PALETTE.purple}0C`, color: "#554774" }}>
                {assigned} of {assigned + unassigned} students have a mentor assigned; {unassigned} still need an allocation.
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

// Preserve the existing mentor overview charts and API response keys.
function MentorGraph({ title, data, kind = "bar", x = "name", y = "count" }) {
  const rows = Array.isArray(data) ? data : [];
  const hasData = rows.some((row) => Number(row?.[y]) > 0);
  return (
    <DashboardCard title={title}>
      {!hasData ? (
        <EmptyChart />
      ) : (
        <div className="h-60 w-full" role="img" aria-label={title}>
          <ResponsiveContainer width="100%" height="100%">
            {kind === "pie" ? (
              <PieChart>
                <Pie data={rows} dataKey={y} nameKey={x} innerRadius={52} outerRadius={80}>
                  {rows.map((row, index) => (
                    <Cell key={`${row?.[x]}-${index}`} fill={STATUS_COLORS[String(row?.[x]).toLowerCase()] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : kind === "line" ? (
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={x} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey={y} stroke={PALETTE.purple} strokeWidth={3} />
              </LineChart>
            ) : (
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={x} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey={y} fill={PALETTE.purple} radius={[5, 5, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}

export function OverviewCharts({ role }) {
  const query = useQuery({
    queryKey: ["reporting", role],
    queryFn: async () => (await api.get(`/reporting/${role}`)).data.data,
    enabled: role === "mentor" || role === "admin",
  });

  if (role !== "mentor" && role !== "admin") return null;

  if (query.isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface h-72 animate-pulse" />
        <div className="surface h-72 animate-pulse" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Dashboard charts could not be loaded. See Reports for details.
      </p>
    );
  }

  const d = query.data;
  return (
    <section className="space-y-3" aria-label="Internship reporting charts">
      <h2 className="text-lg font-bold">
        {role === "admin" ? "Institutional performance" : "Live insights"}
      </h2>
      <p className="text-sm text-muted-foreground">
        Calculated from saved internship records. Expand the Reports page for more charts and exports.
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        {role === "admin" ? (
          <>
            <CategoryChart data={d?.categories} />
            <WorkloadChart data={d?.workloads} />
            <DonutChart
              title="Application status distribution"
              subtitle="Current status of all internship applications"
              data={d?.applicationStatuses}
              countLabel="Applications"
              icon={ClipboardList}
            />
            <DonutChart
              title="Mentor allocation overview"
              subtitle="Assigned and unassigned students"
              data={d?.allocationOverview}
              countLabel="Students"
              icon={UserRoundCheck}
              allocation
            />
          </>
        ) : (
          <>
            <MentorGraph title="Weekly submissions" data={d?.weekly} x="week" y="submitted" kind="line" />
            <MentorGraph title="Report review statuses" data={d?.statuses} kind="pie" />
            <MentorGraph title="Student evaluation scores" data={d?.studentPerformance} y="score" />
            <MentorGraph title="Completed weekly reviews" data={d?.weekly} x="week" y="approved" />
          </>
        )}
      </div>
    </section>
  );
}

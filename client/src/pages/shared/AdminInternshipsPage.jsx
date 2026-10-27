import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiError } from "../../services/api";
import { PageHeader } from "../../components/common/PageHeader";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import { Button } from "../../components/ui/Button";
export function AdminInternshipsPage() {
  const qc = useQueryClient(),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState({
      title: "",
      companyId: "",
      description: "",
      category: "Other",
      skills: "",
      location: "",
      mode: "hybrid",
      stipend: 0,
      durationWeeks: 12,
      positions: 1,
      deadline: "",
      status: "open",
    });
  const companies = useQuery({
    queryKey: ["company-metadata"],
    queryFn: async () => (await api.get("/companies")).data.data,
  });
  const q = useQuery({
    queryKey: ["admin-internships"],
    queryFn: async () => (await api.get("/internships/manage/mine")).data.data,
  });
  const change = (key, value) => setForm((x) => ({ ...x, [key]: value }));
  async function create(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/internships", {
        ...form,
        skills: form.skills
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        stipend: Number(form.stipend),
        positions: Number(form.positions),
        durationWeeks: Number(form.durationWeeks),
        deadline: new Date(form.deadline).toISOString(),
      });
      toast.success("Internship created");
      qc.invalidateQueries({ queryKey: ["admin-internships"] });
      qc.invalidateQueries({ queryKey: ["internships"] });
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage internships"
        description="Institution-administered internship opportunities; company names are metadata, not login accounts."
      />
      <DashboardCard title="Create internship">
        <form onSubmit={create} className="grid gap-3 md:grid-cols-2">
          {[
            ["title", "Title"],
            ["category", "Category"],
            ["location", "Location"],
            ["skills", "Skills (comma-separated)"],
            ["stipend", "Monthly stipend (₹)"],
            ["durationWeeks", "Duration (weeks)"],
            ["positions", "Available positions"],
            ["deadline", "Application deadline"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-semibold">
              {label}
              <input
                required
                type={
                  ["stipend", "durationWeeks", "positions"].includes(key)
                    ? "number"
                    : key === "deadline"
                      ? "date"
                      : "text"
                }
                value={form[key]}
                onChange={(e) => change(key, e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card p-3 font-normal"
              />
            </label>
          ))}
          <label className="text-sm font-semibold">
            Company
            <select
              required
              value={form.companyId}
              onChange={(e) => change("companyId", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-card p-3"
            >
              <option value="">Select company metadata</option>
              {(companies.data || []).map((x) => (
                <option key={x._id} value={x._id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Work mode
            <select
              value={form.mode}
              onChange={(e) => change("mode", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-card p-3"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Description
            <textarea
              required
              minLength={20}
              value={form.description}
              onChange={(e) => change("description", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-card p-3"
              rows={3}
            />
          </label>
          <Button disabled={busy}>
            {busy ? "Creating…" : "Create opportunity"}
          </Button>
        </form>
      </DashboardCard>
      <DashboardCard title="Existing opportunities">
        {q.isLoading ? (
          <p>Loading…</p>
        ) : q.error ? (
          <p className="text-destructive">{apiError(q.error)}</p>
        ) : (
          (q.data || []).map((x) => (
            <div
              key={x._id}
              className="flex flex-wrap justify-between gap-2 border-b border-border py-3 text-sm"
            >
              <div>
                <strong>{x.title}</strong>
                <p className="text-muted-foreground">
                  {x.companyId?.name || "Company"} · {x.location}
                </p>
              </div>
              <span className="capitalize">{x.status}</span>
            </div>
          ))
        )}
        {!q.data?.length && (
          <p className="text-sm text-muted-foreground">
            No opportunities found.
          </p>
        )}
      </DashboardCard>
    </div>
  );
}

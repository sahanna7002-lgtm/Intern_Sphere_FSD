import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiError } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { DashboardCard } from "../../components/dashboard/DashboardCard";
import { EmptyState } from "../../components/common/EmptyState";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Button } from "../../components/ui/Button";

const reviewStatuses = {
  applied: ["under_review", "rejected"],
  under_review: ["shortlisted", "rejected"],
  shortlisted: ["selected", "rejected"],
};
const pending = (status) =>
  ["applied", "under_review", "shortlisted"].includes(status);
export function ApplicationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["applications", user?.role, page],
    queryFn: async () =>
      (await api.get("/applications", { params: { page, limit: 30 } })).data,
  });
  const data = response?.data || [];
  const meta = response?.meta;
  const { data: mentorsResponse } = useQuery({
    queryKey: ["eligible-review-mentors"],
    queryFn: async () => (await api.get("/users/mentors")).data.data,
    enabled: user.role === "admin",
  });
  const mentors = mentorsResponse || [];
  const afterSuccess = () => {
    qc.invalidateQueries({ queryKey: ["applications"] });
    qc.invalidateQueries({ queryKey: ["analytics"] });
    qc.invalidateQueries({ queryKey: ["mentor-reports"] });
  };
  const statusChange = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/applications/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Application status updated");
      afterSuccess();
    },
    onError: (e) => toast.error(apiError(e)),
  });
  const reviewerChange = useMutation({
    mutationFn: ({ id, mentorId }) =>
      api.patch(`/applications/${id}/reviewer`, { mentorId }),
    onSuccess: () => {
      toast.success("Application sent to mentor for review");
      afterSuccess();
    },
    onError: (e) => toast.error(apiError(e)),
  });
  const title =
    user.role === "mentor"
      ? "Applications awaiting your confirmation"
      : user.role === "admin"
        ? "Assign application reviewers"
        : "My applications";
  const description =
    user.role === "mentor"
      ? "Review only the applications assigned to you by the college administrator."
      : user.role === "admin"
        ? "Choose a faculty mentor to confirm each pending application. Admin still manages internship mentor allocation after selection."
        : "Track application decisions and current progress.";
  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {apiError(error)}
        </p>
      )}
      <DashboardCard title="Application history">
        {isLoading ? (
          <p>Loading applications…</p>
        ) : data.length ? (
          <div className="space-y-3">
            {data.map((a) => (
              <div
                key={a._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"
              >
                <div className="min-w-0">
                  <h2 className="font-semibold">
                    {a.internshipId?.title || "Internship"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {a.studentId?.name || "My application"}
                  </p>
                  {user.role !== "student" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Reviewer: {a.reviewerMentorId?.name || "Not assigned"}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={a.status} />
                  {user.role === "mentor" && pending(a.status) && (
  <select
    className="rounded-lg border border-border bg-card p-2 text-sm"
    aria-label="Review application"
    value=""
    disabled={statusChange.isPending}
    onChange={(e) => {
      if (e.target.value) {
        statusChange.mutate({
          id: a._id,
          status: e.target.value,
        });
      }
    }}
  >
    <option value="" disabled>
      Review decision
    </option>
    {(reviewStatuses[a.status] || []).map((status) => (
      <option key={status} value={status}>
        {status.replaceAll("_", " ")}
      </option>
    ))}
  </select>
)}
                  {user.role === "student" && pending(a.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={statusChange.isPending}
                      onClick={() => {
                        if (window.confirm("Withdraw this application?"))
                          statusChange.mutate({
                            id: a._id,
                            status: "withdrawn",
                          });
                      }}
                    >
                      Withdraw
                    </Button>
                  )}
                  {user.role === "admin" && pending(a.status) && (
                    <select
                      className="max-w-56 rounded-lg border border-border bg-card p-2 text-sm"
                      aria-label={`Assign reviewer for ${a.studentId?.name || "student"}`}
                      value={a.reviewerMentorId?._id || ""}
                      disabled={reviewerChange.isPending}
                      onChange={(e) => {
                        if (e.target.value)
                          reviewerChange.mutate({
                            id: a._id,
                            mentorId: e.target.value,
                          });
                      }}
                    >
                      <option value="" disabled>
                        Choose mentor reviewer
                      </option>
                      {mentors.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {user.role === "mentor" && pending(a.status) && (
                    <select
                      className="rounded-lg border border-border bg-card p-2 text-sm"
                      aria-label={`Review ${a.studentId?.name || "student"} application`}
                      value=""
                      disabled={statusChange.isPending}
                      onChange={(e) => {
                        if (e.target.value)
                          statusChange.mutate({
                            id: a._id,
                            status: e.target.value,
                          });
                      }}
                    >
                      <option value="" disabled>
                        Review decision
                      </option>
                      {(reviewStatuses[a.status] || []).map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              user.role === "mentor"
                ? "No applications assigned"
                : "No applications yet"
            }
            description={
              user.role === "mentor"
                ? "Your institution administrator can assign pending applications to you for confirmation."
                : "Applications will appear after students submit them."
            }
          />
        )}
        {meta && meta.total > meta.limit && (
          <div className="mt-5 flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(meta.total / meta.limit)}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page * meta.limit >= meta.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

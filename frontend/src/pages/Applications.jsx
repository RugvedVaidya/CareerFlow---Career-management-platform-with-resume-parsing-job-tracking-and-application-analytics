import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  ExternalLink,
  FileText,
  Filter,
  Plus,
  Search,
  Trash2,
  Building2,
  Target,
  Globe2,
  RefreshCcw,
} from "lucide-react";

import api from "../api/axios";
import AppLayout from "../components/AppLayout";

const Applications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const statusOptions = [
    "SAVED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
  ];

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/applications");

      const appData =
        res.data.applications ||
        res.data.data ||
        res.data.jobs ||
        res.data ||
        [];

      setApplications(Array.isArray(appData) ? appData : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (statusFilter !== "ALL") {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();

      result = result.filter((app) => {
        const company = app.companyName?.toLowerCase() || "";
        const role = app.jobRole?.toLowerCase() || "";
        const source = app.source?.toLowerCase() || "";
        const appliedFrom = app.appliedFrom?.toLowerCase() || "";
        const resume = app.resume?.fileName?.toLowerCase() || "";
        const location = app.location?.toLowerCase() || "";

        return (
          company.includes(q) ||
          role.includes(q) ||
          source.includes(q) ||
          appliedFrom.includes(q) ||
          resume.includes(q) ||
          location.includes(q)
        );
      });
    }

    return result;
  }, [applications, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: applications.length,
      SAVED: 0,
      APPLIED: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };

    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status] += 1;
      }
    });

    return counts;
  }, [applications]);

  const updateStatus = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);

      await api.put(`/applications/${applicationId}`, {
        status: newStatus,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteApplication = async (applicationId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(applicationId);

      await api.delete(`/applications/${applicationId}`);

      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "NA";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "SAVED":
        return "bg-slate-100 text-slate-700 ring-slate-200";
      case "APPLIED":
        return "bg-blue-50 text-blue-700 ring-blue-100";
      case "INTERVIEW":
        return "bg-purple-50 text-purple-700 ring-purple-100";
      case "OFFER":
        return "bg-green-50 text-green-700 ring-green-100";
      case "REJECTED":
        return "bg-red-50 text-red-700 ring-red-100";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-200";
    }
  };

  const getScoreClass = (score) => {
    if (score === null || score === undefined) {
      return "bg-slate-100 text-slate-600 ring-slate-200";
    }

    if (score >= 75) {
      return "bg-green-50 text-green-700 ring-green-100";
    }

    if (score >= 50) {
      return "bg-yellow-50 text-yellow-700 ring-yellow-100";
    }

    return "bg-red-50 text-red-700 ring-red-100";
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-600">
                Loading applications...
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Hero */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Briefcase size={14} />
                Application tracker
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Manage your job applications
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track companies, roles, statuses, sources, resumes used, match
                scores, job descriptions, interviews, and reminders.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchApplications}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw size={17} />
                Refresh
              </button>

              <Link
                to="/applications/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Plus size={18} />
                New Application
              </Link>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatusSummaryCard
            label="All"
            value={statusCounts.ALL}
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          />

          {statusOptions.map((status) => (
            <StatusSummaryCard
              key={status}
              label={status}
              value={statusCounts[status] || 0}
              active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
              statusClass={getStatusClass(status)}
            />
          ))}
        </section>

        {/* Filters */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search by company, role, source, resume, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="ALL">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Applications List */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Applications
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredApplications.length} of {applications.length}{" "}
                applications
              </p>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <EmptyApplications
              hasApplications={applications.length > 0}
              onClear={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 xl:block">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <Th>Company</Th>
                      <Th>Role</Th>
                      <Th>Source</Th>
                      <Th>Resume</Th>
                      <Th>Applied</Th>
                      <Th>Status</Th>
                      <Th>Match</Th>
                      <Th align="right">Actions</Th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <Td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                              <Building2 size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {app.companyName || "NA"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {app.location || "Location not added"}
                              </p>
                            </div>
                          </div>
                        </Td>

                        <Td>
                          <p className="font-medium text-slate-800">
                            {app.jobRole || "NA"}
                          </p>
                        </Td>

                        <Td>
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            <Globe2 size={13} />
                            {app.source || app.appliedFrom || "NA"}
                          </div>
                        </Td>

                        <Td>
                          <div className="inline-flex max-w-[180px] items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                            <FileText size={13} />
                            <span className="truncate">
                              {app.resume?.fileName || "Not selected"}
                            </span>
                          </div>
                        </Td>

                        <Td>
                          <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <Calendar size={15} />
                            {formatDate(app.appliedDate)}
                          </div>
                        </Td>

                        <Td>
                          <select
                            value={app.status || "APPLIED"}
                            disabled={updatingId === app.id}
                            onChange={(e) =>
                              updateStatus(app.id, e.target.value)
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 outline-none ${getStatusClass(
                              app.status
                            )}`}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </Td>

                        <Td>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${getScoreClass(
                              app.matchScore
                            )}`}
                          >
                            <Target size={13} />
                            {app.matchScore !== null &&
                            app.matchScore !== undefined
                              ? `${app.matchScore}%`
                              : "NA"}
                          </span>
                        </Td>

                        <Td align="right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/applications/${app.id}`)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <ExternalLink size={15} />
                              Open
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === app.id}
                              onClick={() => deleteApplication(app.id)}
                              className="inline-flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid grid-cols-1 gap-4 xl:hidden">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Building2 size={19} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-950">
                              {app.companyName || "NA"}
                            </h3>
                            <p className="truncate text-sm text-slate-500">
                              {app.jobRole || "NA"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getScoreClass(
                          app.matchScore
                        )}`}
                      >
                        {app.matchScore !== null &&
                        app.matchScore !== undefined
                          ? `${app.matchScore}%`
                          : "NA"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoPill
                        icon={Globe2}
                        label="Source"
                        value={app.source || app.appliedFrom || "NA"}
                      />

                      <InfoPill
                        icon={FileText}
                        label="Resume"
                        value={app.resume?.fileName || "Not selected"}
                      />

                      <InfoPill
                        icon={Calendar}
                        label="Applied"
                        value={formatDate(app.appliedDate)}
                      />

                      <div>
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          Status
                        </p>

                        <select
                          value={app.status || "APPLIED"}
                          disabled={updatingId === app.id}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className={`w-full rounded-2xl px-3 py-2 text-xs font-semibold ring-1 outline-none ${getStatusClass(
                            app.status
                          )}`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <ExternalLink size={17} />
                        Open Details
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === app.id}
                        onClick={() => deleteApplication(app.id)}
                        className="inline-flex items-center justify-center rounded-2xl border border-red-100 px-4 py-3 text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

const StatusSummaryCard = ({
  label,
  value,
  active,
  onClick,
  statusClass = "bg-blue-50 text-blue-700 ring-blue-100",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left shadow-sm transition ${
        active
          ? "border-blue-300 bg-blue-50 ring-4 ring-blue-500/10"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
      }`}
    >
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass}`}
      >
        {label}
      </span>

      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">applications</p>
    </button>
  );
};

const Th = ({ children, align = "left" }) => {
  return (
    <th
      className={`px-5 py-4 text-${align} text-xs font-bold uppercase tracking-wide text-slate-500`}
    >
      {children}
    </th>
  );
};

const Td = ({ children, align = "left" }) => {
  return (
    <td className={`px-5 py-4 text-${align} align-middle text-sm`}>
      {children}
    </td>
  );
};

const InfoPill = ({ icon: Icon, label, value }) => {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>

      <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <Icon size={15} className="shrink-0 text-slate-400" />
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
};

const EmptyApplications = ({ hasApplications, onClear }) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
        <Briefcase size={26} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {hasApplications ? "No matching applications" : "No applications yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasApplications
          ? "Try clearing your search or status filter to see more applications."
          : "Start by adding your first job application and link the resume you used."}
      </p>

      <div className="mt-6 flex justify-center gap-3">
        {hasApplications ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Filters
          </button>
        ) : (
          <Link
            to="/applications/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Application
          </Link>
        )}
      </div>
    </div>
  );
};

export default Applications;
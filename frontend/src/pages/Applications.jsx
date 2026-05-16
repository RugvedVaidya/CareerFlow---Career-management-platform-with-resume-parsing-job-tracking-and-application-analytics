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






// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   AlertTriangle,
//   BarChart3,
//   Briefcase,
//   Building2,
//   Calendar,
//   CheckCircle2,
//   Eye,
//   FileText,
//   Filter,
//   Globe2,
//   Loader2,
//   Plus,
//   RefreshCcw,
//   Search,
//   Trash2,
//   X,
// } from "lucide-react";

// import api from "../api/axios";
// import AppLayout from "../components/AppLayout";

// const Applications = () => {
//   const navigate = useNavigate();

//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [sourceFilter, setSourceFilter] = useState("ALL");

//   const [updatingId, setUpdatingId] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);

//   const [previewApplication, setPreviewApplication] = useState(null);

//   const [error, setError] = useState("");

//   const statusOptions = [
//     "SAVED",
//     "APPLIED",
//     "INTERVIEW",
//     "OFFER",
//     "REJECTED",
//   ];

//   const fetchApplications = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await api.get("/applications");

//       const data =
//         res.data.applications ||
//         res.data.data ||
//         res.data.jobs ||
//         res.data ||
//         [];

//       setApplications(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load applications");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApplications();
//   }, []);

//   const sources = useMemo(() => {
//     const uniqueSources = new Set();

//     applications.forEach((app) => {
//       const source = app.source || app.appliedFrom;
//       if (source) uniqueSources.add(source);
//     });

//     return ["ALL", ...Array.from(uniqueSources)];
//   }, [applications]);

//   const filteredApplications = useMemo(() => {
//     let result = [...applications];

//     if (statusFilter !== "ALL") {
//       result = result.filter((app) => app.status === statusFilter);
//     }

//     if (sourceFilter !== "ALL") {
//       result = result.filter(
//         (app) => (app.source || app.appliedFrom || "") === sourceFilter
//       );
//     }

//     if (searchTerm.trim()) {
//       const q = searchTerm.toLowerCase();

//       result = result.filter((app) => {
//         const company = app.companyName?.toLowerCase() || "";
//         const role = app.jobRole?.toLowerCase() || "";
//         const source = app.source?.toLowerCase() || "";
//         const appliedFrom = app.appliedFrom?.toLowerCase() || "";
//         const resume = app.resume?.fileName?.toLowerCase() || "";

//         return (
//           company.includes(q) ||
//           role.includes(q) ||
//           source.includes(q) ||
//           appliedFrom.includes(q) ||
//           resume.includes(q)
//         );
//       });
//     }

//     return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//   }, [applications, searchTerm, statusFilter, sourceFilter]);

//   const stats = useMemo(() => {
//     const total = applications.length;

//     const applied = applications.filter((app) => app.status === "APPLIED").length;
//     const interview = applications.filter(
//       (app) => app.status === "INTERVIEW"
//     ).length;
//     const offer = applications.filter((app) => app.status === "OFFER").length;
//     const rejected = applications.filter(
//       (app) => app.status === "REJECTED"
//     ).length;

//     const analyzed = applications.filter(
//       (app) =>
//         app.matchScore !== null &&
//         app.matchScore !== undefined &&
//         app.matchScore !== ""
//     ).length;

//     return {
//       total,
//       applied,
//       interview,
//       offer,
//       rejected,
//       analyzed,
//     };
//   }, [applications]);

//   const formatDate = (dateValue) => {
//     if (!dateValue) return "NA";

//     return new Date(dateValue).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const getStatusClass = (status) => {
//     switch (status) {
//       case "SAVED":
//         return "bg-slate-100 text-slate-700 ring-slate-200";
//       case "APPLIED":
//         return "bg-blue-50 text-blue-700 ring-blue-100";
//       case "INTERVIEW":
//         return "bg-purple-50 text-purple-700 ring-purple-100";
//       case "OFFER":
//         return "bg-green-50 text-green-700 ring-green-100";
//       case "REJECTED":
//         return "bg-red-50 text-red-700 ring-red-100";
//       default:
//         return "bg-slate-100 text-slate-700 ring-slate-200";
//     }
//   };

//   const getScoreClass = (score) => {
//     if (score === null || score === undefined) return "text-slate-500";
//     if (score >= 75) return "text-green-600";
//     if (score >= 50) return "text-yellow-600";
//     return "text-red-600";
//   };

//   const getScoreBgClass = (score) => {
//     if (score === null || score === undefined) return "bg-slate-100";
//     if (score >= 75) return "bg-green-50";
//     if (score >= 50) return "bg-yellow-50";
//     return "bg-red-50";
//   };

//   const handleStatusChange = async (applicationId, newStatus) => {
//     try {
//       setUpdatingId(applicationId);

//       await api.put(`/applications/${applicationId}`, {
//         status: newStatus,
//       });

//       setApplications((prev) =>
//         prev.map((app) =>
//           app.id === applicationId ? { ...app, status: newStatus } : app
//         )
//       );
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update status");
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const handleDelete = async (applicationId) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this application?"
//     );

//     if (!confirmDelete) return;

//     try {
//       setDeletingId(applicationId);

//       await api.delete(`/applications/${applicationId}`);

//       setApplications((prev) =>
//         prev.filter((application) => application.id !== applicationId)
//       );
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to delete application");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("ALL");
//     setSourceFilter("ALL");
//   };

//   if (loading) {
//     return (
//       <AppLayout>
//         <div className="flex min-h-[70vh] items-center justify-center">
//           <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
//               <p className="text-sm font-medium text-slate-600">
//                 Loading applications...
//               </p>
//             </div>
//           </div>
//         </div>
//       </AppLayout>
//     );
//   }

//   return (
//     <AppLayout>
//       <div className="space-y-6">
//         {/* Hero */}
//         <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm md:p-8">
//           <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
//             <div>
//               <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/10">
//                 <Briefcase size={14} />
//                 Application tracker
//               </div>

//               <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
//                 Track your job applications
//               </h2>

//               <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
//                 Monitor companies, roles, source platforms, resume used,
//                 application status, and resume-job match score in one place.
//               </p>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <button
//                 type="button"
//                 onClick={fetchApplications}
//                 className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
//               >
//                 <RefreshCcw size={18} />
//                 Refresh
//               </button>

//               <Link
//                 to="/applications/new"
//                 className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
//               >
//                 <Plus size={18} />
//                 New Application
//               </Link>
//             </div>
//           </div>
//         </section>

//         {/* Error */}
//         {error && (
//           <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
//             {error}
//           </div>
//         )}

//         {/* Stats */}
//         <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
//           <StatCard label="Total" value={stats.total} icon={Briefcase} />
//           <StatCard label="Applied" value={stats.applied} icon={CheckCircle2} />
//           <StatCard label="Interview" value={stats.interview} icon={Calendar} />
//           <StatCard label="Offers" value={stats.offer} icon={BarChart3} success />
//           <StatCard label="Rejected" value={stats.rejected} icon={AlertTriangle} danger />
//           <StatCard label="Analyzed" value={stats.analyzed} icon={FileText} />
//         </section>

//         {/* Filters */}
//         <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
//             <div className="relative xl:col-span-2">
//               <Search
//                 size={18}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//               />

//               <input
//                 type="text"
//                 placeholder="Search by company, role, source, or resume..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
//               />
//             </div>

//             <div className="relative">
//               <Filter
//                 size={18}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//               />

//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
//               >
//                 <option value="ALL">All Status</option>
//                 {statusOptions.map((status) => (
//                   <option key={status} value={status}>
//                     {status}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="relative">
//               <Globe2
//                 size={18}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//               />

//               <select
//                 value={sourceFilter}
//                 onChange={(e) => setSourceFilter(e.target.value)}
//                 className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
//               >
//                 {sources.map((source) => (
//                   <option key={source} value={source}>
//                     {source === "ALL" ? "All Sources" : source}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {(searchTerm || statusFilter !== "ALL" || sourceFilter !== "ALL") && (
//             <div className="mt-4 flex justify-end">
//               <button
//                 type="button"
//                 onClick={clearFilters}
//                 className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           )}
//         </section>

//         {/* List */}
//         <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//             <div>
//               <h3 className="text-lg font-bold text-slate-950">
//                 Applications
//               </h3>
//               <p className="mt-1 text-sm text-slate-500">
//                 Showing {filteredApplications.length} of {applications.length}{" "}
//                 applications
//               </p>
//             </div>
//           </div>

//           {filteredApplications.length === 0 ? (
//             <EmptyApplications
//               hasApplications={applications.length > 0}
//               onClear={clearFilters}
//             />
//           ) : (
//             <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//               {filteredApplications.map((app) => {
//                 const score =
//                   app.matchScore ??
//                   app.analysisResult?.score ??
//                   app.latestAnalysis?.score ??
//                   null;

//                 return (
//                   <div
//                     key={app.id}
//                     className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
//                   >
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="flex min-w-0 items-start gap-4">
//                         <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
//                           <Building2 size={26} />
//                         </div>

//                         <div className="min-w-0">
//                           <div className="flex flex-wrap items-center gap-2">
//                             <h3 className="truncate text-lg font-bold text-slate-950">
//                               {app.companyName}
//                             </h3>

//                             <span
//                               className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClass(
//                                 app.status
//                               )}`}
//                             >
//                               {app.status}
//                             </span>
//                           </div>

//                           <p className="mt-1 truncate text-sm font-semibold text-slate-600">
//                             {app.jobRole}
//                           </p>

//                           <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
//                             <span className="inline-flex items-center gap-1.5">
//                               <Calendar size={15} />
//                               {formatDate(app.appliedDate)}
//                             </span>

//                             <span className="inline-flex items-center gap-1.5">
//                               <Globe2 size={15} />
//                               {app.source || app.appliedFrom || "Source NA"}
//                             </span>

//                             <span className="inline-flex items-center gap-1.5">
//                               <FileText size={15} />
//                               {app.resume?.fileName || "No resume"}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div
//                         className={`shrink-0 rounded-2xl px-4 py-3 text-center ${getScoreBgClass(
//                           score
//                         )}`}
//                       >
//                         <p className="text-xs font-semibold text-slate-500">
//                           Match
//                         </p>
//                         <p className={`text-xl font-bold ${getScoreClass(score)}`}>
//                           {score !== null && score !== undefined ? `${score}%` : "NA"}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Job description preview */}
//                     {app.jobDescription && (
//                       <div className="mt-5 rounded-2xl bg-slate-50 p-4">
//                         <p className="line-clamp-2 text-sm leading-6 text-slate-600">
//                           {app.jobDescription}
//                         </p>

//                         <button
//                           type="button"
//                           onClick={() => setPreviewApplication(app)}
//                           className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
//                         >
//                           <Eye size={16} />
//                           View Job Description
//                         </button>
//                       </div>
//                     )}

//                     {/* Actions */}
//                     <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
//                       <div className="flex flex-wrap gap-2">
//                         {statusOptions.map((status) => (
//                           <button
//                             key={status}
//                             type="button"
//                             disabled={updatingId === app.id}
//                             onClick={() => handleStatusChange(app.id, status)}
//                             className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
//                               app.status === status
//                                 ? "bg-blue-600 text-white"
//                                 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                             }`}
//                           >
//                             {updatingId === app.id && app.status !== status
//                               ? "..."
//                               : status}
//                           </button>
//                         ))}
//                       </div>

//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={() => navigate(`/applications/${app.id}`)}
//                           className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//                         >
//                           <Eye size={17} />
//                           Details
//                         </button>

//                         <button
//                           type="button"
//                           disabled={deletingId === app.id}
//                           onClick={() => handleDelete(app.id)}
//                           className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
//                         >
//                           {deletingId === app.id ? (
//                             <Loader2 size={17} className="animate-spin" />
//                           ) : (
//                             <Trash2 size={17} />
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </section>
//       </div>

//       {/* Job Description Modal */}
//       {previewApplication && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
//           <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
//             <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-6 backdrop-blur">
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <p className="text-sm font-semibold text-blue-600">
//                     Job Description
//                   </p>
//                   <h2 className="mt-1 text-2xl font-bold text-slate-950">
//                     {previewApplication.companyName} -{" "}
//                     {previewApplication.jobRole}
//                   </h2>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setPreviewApplication(null)}
//                   className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               <div className="max-h-[65vh] overflow-y-auto whitespace-pre-wrap rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
//                 {previewApplication.jobDescription ||
//                   "No job description available."}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </AppLayout>
//   );
// };

// const StatCard = ({ label, value, icon: Icon, danger, success }) => {
//   let iconClass = "bg-blue-50 text-blue-600";

//   if (danger) iconClass = "bg-red-50 text-red-600";
//   if (success) iconClass = "bg-green-50 text-green-600";

//   return (
//     <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//       <div className="flex items-center justify-between gap-3">
//         <div>
//           <p className="text-sm font-medium text-slate-500">{label}</p>
//           <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
//         </div>

//         <div className={`rounded-2xl p-3 ${iconClass}`}>
//           <Icon size={22} />
//         </div>
//       </div>
//     </div>
//   );
// };

// const EmptyApplications = ({ hasApplications, onClear }) => {
//   return (
//     <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
//       <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
//         <Briefcase size={26} />
//       </div>

//       <h3 className="mt-5 text-lg font-bold text-slate-950">
//         {hasApplications ? "No matching applications" : "No applications yet"}
//       </h3>

//       <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
//         {hasApplications
//           ? "Try clearing search or filters to see more applications."
//           : "Add your first job application to start tracking your job search."}
//       </p>

//       <div className="mt-6 flex justify-center gap-3">
//         {hasApplications ? (
//           <button
//             type="button"
//             onClick={onClear}
//             className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//           >
//             Clear Filters
//           </button>
//         ) : (
//           <Link
//             to="/applications/new"
//             className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
//           >
//             <Plus size={18} />
//             Add Application
//           </Link>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Applications;
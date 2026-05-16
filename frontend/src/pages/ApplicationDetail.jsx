import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe2,
  Loader2,
  MapPin,
  Pencil,
  RefreshCcw,
  Save,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";

import api from "../api/axios";
import AppLayout from "../components/AppLayout";

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [interviewRounds, setInterviewRounds] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName: "",
    jobRole: "",
    location: "",
    source: "",
    status: "APPLIED",
    appliedDate: "",
    jobDescription: "",
  });

  const statusOptions = [
    "SAVED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
  ];

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/applications/${id}`);

      const app =
        res.data.application ||
        res.data.data ||
        res.data.jobApplication ||
        res.data;

      setApplication(app);

      setAnalyses(
        app?.analysisResults ||
          app?.analyses ||
          app?.analysis ||
          res.data.analyses ||
          []
      );

      setInterviewRounds(
        app?.interviewRounds ||
          app?.interviews ||
          res.data.interviewRounds ||
          []
      );

      setReminders(app?.reminders || res.data.reminders || []);

      setEditForm({
        companyName: app?.companyName || "",
        jobRole: app?.jobRole || "",
        location: app?.location || "",
        source: app?.source || app?.appliedFrom || "",
        status: app?.status || "APPLIED",
        appliedDate: app?.appliedDate
          ? new Date(app.appliedDate).toISOString().split("T")[0]
          : "",
        jobDescription: app?.jobDescription || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load application details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const latestAnalysis = useMemo(() => {
    if (!analyses || analyses.length === 0) return null;

    return [...analyses].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
  }, [analyses]);

  const displayMatchScore =
    application?.matchScore ??
    latestAnalysis?.score ??
    application?.analysisResult?.score ??
    null;

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
    if (score === null || score === undefined) return "text-slate-500";
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgClass = (score) => {
    if (score === null || score === undefined) return "bg-slate-100";
    if (score >= 75) return "bg-green-50";
    if (score >= 50) return "bg-yellow-50";
    return "bg-red-50";
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    try {
      setSavingStatus(true);

      await api.put(`/applications/${id}`, {
        status: newStatus,
      });

      setApplication((prev) => ({
        ...prev,
        status: newStatus,
      }));

      setEditForm((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editForm.companyName.trim()) {
      alert("Company name is required");
      return;
    }

    if (!editForm.jobRole.trim()) {
      alert("Job role is required");
      return;
    }

    try {
      setSavingStatus(true);

      const payload = {
        companyName: editForm.companyName.trim(),
        jobRole: editForm.jobRole.trim(),
        location: editForm.location.trim() || null,
        source: editForm.source.trim() || null,
        status: editForm.status,
        appliedDate: editForm.appliedDate || null,
        jobDescription: editForm.jobDescription.trim() || null,
      };

      const res = await api.put(`/applications/${id}`, payload);

      const updated =
        res.data.application ||
        res.data.data ||
        res.data.jobApplication ||
        res.data;

      setApplication((prev) => ({
        ...prev,
        ...updated,
      }));

      setEditMode(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update application");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      await api.delete(`/applications/${id}`);

      navigate("/applications");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete application");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-600">
                Loading application details...
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !application) {
    return (
      <AppLayout>
        <div className="space-y-5">
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error || "Application not found"}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </Link>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchApplicationDetail}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={17} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil size={17} />
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Trash2 size={17} />
              )}
              Delete
            </button>
          </div>
        </div>

        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/10">
                <Sparkles size={14} />
                Application profile
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {application.companyName}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </div>

              <p className="mt-3 text-lg font-medium text-slate-200">
                {application.jobRole}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                <HeroInfo icon={Calendar} text={formatDate(application.appliedDate)} />
                <HeroInfo
                  icon={Globe2}
                  text={application.source || application.appliedFrom || "Source NA"}
                />
                <HeroInfo
                  icon={MapPin}
                  text={application.location || "Location not added"}
                />
                <HeroInfo
                  icon={FileText}
                  text={application.resume?.fileName || "No resume linked"}
                />
              </div>
            </div>

            <div
              className={`min-w-[220px] rounded-3xl p-6 text-center ${getScoreBgClass(
                displayMatchScore
              )}`}
            >
              <p className="text-sm font-medium text-slate-500">Match Score</p>
              <p
                className={`mt-2 text-5xl font-bold ${getScoreClass(
                  displayMatchScore
                )}`}
              >
                {displayMatchScore !== null && displayMatchScore !== undefined
                  ? `${displayMatchScore}%`
                  : "NA"}
              </p>

              <Link
                to="/analyze"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <Target size={16} />
                Analyze
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 xl:col-span-2">
            {/* Details */}
            <Panel
              title="Application Details"
              subtitle="Core information about this job application"
              icon={Briefcase}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailCard
                  icon={Building2}
                  label="Company"
                  value={application.companyName}
                />
                <DetailCard
                  icon={Briefcase}
                  label="Role"
                  value={application.jobRole}
                />
                <DetailCard
                  icon={Globe2}
                  label="Source"
                  value={application.source || application.appliedFrom || "NA"}
                />
                <DetailCard
                  icon={Calendar}
                  label="Applied Date"
                  value={formatDate(application.appliedDate)}
                />
                <DetailCard
                  icon={MapPin}
                  label="Location"
                  value={application.location || "Not added"}
                />
                <DetailCard
                  icon={FileText}
                  label="Resume Used"
                  value={application.resume?.fileName || "Not selected"}
                />
              </div>
            </Panel>

            {/* Job Description */}
            <Panel
              title="Job Description"
              subtitle="Description saved for this application"
              icon={FileText}
            >
              {application.jobDescription ? (
                <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                  {application.jobDescription}
                </div>
              ) : (
                <EmptyBox
                  title="No job description added"
                  description="Edit this application and paste the job description to keep it available for analysis."
                />
              )}
            </Panel>

            {/* Latest Analysis */}
            <Panel
              title="Latest Analysis"
              subtitle="Resume match details for this application"
              icon={BarChart3}
            >
              {latestAnalysis ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Analysis score</p>
                      <p
                        className={`mt-1 text-4xl font-bold ${getScoreClass(
                          latestAnalysis.score
                        )}`}
                      >
                        {latestAnalysis.score}%
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedAnalysis(latestAnalysis)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Full Analysis
                      <ExternalLink size={17} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <SkillBox
                      title="Matched Skills"
                      skills={latestAnalysis.matchedSkills || []}
                      type="matched"
                    />

                    <SkillBox
                      title="Missing Skills"
                      skills={latestAnalysis.missingSkills || []}
                      type="missing"
                    />
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-950">Suggestions</h3>

                    {(latestAnalysis.suggestions || []).length > 0 ? (
                      <ul className="mt-4 space-y-3">
                        {latestAnalysis.suggestions
                          .slice(0, 4)
                          .map((suggestion, index) => (
                            <li
                              key={index}
                              className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                            >
                              {suggestion}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No suggestions available.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyBox
                  title="No analysis yet"
                  description="Run resume analysis for this application to see score, matched skills, missing skills, and suggestions."
                  actionLabel="Analyze Resume"
                  actionTo="/analyze"
                />
              )}
            </Panel>
          </div>

          {/* Right */}
          <aside className="space-y-6">
            <div className="sticky top-28 space-y-6">
              {/* Status */}
              <Panel
                title="Update Status"
                subtitle="Move this application through your pipeline"
                icon={CheckCircle2}
              >
                <div className="space-y-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={savingStatus}
                      onClick={() => handleQuickStatusUpdate(status)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        application.status === status
                          ? "border-blue-300 bg-blue-50 text-blue-700 ring-4 ring-blue-500/10"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{status}</span>
                      {application.status === status && <CheckCircle2 size={17} />}
                    </button>
                  ))}
                </div>
              </Panel>

              {/* Reminders */}
              <Panel
                title="Reminders"
                subtitle="Follow-ups linked to this application"
                icon={Bell}
              >
                {reminders.length > 0 ? (
                  <div className="space-y-3">
                    {reminders.slice(0, 4).map((reminder) => (
                      <div
                        key={reminder.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                            <Bell size={17} />
                          </div>

                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {reminder.title}
                            </h4>
                            {reminder.message && (
                              <p className="mt-1 text-sm text-slate-500">
                                {reminder.message}
                              </p>
                            )}
                            <p className="mt-2 text-xs font-medium text-slate-500">
                              Due: {formatDate(reminder.dueDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Link
                      to="/reminders"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Manage Reminders
                    </Link>
                  </div>
                ) : (
                  <EmptyBox
                    title="No reminders"
                    description="Create reminders for follow-ups, interviews, or deadlines."
                    actionLabel="Go to Reminders"
                    actionTo="/reminders"
                  />
                )}
              </Panel>

              {/* Interviews */}
              <Panel
                title="Interview Rounds"
                subtitle="Rounds connected to this application"
                icon={Clock}
              >
                {interviewRounds.length > 0 ? (
                  <div className="space-y-3">
                    {interviewRounds.slice(0, 4).map((round) => (
                      <div
                        key={round.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <h4 className="font-semibold text-slate-900">
                          {round.roundType || round.type || "Interview Round"}
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(round.scheduledAt || round.date)}
                        </p>

                        {round.notes && (
                          <p className="mt-2 text-sm text-slate-600">
                            {round.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyBox
                    title="No interview rounds"
                    description="Interview tracking can be added next."
                  />
                )}
              </Panel>
            </div>
          </aside>
        </section>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-6 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Edit Application
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    Update job application
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  label="Company Name"
                  name="companyName"
                  value={editForm.companyName}
                  onChange={handleEditChange}
                  icon={Building2}
                />

                <InputField
                  label="Job Role"
                  name="jobRole"
                  value={editForm.jobRole}
                  onChange={handleEditChange}
                  icon={Briefcase}
                />

                <InputField
                  label="Location"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  icon={MapPin}
                />

                <InputField
                  label="Source"
                  name="source"
                  value={editForm.source}
                  onChange={handleEditChange}
                  icon={Globe2}
                />

                <InputField
                  label="Applied Date"
                  name="appliedDate"
                  value={editForm.appliedDate}
                  onChange={handleEditChange}
                  icon={Calendar}
                  type="date"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Job Description
                </label>

                <textarea
                  name="jobDescription"
                  value={editForm.jobDescription}
                  onChange={handleEditChange}
                  rows="10"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingStatus}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingStatus ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-6 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Full Analysis
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {application.companyName} - {application.jobRole}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnalysis(null)}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div
                className={`rounded-3xl p-6 ${getScoreBgClass(
                  selectedAnalysis.score
                )}`}
              >
                <p className="text-sm text-slate-500">Match Score</p>
                <p
                  className={`mt-2 text-6xl font-bold ${getScoreClass(
                    selectedAnalysis.score
                  )}`}
                >
                  {selectedAnalysis.score}%
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <SkillBox
                  title="Matched Skills"
                  skills={selectedAnalysis.matchedSkills || []}
                  type="matched"
                />

                <SkillBox
                  title="Missing Skills"
                  skills={selectedAnalysis.missingSkills || []}
                  type="missing"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-950">
                  Suggestions
                </h3>

                {(selectedAnalysis.suggestions || []).length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {selectedAnalysis.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No suggestions available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

const HeroInfo = ({ icon: Icon, text }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
      <Icon size={15} />
      <span>{text}</span>
    </div>
  );
};

const Panel = ({ title, subtitle, icon: Icon, children }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <Icon size={20} />
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white p-3 text-slate-500 shadow-sm">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const SkillBox = ({ title, skills, type }) => {
  const isMatched = type === "matched";

  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-950">{title}</h3>

      {skills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isMatched
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No skills found.</p>
      )}
    </div>
  );
};

const EmptyBox = ({ title, description, actionLabel, actionTo }) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        <AlertTriangle size={22} />
      </div>

      <h3 className="font-bold text-slate-950">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  type = "text",
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
            Icon ? "px-12" : "px-4"
          }`}
        />
      </div>
    </div>
  );
};

export default ApplicationDetail;
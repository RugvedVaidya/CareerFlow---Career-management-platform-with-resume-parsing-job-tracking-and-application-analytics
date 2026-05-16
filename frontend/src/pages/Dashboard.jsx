import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import api from "../api/axios";
import AppLayout from "../components/AppLayout";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/dashboard");
      setStats(res.data.stats || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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
      case "APPLIED":
        return "bg-blue-50 text-blue-700 ring-blue-100";
      case "INTERVIEW":
        return "bg-purple-50 text-purple-700 ring-purple-100";
      case "OFFER":
        return "bg-green-50 text-green-700 ring-green-100";
      case "REJECTED":
        return "bg-red-50 text-red-700 ring-red-100";
      case "SAVED":
        return "bg-slate-100 text-slate-700 ring-slate-200";
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

  const upcomingReminders = stats?.upcomingReminders || [];
  const overdueReminders = stats?.overdueReminders || [];
  const recentApplications = stats?.recentApplications || [];
  const topMatches = stats?.topMatches || [];
  const latestAnalyses = stats?.latestAnalyses || [];
  const monthlyApplications = stats?.monthlyApplications || [];
  const statusCounts = stats?.statusCounts || {};

  const pendingReminderCount = upcomingReminders.length + overdueReminders.length;

  const bestMatch = useMemo(() => {
    if (!topMatches.length) return null;
    return topMatches[0];
  }, [topMatches]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-600">
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-7">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/10">
                <Sparkles size={14} />
                CareerFlow AI dashboard
              </div>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Your job search command center
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Track applications, monitor resume match scores, manage
                reminders, and review analysis insights from one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/applications/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Add Application
                </Link>

                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                >
                  <Target size={18} />
                  Analyze Resume
                </Link>

                <Link
                  to="/reminders"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                >
                  <Bell size={18} />
                  View Reminders
                </Link>
              </div>
            </div>

            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <HeroMiniCard
                label="Applications"
                value={stats?.totalApplications || 0}
              />
              <HeroMiniCard label="Resumes" value={stats?.totalResumes || 0} />
              <HeroMiniCard
                label="Avg Match"
                value={`${stats?.averageMatchScore || 0}%`}
              />
              <HeroMiniCard label="Pending Tasks" value={pendingReminderCount} />
            </div>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={stats?.totalApplications || 0}
            subtitle="Applications tracked"
            icon={Briefcase}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Total Resumes"
            value={stats?.totalResumes || 0}
            subtitle="Uploaded resumes"
            icon={FileText}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            title="Average Match"
            value={`${stats?.averageMatchScore || 0}%`}
            subtitle="Across analyzed jobs"
            icon={Target}
            iconClass="bg-green-50 text-green-600"
          />

          <StatCard
            title="Pending Reminders"
            value={pendingReminderCount}
            subtitle={`${overdueReminders.length} overdue`}
            icon={Bell}
            iconClass="bg-orange-50 text-orange-600"
          />
        </section>

        {/* Main Grid */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Recent Applications */}
          <div className="xl:col-span-2">
            <Panel
              title="Recent Applications"
              subtitle="Latest roles added to your tracker"
              actionLabel="View all"
              actionTo="/applications"
              icon={Briefcase}
            >
              {recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {recentApplications.slice(0, 5).map((app) => (
                    <Link
                      key={app.id}
                      to={`/applications/${app.id}`}
                      className="group block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {app.companyName}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getStatusClass(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {app.jobRole}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>
                              Resume:{" "}
                              <b className="font-medium text-slate-700">
                                {app.resume?.fileName || "Not selected"}
                              </b>
                            </span>

                            <span>
                              Source:{" "}
                              <b className="font-medium text-slate-700">
                                {app.source || app.appliedFrom || "NA"}
                              </b>
                            </span>

                            <span>
                              Applied:{" "}
                              <b className="font-medium text-slate-700">
                                {formatDate(app.appliedDate)}
                              </b>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 md:justify-end">
                          <div
                            className={`rounded-2xl px-4 py-2 text-right ${getScoreBgClass(
                              app.matchScore
                            )}`}
                          >
                            <p className="text-xs text-slate-500">Match</p>
                            <p
                              className={`text-lg font-bold ${getScoreClass(
                                app.matchScore
                              )}`}
                            >
                              {app.matchScore ?? "NA"}
                              {app.matchScore !== null &&
                              app.matchScore !== undefined
                                ? "%"
                                : ""}
                            </p>
                          </div>

                          <ArrowRight
                            size={18}
                            className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No applications yet"
                  description="Add your first job application to start tracking your progress."
                  actionLabel="Add Application"
                  actionTo="/applications/new"
                />
              )}
            </Panel>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Panel
              title="Best Match"
              subtitle="Your highest scoring application"
              icon={TrendingUp}
            >
              {bestMatch ? (
                <Link
                  to={`/applications/${bestMatch.id}`}
                  className="block rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-white p-5 transition hover:border-green-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {bestMatch.companyName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {bestMatch.jobRole}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Score</p>
                      <p
                        className={`text-3xl font-bold ${getScoreClass(
                          bestMatch.matchScore
                        )}`}
                      >
                        {bestMatch.matchScore ?? "NA"}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-green-700">
                    <span>Open details</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ) : (
                <EmptyMini
                  text="No analyzed applications yet. Run resume analysis to see your best match."
                />
              )}
            </Panel>

            <Panel
              title="Application Status"
              subtitle="Current pipeline summary"
              icon={BarChart3}
            >
              {Object.keys(statusCounts).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyMini text="No status data available." />
              )}
            </Panel>
          </div>
        </section>

        {/* Reminders + Latest Analysis */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel
            title="Upcoming Reminders"
            subtitle="Tasks and follow-ups coming next"
            actionLabel="Manage"
            actionTo="/reminders"
            icon={CalendarClock}
          >
            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.slice(0, 4).map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    type="upcoming"
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No upcoming reminders"
                description="You are clear for now. Add reminders for follow-ups and interviews."
                actionLabel="Add Reminder"
                actionTo="/reminders"
              />
            )}
          </Panel>

          <Panel
            title="Overdue Reminders"
            subtitle="Items that need attention"
            actionLabel="Review"
            actionTo="/reminders"
            icon={AlertTriangle}
          >
            {overdueReminders.length > 0 ? (
              <div className="space-y-3">
                {overdueReminders.slice(0, 4).map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    type="overdue"
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No overdue reminders"
                description="Great. Nothing is overdue right now."
              />
            )}
          </Panel>
        </section>

        {/* Analysis + Monthly */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Panel
              title="Latest Analysis"
              subtitle="Click any analysis to view full details"
              icon={Activity}
            >
              {latestAnalyses.length > 0 ? (
                <div className="space-y-3">
                  {latestAnalyses.slice(0, 5).map((analysis) => (
                    <button
                      key={analysis.id}
                      onClick={() => setSelectedAnalysis(analysis)}
                      className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {analysis.application?.companyName ||
                              "Application"}{" "}
                            - {analysis.application?.jobRole || "Role"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Resume: {analysis.resume?.fileName || "NA"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {(analysis.matchedSkills || [])
                              .slice(0, 5)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-2xl px-4 py-2 text-right ${getScoreBgClass(
                              analysis.score
                            )}`}
                          >
                            <p className="text-xs text-slate-500">Score</p>
                            <p
                              className={`text-xl font-bold ${getScoreClass(
                                analysis.score
                              )}`}
                            >
                              {analysis.score}%
                            </p>
                          </div>

                          <ArrowRight
                            size={18}
                            className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No analysis yet"
                  description="Analyze a resume against a job description to get match score and suggestions."
                  actionLabel="Analyze Resume"
                  actionTo="/analyze"
                />
              )}
            </Panel>
          </div>

          <Panel
            title="Monthly Activity"
            subtitle="Applications added by month"
            icon={BarChart3}
          >
            {monthlyApplications.length > 0 ? (
              <div className="space-y-3">
                {monthlyApplications.map((item) => (
                  <div
                    key={item.month}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {item.month}
                      </span>

                      <span className="text-sm font-bold text-blue-600">
                        {item.count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(10, item.count * 20)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyMini text="No monthly data available." />
            )}
          </Panel>
        </section>
      </div>

      {/* Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-6 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Analysis Details
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {selectedAnalysis.application?.companyName || "Application"}{" "}
                    - {selectedAnalysis.application?.jobRole || "Role"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Resume: {selectedAnalysis.resume?.fileName || "NA"}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
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

                <h3
                  className={`mt-2 text-6xl font-bold ${getScoreClass(
                    selectedAnalysis.score
                  )}`}
                >
                  {selectedAnalysis.score}%
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <SkillPanel
                  title="Matched Skills"
                  skills={selectedAnalysis.matchedSkills || []}
                  type="matched"
                />

                <SkillPanel
                  title="Missing Skills"
                  skills={selectedAnalysis.missingSkills || []}
                  type="missing"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-950">
                  Suggestions
                </h3>

                {(selectedAnalysis.suggestions || []).length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {(selectedAnalysis.suggestions || []).map(
                      (suggestion, index) => (
                        <li
                          key={index}
                          className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                        >
                          {suggestion}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No suggestions available.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                <DetailMini
                  label="Company"
                  value={selectedAnalysis.application?.companyName || "NA"}
                />
                <DetailMini
                  label="Role"
                  value={selectedAnalysis.application?.jobRole || "NA"}
                />
                <DetailMini
                  label="Status"
                  value={selectedAnalysis.application?.status || "NA"}
                />
                <DetailMini
                  label="Resume"
                  value={selectedAnalysis.resume?.fileName || "NA"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

const HeroMiniCard = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, iconClass }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className={`rounded-2xl p-3 ${iconClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const Panel = ({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  actionTo,
  children,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Icon size={20} />
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>

        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      {children}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo }) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
          <Icon size={22} />
        </div>
      )}

      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
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

const EmptyMini = ({ text }) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
      {text}
    </div>
  );
};

const ReminderCard = ({ reminder, type, formatDate }) => {
  const isOverdue = type === "overdue";

  return (
    <Link
      to="/reminders"
      className={`block rounded-2xl border p-4 transition ${
        isOverdue
          ? "border-red-100 bg-red-50 hover:border-red-200"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-2xl p-3 ${
            isOverdue
              ? "bg-red-100 text-red-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {isOverdue ? <AlertTriangle size={18} /> : <CalendarClock size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`font-semibold ${
                isOverdue ? "text-red-700" : "text-slate-900"
              }`}
            >
              {reminder.title}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                isOverdue
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {isOverdue ? "Overdue" : "Upcoming"}
            </span>
          </div>

          {reminder.message && (
            <p
              className={`mt-1 line-clamp-2 text-sm ${
                isOverdue ? "text-red-600" : "text-slate-500"
              }`}
            >
              {reminder.message}
            </p>
          )}

          <p
            className={`mt-2 text-sm ${
              isOverdue ? "text-red-600" : "text-slate-500"
            }`}
          >
            Due: {formatDate(reminder.dueDate)}
          </p>

          {reminder.application && (
            <p
              className={`mt-1 text-sm ${
                isOverdue ? "text-red-600" : "text-slate-500"
              }`}
            >
              {reminder.application.companyName} -{" "}
              {reminder.application.jobRole}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

const SkillPanel = ({ title, skills, type }) => {
  const isMatched = type === "matched";

  return (
    <div className="rounded-3xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>

      {skills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
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

const DetailMini = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-900">{value}</p>
    </div>
  );
};

export default Dashboard;
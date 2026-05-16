import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Target,
  Activity,
  Bell,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";

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
      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
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
        return "bg-blue-50 text-blue-700";
      case "INTERVIEW":
        return "bg-purple-50 text-purple-700";
      case "OFFER":
        return "bg-green-50 text-green-700";
      case "REJECTED":
        return "bg-red-50 text-red-700";
      case "SAVED":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getScoreClass = (score) => {
    if (score === null || score === undefined) return "text-slate-500";
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <main className="flex-1">
          <div className="flex h-screen items-center justify-center">
            <p className="text-sm text-slate-500">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b bg-white px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, Rugved
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track applications, resumes, match scores, and reminders.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            R
          </div>
        </div>

        <div className="space-y-6 p-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Applications</p>
                  <h2 className="mt-4 text-3xl font-bold text-slate-900">
                    {stats?.totalApplications || 0}
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Briefcase size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Resumes</p>
                  <h2 className="mt-4 text-3xl font-bold text-slate-900">
                    {stats?.totalResumes || 0}
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <FileText size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg Match</p>
                  <h2 className="mt-4 text-3xl font-bold text-slate-900">
                    {stats?.averageMatchScore || 0}%
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Target size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Reminders</p>
                  <h2 className="mt-4 text-3xl font-bold text-slate-900">
                    {(stats?.upcomingReminders?.length || 0) +
                      (stats?.overdueReminders?.length || 0)}
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Bell size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Reminders Row */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Upcoming Reminders
                  </h2>
                  <p className="text-sm text-slate-500">
                    Follow-ups and tasks you should not miss.
                  </p>
                </div>

                <Link
                  to="/reminders"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {stats?.upcomingReminders?.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingReminders.slice(0, 3).map((reminder) => (
                    <div
                      key={reminder.id}
                      className="rounded-xl border p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          <CalendarClock size={18} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {reminder.title}
                          </h3>

                          {reminder.message && (
                            <p className="mt-1 text-sm text-slate-500">
                              {reminder.message}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-slate-500">
                            Due: {formatDate(reminder.dueDate)}
                          </p>

                          {reminder.application && (
                            <p className="mt-1 text-sm text-slate-500">
                              {reminder.application.companyName} -{" "}
                              {reminder.application.jobRole}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No upcoming reminders.
                </p>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Overdue Reminders
                  </h2>
                  <p className="text-sm text-slate-500">
                    These need immediate attention.
                  </p>
                </div>

                <Link
                  to="/reminders"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {stats?.overdueReminders?.length > 0 ? (
                <div className="space-y-3">
                  {stats.overdueReminders.slice(0, 3).map((reminder) => (
                    <div
                      key={reminder.id}
                      className="rounded-xl border border-red-100 bg-red-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-red-100 p-2 text-red-600">
                          <AlertTriangle size={18} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-red-700">
                            {reminder.title}
                          </h3>

                          {reminder.message && (
                            <p className="mt-1 text-sm text-red-600">
                              {reminder.message}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-red-600">
                            Due: {formatDate(reminder.dueDate)}
                          </p>

                          {reminder.application && (
                            <p className="mt-1 text-sm text-red-600">
                              {reminder.application.companyName} -{" "}
                              {reminder.application.jobRole}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No overdue reminders.
                </p>
              )}
            </div>
          </div>

          {/* Recent Applications + Top Matches */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Applications
                </h2>

                <Link
                  to="/applications"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {stats?.recentApplications?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentApplications.slice(0, 5).map((app) => (
                    <Link
                      key={app.id}
                      to={`/applications/${app.id}`}
                      className="block rounded-xl border p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {app.companyName}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {app.jobRole}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Resume:{" "}
                            {app.resume?.fileName || "No resume selected"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Source: {app.source || "NA"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No recent applications found.
                </p>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-slate-900">
                Top Matches
              </h2>

              {stats?.topMatches?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topMatches.slice(0, 5).map((app) => (
                    <Link
                      key={app.id}
                      to={`/applications/${app.id}`}
                      className="block rounded-xl border p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {app.companyName}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {app.jobRole}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Resume:{" "}
                            {app.resume?.fileName || "No resume selected"}
                          </p>
                        </div>

                        <span
                          className={`text-lg font-bold ${getScoreClass(
                            app.matchScore
                          )}`}
                        >
                          {app.matchScore ?? "NA"}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No match scores available yet.
                </p>
              )}
            </div>
          </div>

          {/* Latest Analysis */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Latest Analysis
                </h2>
                <p className="text-sm text-slate-500">
                  Click any analysis to see score, matched skills, missing
                  skills, and suggestions.
                </p>
              </div>

              <Activity className="text-blue-600" size={24} />
            </div>

            {stats?.latestAnalyses?.length > 0 ? (
              <div className="space-y-3">
                {stats.latestAnalyses.slice(0, 5).map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className="w-full rounded-xl border p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {analysis.application?.companyName || "Application"} -{" "}
                          {analysis.application?.jobRole || "Role"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Resume: {analysis.resume?.fileName || "NA"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {analysis.matchedSkills
                            ?.slice(0, 5)
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

                      <span
                        className={`text-xl font-bold ${getScoreClass(
                          analysis.score
                        )}`}
                      >
                        {analysis.score}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No analysis results available yet.
              </p>
            )}
          </div>

          {/* Monthly Applications */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Monthly Applications
            </h2>

            {stats?.monthlyApplications?.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {stats.monthlyApplications.map((item) => (
                  <div
                    key={item.month}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {item.month}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No monthly application data.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Analysis Details Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Analysis Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedAnalysis.application?.companyName || "NA"} -{" "}
                  {selectedAnalysis.application?.jobRole || "NA"}
                </p>
              </div>

              <button
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Match Score</p>

              <h3
                className={`mt-2 text-5xl font-bold ${getScoreClass(
                  selectedAnalysis.score
                )}`}
              >
                {selectedAnalysis.score}%
              </h3>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold text-slate-900">
                  Matched Skills
                </h3>

                {selectedAnalysis.matchedSkills?.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedAnalysis.matchedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No matched skills.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold text-slate-900">
                  Missing Skills
                </h3>

                {selectedAnalysis.missingSkills?.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedAnalysis.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No missing skills.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border p-5">
              <h3 className="font-semibold text-slate-900">Suggestions</h3>

              {selectedAnalysis.suggestions?.length > 0 ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {selectedAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No suggestions available.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border p-5">
              <h3 className="font-semibold text-slate-900">Linked Details</h3>

              <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="text-slate-500">Company</p>
                  <p className="font-medium text-slate-900">
                    {selectedAnalysis.application?.companyName || "NA"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Role</p>
                  <p className="font-medium text-slate-900">
                    {selectedAnalysis.application?.jobRole || "NA"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-medium text-slate-900">
                    {selectedAnalysis.application?.status || "NA"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Resume</p>
                  <p className="font-medium text-slate-900">
                    {selectedAnalysis.resume?.fileName || "NA"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
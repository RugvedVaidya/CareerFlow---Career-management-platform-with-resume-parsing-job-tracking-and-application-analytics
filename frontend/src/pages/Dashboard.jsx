import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Briefcase, FileText, Target, Activity, X } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get("/dashboard");
      setStats(data.stats);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-slate-100">
        <Sidebar />

        <main className="flex-1">
          <Navbar />

          <div className="p-6 text-slate-600">Loading dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

            <p className="text-slate-500 text-sm">
              Overview of your job applications, resumes, match scores, and
              latest analyses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StatCard
              title="Applications"
              value={stats?.totalApplications || 0}
              icon={Briefcase}
            />

            <StatCard
              title="Resumes"
              value={stats?.totalResumes || 0}
              icon={FileText}
            />

            <StatCard
              title="Avg Match"
              value={`${stats?.averageMatchScore || 0}%`}
              icon={Target}
            />

            <StatCard
              title="Statuses"
              value={Object.keys(stats?.statusCounts || {}).length}
              icon={Activity}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Recent Applications
              </h3>

              <div className="space-y-3">
                {stats?.recentApplications?.length === 0 && (
                  <p className="text-slate-500 text-sm">
                    No applications yet.
                  </p>
                )}

                {stats?.recentApplications?.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {app.companyName}
                      </h4>

                      <p className="text-sm text-slate-500">{app.jobRole}</p>

                      <p className="text-xs text-slate-500 mt-1">
                        Resume: {app.resume?.fileName || "Not selected"}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Applied From: {app.appliedFrom || "-"}
                      </p>
                    </div>

                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 w-fit">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Top Matches
              </h3>

              <div className="space-y-3">
                {stats?.topMatches?.length === 0 && (
                  <p className="text-slate-500 text-sm">
                    No match scores yet.
                  </p>
                )}

                {stats?.topMatches?.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {app.companyName}
                      </h4>

                      <p className="text-sm text-slate-500">{app.jobRole}</p>

                      <p className="text-xs text-slate-500 mt-1">
                        Resume: {app.resume?.fileName || "Not selected"}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Applied From: {app.appliedFrom || "-"}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-green-600">
                      {app.matchScore}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Latest Analysis
            </h3>

            <div className="space-y-3">
              {stats?.latestAnalyses?.length === 0 && (
                <p className="text-slate-500 text-sm">No analyses yet.</p>
              )}

              {stats?.latestAnalyses?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedAnalysis(item)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {item.application.companyName} -{" "}
                        {item.application.jobRole}
                      </h4>

                      <p className="text-sm text-slate-500">
                        Resume: {item.resume?.fileName || "Not selected"}
                      </p>

                      <p className="text-xs text-blue-600 mt-1">
                        Click to view full analysis
                      </p>
                    </div>

                    <span className="font-bold text-blue-600">
                      {item.score}%
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.matchedSkills?.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {selectedAnalysis && (
        <AnalysisModal
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </div>
  );
};

const AnalysisModal = ({ analysis, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {analysis.application.companyName} - {analysis.application.jobRole}
            </h2>

            <p className="text-sm text-slate-500">
              Resume: {analysis.resume?.fileName || "Not selected"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-6">
          <div className="bg-blue-50 text-blue-700 rounded-2xl p-5">
            <p className="text-sm">Match Score</p>

            <h3 className="text-4xl font-bold mt-1">{analysis.score}%</h3>
          </div>

          <SkillBlock
            title="Matched Skills"
            skills={analysis.matchedSkills || []}
            color="green"
          />

          <SkillBlock
            title="Missing Skills"
            skills={analysis.missingSkills || []}
            color="orange"
          />

          <div>
            <h3 className="font-semibold text-slate-800 mb-3">
              Suggested Changes
            </h3>

            {analysis.suggestions?.length === 0 ? (
              <p className="text-sm text-slate-500">No suggestions found.</p>
            ) : (
              <ul className="space-y-3">
                {analysis.suggestions?.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-4 rounded-xl bg-slate-50 text-sm text-slate-700"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <SkillBlock
            title="Resume Skills"
            skills={analysis.resumeSkills || []}
            color="blue"
          />

          <SkillBlock
            title="Job Skills"
            skills={analysis.jobSkills || []}
            color="slate"
          />
        </div>
      </div>
    </div>
  );
};

const SkillBlock = ({ title, skills, color }) => {
  const styles = {
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div>
      <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>

      {skills.length === 0 ? (
        <p className="text-sm text-slate-500">No skills found.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className={`text-xs px-3 py-1 rounded-full ${styles[color]}`}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>

        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
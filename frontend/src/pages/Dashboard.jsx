import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  Briefcase,
  FileText,
  Target,
  Activity,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get("/dashboard");
      setStats(data.stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          Loading dashboard...
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
                    className="p-4 rounded-xl border border-slate-200 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {app.companyName}
                      </h4>
                      <p className="text-sm text-slate-500">{app.jobRole}</p>
                    </div>

                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">
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
                    className="p-4 rounded-xl border border-slate-200 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {app.companyName}
                      </h4>
                      <p className="text-sm text-slate-500">{app.jobRole}</p>
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
                <p className="text-slate-500 text-sm">
                  No analyses yet.
                </p>
              )}

              {stats?.latestAnalyses?.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200"
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {item.application.companyName} -{" "}
                        {item.application.jobRole}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Resume: {item.resume.fileName}
                      </p>
                    </div>

                    <span className="font-bold text-blue-600">
                      {item.score}%
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.matchedSkills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
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
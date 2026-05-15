import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const { data } = await API.get("/applications");
      setApplications(data.applications || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete application");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Applications
              </h1>
              <p className="text-slate-500 text-sm">
                Track every company and role you apply to.
              </p>
            </div>

            <Link
              to="/applications/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium"
            >
              <Plus size={18} />
              Add Application
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 text-slate-500">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="p-6 text-slate-500">
                No applications yet. Add your first one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Company
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Role
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Match
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Applied
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {app.companyName}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {app.jobRole}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {app.matchScore !== null && app.matchScore !== undefined
                            ? `${app.matchScore}%`
                            : "Not analyzed"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {app.appliedDate
                            ? new Date(app.appliedDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => deleteApplication(app.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Applications;
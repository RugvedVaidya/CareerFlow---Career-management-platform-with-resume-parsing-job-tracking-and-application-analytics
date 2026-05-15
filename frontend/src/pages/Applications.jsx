import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, Eye, X, ExternalLink } from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Applications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDescription, setSelectedDescription] = useState(null);

  const statuses = [
    "SAVED",
    "APPLIED",
    "ONLINE_ASSESSMENT",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
  ];

  const fetchApplications = async () => {
    try {
      const { data } = await API.get("/applications");
      setApplications(data.applications || []);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await API.put(`/applications/${id}`, { status });

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? data.application : app))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Applications
              </h1>

              <p className="text-slate-500 text-sm">
                Track every company, role, source, resume, status, and job
                description.
              </p>
            </div>

            <Link
              to="/applications/new"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium"
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
                        Applied From
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Status
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Resume Used
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Match
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Applied
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        JD
                      </th>

                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Details
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

                        <td className="px-5 py-4 text-slate-600">
                          {app.appliedFrom || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              updateStatus(app.id, e.target.value)
                            }
                            className="text-xs px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 focus:outline-none"
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {app.resume?.fileName || "Not selected"}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {app.matchScore !== null &&
                          app.matchScore !== undefined
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
                            onClick={() =>
                              setSelectedDescription({
                                companyName: app.companyName,
                                jobRole: app.jobRole,
                                jobDescription: app.jobDescription,
                              })
                            }
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={17} />
                            View
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => navigate(`/applications/${app.id}`)}
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-700"
                          >
                            <ExternalLink size={17} />
                            Open
                          </button>
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

      {selectedDescription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedDescription.companyName}
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedDescription.jobRole}
                </p>
              </div>

              <button
                onClick={() => setSelectedDescription(null)}
                className="h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <h3 className="font-semibold text-slate-800 mb-2">
                Job Description
              </h3>

              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-6">
                {selectedDescription.jobDescription}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
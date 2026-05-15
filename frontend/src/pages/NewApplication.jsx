import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const NewApplication = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);

  const [formData, setFormData] = useState({
    companyName: "",
    jobRole: "",
    location: "",
    jobDescription: "",
    status: "APPLIED",
    appliedDate: new Date().toISOString().split("T")[0],
    resumeId: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const statuses = [
    "SAVED",
    "APPLIED",
    "ONLINE_ASSESSMENT",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
  ];

  const fetchResumes = async () => {
    try {
      const { data } = await API.get("/resumes");
      setResumes(data.resumes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      await API.post("/applications", {
        ...formData,
        resumeId: formData.resumeId ? Number(formData.resumeId) : null,
      });

      navigate("/applications");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-6 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Add Application
            </h1>
            <p className="text-slate-500 text-sm">
              Save a job description and select the resume used for this application.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {error && (
              <div className="mb-5 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Company Name
                  </label>
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="TCS"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Job Role
                  </label>
                  <input
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full Stack Developer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Location
                  </label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pune"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    name="appliedDate"
                    value={formData.appliedDate}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Resume Used
                </label>
                <select
                  name="resumeId"
                  value={formData.resumeId}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {loadingResumes ? "Loading resumes..." : "No resume selected"}
                  </option>

                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.fileName}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-slate-500 mt-1">
                  This helps track which resume version was used for each application.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Job Description
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows="10"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste the job description here..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Application"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/applications")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewApplication;
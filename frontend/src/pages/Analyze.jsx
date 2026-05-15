import { useEffect, useState } from "react";
import { SearchCheck, Target, CheckCircle, AlertCircle } from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Analyze = () => {
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);

  const [resumeId, setResumeId] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [resumeRes, appRes] = await Promise.all([
        API.get("/resumes"),
        API.get("/applications"),
      ]);

      setResumes(resumeRes.data.resumes || []);
      setApplications(appRes.data.applications || []);
    } catch (error) {
      setError("Failed to load resumes or applications.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!resumeId || !applicationId) {
      setError("Please select both resume and application.");
      return;
    }

    try {
      setError("");
      setAnalyzing(true);
      setAnalysis(null);

      const { data } = await API.post("/analyze", {
        resumeId: Number(resumeId),
        applicationId: Number(applicationId),
      });

      setAnalysis(data.analysis);
    } catch (error) {
      setError(error.response?.data?.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Resume Analyzer
            </h1>
            <p className="text-slate-500 text-sm">
              Compare a resume with a job description and get a match score.
            </p>
          </div>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Run Analysis
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {loadingData ? (
              <p className="text-slate-500">Loading data...</p>
            ) : (
              <form onSubmit={handleAnalyze} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Select Resume
                    </label>
                    <select
                      value={resumeId}
                      onChange={(e) => setResumeId(e.target.value)}
                      className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose resume</option>
                      {resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.fileName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Select Application
                    </label>
                    <select
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                      className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose application</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.companyName} - {app.jobRole}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  disabled={analyzing}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-60"
                >
                  <SearchCheck size={18} />
                  {analyzing ? "Analyzing..." : "Analyze Resume"}
                </button>
              </form>
            )}
          </section>

          {analysis && (
            <section className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      Match Score
                    </h2>
                    <p className="text-sm text-slate-500">
                      Based on matched job description skills.
                    </p>
                  </div>

                  <div className="h-24 w-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <div className="text-center">
                      <Target className="mx-auto mb-1" size={22} />
                      <span className="text-2xl font-bold">
                        {analysis.score}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkillSection
                  title="Matched Skills"
                  icon={CheckCircle}
                  skills={analysis.matchedSkills}
                  type="matched"
                />

                <SkillSection
                  title="Missing Skills"
                  icon={AlertCircle}
                  skills={analysis.missingSkills}
                  type="missing"
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Suggestions
                </h2>

                <ul className="space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-4 rounded-xl bg-slate-50 text-slate-700 text-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Extracted Skill Sets
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3">
                      Resume Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.resumeSkills.map((skill) => (
                        <Badge key={skill} text={skill} color="blue" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3">
                      Job Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.jobSkills.map((skill) => (
                        <Badge key={skill} text={skill} color="slate" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

const SkillSection = ({ title, icon: Icon, skills, type }) => {
  const isMatched = type === "matched";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon
          size={20}
          className={isMatched ? "text-green-600" : "text-orange-600"}
        />
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>

      {skills.length === 0 ? (
        <p className="text-sm text-slate-500">No skills found.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              text={skill}
              color={isMatched ? "green" : "orange"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Badge = ({ text, color }) => {
  const styles = {
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles[color]}`}>
      {text}
    </span>
  );
};

export default Analyze;
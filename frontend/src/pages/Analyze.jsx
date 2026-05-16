import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle2,
  FileSearch,
  FileText,
  Loader2,
  RefreshCcw,
  SearchCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import api from "../api/axios";
import AppLayout from "../components/AppLayout";

const Analyze = () => {
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [latestAnalyses, setLatestAnalyses] = useState([]);

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");

  const [loadingData, setLoadingData] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [resumeRes, applicationRes, dashboardRes] = await Promise.allSettled([
        api.get("/resumes"),
        api.get("/applications"),
        api.get("/dashboard/stats"),
      ]);

      if (resumeRes.status === "fulfilled") {
        const resumeData =
          resumeRes.value.data.resumes ||
          resumeRes.value.data.data ||
          resumeRes.value.data.files ||
          resumeRes.value.data ||
          [];

        setResumes(Array.isArray(resumeData) ? resumeData : []);
      }

      if (applicationRes.status === "fulfilled") {
        const appData =
          applicationRes.value.data.applications ||
          applicationRes.value.data.data ||
          applicationRes.value.data.jobs ||
          applicationRes.value.data ||
          [];

        setApplications(Array.isArray(appData) ? appData : []);
      }

      if (dashboardRes.status === "fulfilled") {
        const stats =
          dashboardRes.value.data.stats ||
          dashboardRes.value.data.data ||
          dashboardRes.value.data ||
          {};

        setLatestAnalyses(stats.latestAnalyses || stats.analyses || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analysis data");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const selectedResume = useMemo(() => {
    return resumes.find((resume) => String(resume.id) === String(selectedResumeId));
  }, [resumes, selectedResumeId]);

  const selectedApplication = useMemo(() => {
    return applications.find(
      (application) => String(application.id) === String(selectedApplicationId)
    );
  }, [applications, selectedApplicationId]);

  useEffect(() => {
    if (selectedApplication?.resumeId && !selectedResumeId) {
      setSelectedResumeId(String(selectedApplication.resumeId));
    }

    if (selectedApplication?.resume?.id && !selectedResumeId) {
      setSelectedResumeId(String(selectedApplication.resume.id));
    }
  }, [selectedApplication, selectedResumeId]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "NA";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      setError("Please select a resume");
      setSuccess("");
      return;
    }

    if (!selectedApplicationId) {
      setError("Please select an application");
      setSuccess("");
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setSuccess("");
      setAnalysisResult(null);

      const payload = {
        resumeId: Number(selectedResumeId),
        applicationId: Number(selectedApplicationId),
      };

      const res = await api.post("/analysis/analyze", payload);

      const result =
        res.data.analysis ||
        res.data.analysisResult ||
        res.data.result ||
        res.data.data ||
        res.data;

      setAnalysisResult(result);

      setLatestAnalyses((prev) => [result, ...prev]);

      setSuccess("Resume analyzed successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loadingData) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-600">
                Loading analysis page...
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
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/10">
                <Sparkles size={14} />
                AI resume analysis
              </div>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Match resume with job description
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Select a resume and an application. CareerFlow will compare
                resume skills with the job description and show score,
                matched skills, missing skills, and suggestions.
              </p>
            </div>

            <div className="grid min-w-[260px] grid-cols-2 gap-3">
              <HeroMiniCard label="Resumes" value={resumes.length} />
              <HeroMiniCard label="Applications" value={applications.length} />
            </div>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* Main */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Form */}
          <div className="space-y-6 xl:col-span-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon={FileSearch}
                title="Start Analysis"
                subtitle="Choose resume and application."
              />

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Application
                  </label>

                  <select
                    value={selectedApplicationId}
                    onChange={(e) => setSelectedApplicationId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="">Choose application</option>

                    {applications.map((application) => (
                      <option key={application.id} value={application.id}>
                        {application.companyName} - {application.jobRole}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Resume
                  </label>

                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="">Choose resume</option>

                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.fileName}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SearchCheck size={18} />
                      Analyze Resume
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={fetchInitialData}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCcw size={18} />
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Selected Info */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon={Briefcase}
                title="Selected Details"
                subtitle="Preview selected application and resume."
              />

              <div className="mt-6 space-y-4">
                <PreviewRow
                  label="Application"
                  value={
                    selectedApplication
                      ? `${selectedApplication.companyName} - ${selectedApplication.jobRole}`
                      : "Not selected"
                  }
                />

                <PreviewRow
                  label="Resume"
                  value={selectedResume?.fileName || "Not selected"}
                />

                <PreviewRow
                  label="Applied Date"
                  value={formatDate(selectedApplication?.appliedDate)}
                />

                <PreviewRow
                  label="Source"
                  value={
                    selectedApplication?.source ||
                    selectedApplication?.appliedFrom ||
                    "NA"
                  }
                />
              </div>
            </div>
          </div>

          {/* Preview + Result */}
          <div className="space-y-6 xl:col-span-2">
            {/* Job Description Preview */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon={FileText}
                title="Job Description Preview"
                subtitle="This text is used for skill matching."
              />

              {selectedApplication?.jobDescription ? (
                <div className="mt-6 max-h-[300px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                  {selectedApplication.jobDescription}
                </div>
              ) : (
                <EmptyBox
                  title="No job description available"
                  description="Select an application with job description. If missing, edit the application and add job description for better analysis."
                />
              )}
            </div>

            {/* Current Result */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon={BarChart3}
                title="Analysis Result"
                subtitle="Latest result from your current analysis."
              />

              {analysisResult ? (
                <AnalysisResultBlock
                  analysis={analysisResult}
                  getScoreClass={getScoreClass}
                  getScoreBgClass={getScoreBgClass}
                  onView={() => setSelectedAnalysis(analysisResult)}
                />
              ) : (
                <EmptyBox
                  title="No analysis run yet"
                  description="Choose a resume and application, then click Analyze Resume."
                />
              )}
            </div>
          </div>
        </section>

        {/* Latest Analyses */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <SectionHeader
              icon={Target}
              title="Latest Analyses"
              subtitle="Recently generated resume-job match reports."
            />
          </div>

          {latestAnalyses.length === 0 ? (
            <EmptyBox
              title="No previous analyses"
              description="Your analyzed applications will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {latestAnalyses.map((analysis, index) => (
                <button
                  key={analysis.id || index}
                  type="button"
                  onClick={() => setSelectedAnalysis(analysis)}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-slate-950">
                        {analysis.application?.companyName ||
                          selectedApplication?.companyName ||
                          "Application"}
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {analysis.application?.jobRole ||
                          selectedApplication?.jobRole ||
                          "Role not available"}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(analysis.createdAt)}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 ${getScoreBgClass(
                        analysis.score
                      )}`}
                    >
                      <p
                        className={`text-2xl font-bold ${getScoreClass(
                          analysis.score
                        )}`}
                      >
                        {analysis.score ?? "NA"}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(analysis.matchedSkills || []).slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                      >
                        {skill}
                      </span>
                    ))}

                    {(analysis.missingSkills || []).slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Full Analysis Modal */}
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
                    {selectedAnalysis.application?.companyName ||
                      selectedApplication?.companyName ||
                      "Application"}{" "}
                    -{" "}
                    {selectedAnalysis.application?.jobRole ||
                      selectedApplication?.jobRole ||
                      "Job Role"}
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
                  {selectedAnalysis.score ?? "NA"}%
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

const HeroMiniCard = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-2 truncate text-lg font-bold text-white">{value}</p>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
        <Icon size={20} />
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const PreviewRow = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
};

const EmptyBox = ({ title, description }) => {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        <AlertTriangle size={22} />
      </div>

      <h3 className="font-bold text-slate-950">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
};

const AnalysisResultBlock = ({
  analysis,
  getScoreClass,
  getScoreBgClass,
  onView,
}) => {
  return (
    <div className="mt-6 space-y-5">
      <div
        className={`rounded-3xl p-6 ${getScoreBgClass(analysis.score)}`}
      >
        <p className="text-sm text-slate-500">Match Score</p>

        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className={`text-6xl font-bold ${getScoreClass(analysis.score)}`}>
            {analysis.score ?? "NA"}%
          </p>

          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            View Full Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SkillBox
          title="Matched Skills"
          skills={analysis.matchedSkills || []}
          type="matched"
        />

        <SkillBox
          title="Missing Skills"
          skills={analysis.missingSkills || []}
          type="missing"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-950">Suggestions</h3>

        {(analysis.suggestions || []).length > 0 ? (
          <ul className="mt-4 space-y-3">
            {(analysis.suggestions || []).slice(0, 4).map((suggestion, index) => (
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

export default Analyze;
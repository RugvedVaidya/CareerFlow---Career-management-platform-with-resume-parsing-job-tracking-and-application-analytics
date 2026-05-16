import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Calendar,
  Target,
  Trash2,
} from "lucide-react";

import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const [roundForm, setRoundForm] = useState({
    roundName: "",
    roundDate: "",
    notes: "",
    result: "PENDING",
  });

  const [addingRound, setAddingRound] = useState(false);
  const [error, setError] = useState("");

  const resultOptions = ["PENDING", "PASSED", "FAILED"];

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await API.get(`/applications/${id}`);

      const appData = data.application || data.data || data;

      setApplication(appData);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load application");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRoundChange = (e) => {
    setRoundForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addRound = async (e) => {
    e.preventDefault();

    if (!roundForm.roundName.trim()) {
      setError("Round name is required");
      return;
    }

    try {
      setError("");
      setAddingRound(true);

      await API.post(`/interviews/${id}`, {
        ...roundForm,
        roundDate: roundForm.roundDate || null,
      });

      setRoundForm({
        roundName: "",
        roundDate: "",
        notes: "",
        result: "PENDING",
      });

      fetchApplication();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add round");
    } finally {
      setAddingRound(false);
    }
  };

  const updateRoundResult = async (roundId, result) => {
    try {
      setError("");

      await API.put(`/interviews/${roundId}`, { result });

      fetchApplication();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update round");
    }
  };

  const deleteRound = async (roundId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this interview round?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await API.delete(`/interviews/${roundId}`);

      fetchApplication();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete round");
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-slate-100">
        <Sidebar />

        <main className="flex-1">
          <Navbar />

          <div className="flex min-h-[70vh] items-center justify-center text-slate-600">
            Loading application...
          </div>
        </main>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex bg-slate-100">
        <Sidebar />

        <main className="flex-1">
          <Navbar />

          <div className="p-8">
            <button
              onClick={() => navigate("/applications")}
              className="mb-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Back to Applications
            </button>

            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error || "Application not found"}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const analyses = application.analyses || application.analysisResults || [];
  const interviewRounds = application.interviewRounds || [];
  const source = application.source || application.appliedFrom || "-";

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-8 space-y-6">
          <button
            onClick={() => navigate("/applications")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </button>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Application Header */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {application.companyName || "Company"}
                </h1>

                <p className="mt-1 text-slate-600">
                  {application.jobRole || "Role"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge text={application.status || "NA"} color="blue" />

                  <Badge text={`Applied From: ${source}`} color="slate" />

                  <Badge
                    text={`Resume: ${
                      application.resume?.fileName || "Not selected"
                    }`}
                    color="green"
                  />
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Match Score</p>

                <h2 className="text-4xl font-bold text-blue-600">
                  {application.matchScore !== null &&
                  application.matchScore !== undefined
                    ? `${application.matchScore}%`
                    : "NA"}
                </h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <InfoCard
                icon={Briefcase}
                label="Location"
                value={application.location || "-"}
              />

              <InfoCard
                icon={Calendar}
                label="Applied Date"
                value={
                  application.appliedDate
                    ? new Date(application.appliedDate).toLocaleDateString(
                        "en-IN"
                      )
                    : "-"
                }
              />

              <InfoCard
                icon={FileText}
                label="Resume Used"
                value={application.resume?.fileName || "Not selected"}
              />

              <InfoCard icon={Target} label="Analyses" value={analyses.length} />
            </div>
          </section>

          {/* Job Description */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              Job Description
            </h2>

            {application.jobDescription ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {application.jobDescription}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                No job description added.
              </p>
            )}
          </section>

          {/* Analysis History */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Analysis History
            </h2>

            {analyses.length === 0 ? (
              <p className="text-sm text-slate-500">No analysis yet.</p>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          Score: {analysis.score}%
                        </h3>

                        <p className="text-xs text-slate-500">
                          {analysis.createdAt
                            ? new Date(analysis.createdAt).toLocaleString(
                                "en-IN"
                              )
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <SkillList
                        title="Matched Skills"
                        skills={analysis.matchedSkills || []}
                        color="green"
                      />

                      <SkillList
                        title="Missing Skills"
                        skills={analysis.missingSkills || []}
                        color="orange"
                      />
                    </div>

                    <div className="mt-4">
                      <h4 className="mb-2 font-semibold text-slate-700">
                        Suggestions
                      </h4>

                      {(analysis.suggestions || []).length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No suggestions available.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {(analysis.suggestions || []).map(
                            (suggestion, index) => (
                              <li
                                key={index}
                                className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
                              >
                                {suggestion}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Interview Rounds */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Interview Rounds
            </h2>

            <form
              onSubmit={addRound}
              className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4"
            >
              <input
                name="roundName"
                value={roundForm.roundName}
                onChange={handleRoundChange}
                placeholder="Round name"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="date"
                name="roundDate"
                value={roundForm.roundDate}
                onChange={handleRoundChange}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                name="result"
                value={roundForm.result}
                onChange={handleRoundChange}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {resultOptions.map((result) => (
                  <option key={result} value={result}>
                    {result}
                  </option>
                ))}
              </select>

              <button
                disabled={addingRound}
                className="rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {addingRound ? "Adding..." : "Add Round"}
              </button>

              <textarea
                name="notes"
                value={roundForm.notes}
                onChange={handleRoundChange}
                placeholder="Notes"
                rows="3"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 md:col-span-4"
              />
            </form>

            {interviewRounds.length === 0 ? (
              <p className="text-sm text-slate-500">
                No interview rounds added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {interviewRounds.map((round) => (
                  <div
                    key={round.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {round.roundName}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {round.roundDate
                          ? new Date(round.roundDate).toLocaleDateString(
                              "en-IN"
                            )
                          : "No date"}
                      </p>

                      {round.notes && (
                        <p className="mt-2 text-sm text-slate-700">
                          {round.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={round.result}
                        onChange={(e) =>
                          updateRoundResult(round.id, e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                      >
                        {resultOptions.map((result) => (
                          <option key={result} value={result}>
                            {result}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => deleteRound(round.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <Icon size={20} className="mb-2 text-blue-600" />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
};

const Badge = ({ text, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[color] || styles.slate
      }`}
    >
      {text}
    </span>
  );
};

const SkillList = ({ title, skills, color }) => {
  const styles = {
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div>
      <h4 className="mb-2 font-semibold text-slate-700">{title}</h4>

      {(skills || []).length === 0 ? (
        <p className="text-sm text-slate-500">No skills found.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(skills || []).map((skill) => (
            <span
              key={skill}
              className={`rounded-full px-3 py-1 text-xs ${
                styles[color] || styles.green
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
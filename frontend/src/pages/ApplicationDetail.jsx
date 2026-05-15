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
      const { data } = await API.get(`/applications/${id}`);
      setApplication(data.application);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load application");
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
        <main className="flex-1 flex items-center justify-center">
          Loading application...
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
          <div className="p-6 text-red-600">{error || "Application not found"}</div>
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
          <button
            onClick={() => navigate("/applications")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </button>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {application.companyName}
                </h1>
                <p className="text-slate-600 mt-1">{application.jobRole}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge text={application.status} color="blue" />
                  <Badge
                    text={`Applied From: ${application.appliedFrom || "-"}`}
                    color="slate"
                  />
                  <Badge
                    text={`Resume: ${
                      application.resume?.fileName || "Not selected"
                    }`}
                    color="green"
                  />
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">Match Score</p>
                <h2 className="text-4xl font-bold text-blue-600">
                  {application.matchScore !== null &&
                  application.matchScore !== undefined
                    ? `${application.matchScore}%`
                    : "NA"}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
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
                    ? new Date(application.appliedDate).toLocaleDateString()
                    : "-"
                }
              />
              <InfoCard
                icon={FileText}
                label="Resume Used"
                value={application.resume?.fileName || "Not selected"}
              />
              <InfoCard
                icon={Target}
                label="Analyses"
                value={application.analyses?.length || 0}
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Job Description
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-6">
              {application.jobDescription}
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Analysis History
            </h2>

            {application.analyses?.length === 0 ? (
              <p className="text-slate-500 text-sm">No analysis yet.</p>
            ) : (
              <div className="space-y-4">
                {application.analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          Score: {analysis.score}%
                        </h3>
                        <p className="text-xs text-slate-500">
                          {new Date(analysis.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <SkillList
                        title="Matched Skills"
                        skills={analysis.matchedSkills}
                        color="green"
                      />
                      <SkillList
                        title="Missing Skills"
                        skills={analysis.missingSkills}
                        color="orange"
                      />
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-slate-700 mb-2">
                        Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="text-sm bg-slate-50 rounded-xl p-3 text-slate-700"
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Interview Rounds
            </h2>

            <form
              onSubmit={addRound}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            >
              <input
                name="roundName"
                value={roundForm.roundName}
                onChange={handleRoundChange}
                placeholder="Round name"
                className="px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="date"
                name="roundDate"
                value={roundForm.roundDate}
                onChange={handleRoundChange}
                className="px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                name="result"
                value={roundForm.result}
                onChange={handleRoundChange}
                className="px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {resultOptions.map((result) => (
                  <option key={result} value={result}>
                    {result}
                  </option>
                ))}
              </select>

              <button
                disabled={addingRound}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-60"
              >
                {addingRound ? "Adding..." : "Add Round"}
              </button>

              <textarea
                name="notes"
                value={roundForm.notes}
                onChange={handleRoundChange}
                placeholder="Notes"
                rows="3"
                className="md:col-span-4 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            {application.interviewRounds?.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No interview rounds added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {application.interviewRounds.map((round) => (
                  <div
                    key={round.id}
                    className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {round.roundName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {round.roundDate
                          ? new Date(round.roundDate).toLocaleDateString()
                          : "No date"}
                      </p>
                      {round.notes && (
                        <p className="text-sm text-slate-700 mt-2">
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
                        className="text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
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
      <Icon size={20} className="text-blue-600 mb-2" />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800 mt-1">{value}</p>
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
    <span className={`text-xs px-3 py-1 rounded-full ${styles[color]}`}>
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
      <h4 className="font-semibold text-slate-700 mb-2">{title}</h4>
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

export default ApplicationDetail;
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Globe2,
  Loader2,
  Save,
  Sparkles,
  Target,
} from "lucide-react";

import api from "../api/axios";
import AppLayout from "../components/AppLayout";

const NewApplication = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    jobRole: "",
    status: "APPLIED",
    source: "",
    appliedDate: new Date().toISOString().slice(0, 10),
    resumeId: "",
    matchScore: "",
    jobDescription: "",
  });

  const statusOptions = [
    "SAVED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
  ];

  const sourceOptions = [
    "LinkedIn",
    "Naukri",
    "Indeed",
    "Glassdoor",
    "Instahyre",
    "Wellfound",
    "Hirect",
    "Fiverr",
    "Upwork",
    "Company Website",
    "Referral",
    "Other",
  ];

  const fetchResumes = async () => {
    try {
      setLoadingResumes(true);

      const res = await api.get("/resumes");

      const data =
        res.data.resumes ||
        res.data.data ||
        res.data.files ||
        res.data ||
        [];

      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load resumes");
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const selectedResume = useMemo(() => {
    return resumes.find((resume) => String(resume.id) === String(formData.resumeId));
  }, [resumes, formData.resumeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");
    setSuccess("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      setError("Company name is required");
      return false;
    }

    if (!formData.jobRole.trim()) {
      setError("Job role is required");
      return false;
    }

    if (!formData.status) {
      setError("Application status is required");
      return false;
    }

    if (!formData.appliedDate) {
      setError("Applied date is required");
      return false;
    }

    if (
      formData.matchScore !== "" &&
      (Number(formData.matchScore) < 0 || Number(formData.matchScore) > 100)
    ) {
      setError("Match score must be between 0 and 100");
      return false;
    }

    return true;
  };

  const buildPayload = () => {
    const payload = {
      companyName: formData.companyName.trim(),
      jobRole: formData.jobRole.trim(),
      status: formData.status,
      source: formData.source.trim() || null,
      appliedDate: formData.appliedDate,
      jobDescription: formData.jobDescription.trim() || null,
    };

    if (formData.resumeId) {
      payload.resumeId = Number(formData.resumeId);
    }

    if (formData.matchScore !== "") {
      payload.matchScore = Number(formData.matchScore);
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      await api.post("/applications", payload);

      setSuccess("Application created successfully");

      setTimeout(() => {
        navigate("/applications");
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

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
      case "SAVED":
        return "bg-slate-100 text-slate-700 ring-slate-200";
      case "APPLIED":
        return "bg-blue-50 text-blue-700 ring-blue-100";
      case "INTERVIEW":
        return "bg-purple-50 text-purple-700 ring-purple-100";
      case "OFFER":
        return "bg-green-50 text-green-700 ring-green-100";
      case "REJECTED":
        return "bg-red-50 text-red-700 ring-red-100";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-200";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Link
                to="/applications"
                className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
              >
                <ArrowLeft size={17} />
                Back to Applications
              </Link>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/10">
                <Sparkles size={14} />
                Add new opportunity
              </div>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Create new application
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Add company, role, source platform, resume used, job
                description, and current status to keep your job search
                organized.
              </p>
            </div>

            <div className="grid min-w-[260px] grid-cols-2 gap-3">
              <HeroMiniCard label="Available Resumes" value={resumes.length} />
              <HeroMiniCard label="Default Status" value={formData.status} />
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

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 xl:col-span-2"
          >
            {/* Basic Info */}
            <FormCard
              icon={Briefcase}
              title="Application Details"
              subtitle="Basic company and role information."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. TCS"
                  icon={Building2}
                  required
                />

                <InputField
                  label="Job Role"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer"
                  icon={Briefcase}
                  required
                />

                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  icon={Target}
                  options={statusOptions}
                  required
                />

                <InputField
                  label="Applied Date"
                  name="appliedDate"
                  type="date"
                  value={formData.appliedDate}
                  onChange={handleChange}
                  icon={Calendar}
                  required
                />
              </div>
            </FormCard>

            {/* Source + Resume */}
            <FormCard
              icon={Globe2}
              title="Source and Resume"
              subtitle="Track where you applied and which resume was used."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Applied From / Source
                  </label>

                  <div className="relative">
                    <Globe2
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      list="source-options"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      placeholder="e.g. LinkedIn, Instahyre, Glassdoor"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <datalist id="source-options">
                      {sourceOptions.map((source) => (
                        <option key={source} value={source} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Resume Used
                  </label>

                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      name="resumeId"
                      value={formData.resumeId}
                      onChange={handleChange}
                      disabled={loadingResumes}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="">
                        {loadingResumes ? "Loading resumes..." : "Select resume"}
                      </option>

                      {resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.fileName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {resumes.length === 0 && !loadingResumes && (
                    <p className="mt-2 text-xs text-slate-500">
                      No resumes found. Upload a resume from the Resumes page.
                    </p>
                  )}
                </div>

                <InputField
                  label="Match Score Optional"
                  name="matchScore"
                  type="number"
                  value={formData.matchScore}
                  onChange={handleChange}
                  placeholder="0 - 100"
                  icon={Target}
                  min="0"
                  max="100"
                />
              </div>
            </FormCard>

            {/* Job Description */}
            <FormCard
              icon={ClipboardList}
              title="Job Description"
              subtitle="Paste job description for better AI resume analysis."
            >
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows={10}
                placeholder="Paste job description here..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </FormCard>

            {/* Actions */}
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <Link
                to="/applications"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create Application
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview */}
          <aside className="space-y-6 xl:col-span-1">
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <FileText size={20} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Live Preview
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Preview how this application will appear.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold text-slate-950">
                      {formData.companyName || "Company Name"}
                    </h3>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-600">
                      {formData.jobRole || "Job Role"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                      formData.status
                    )}`}
                  >
                    {formData.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <PreviewRow
                    icon={Calendar}
                    label="Applied Date"
                    value={formatDate(formData.appliedDate)}
                  />

                  <PreviewRow
                    icon={Globe2}
                    label="Source"
                    value={formData.source || "NA"}
                  />

                  <PreviewRow
                    icon={FileText}
                    label="Resume"
                    value={selectedResume?.fileName || "No resume selected"}
                  />

                  <PreviewRow
                    icon={Target}
                    label="Match Score"
                    value={
                      formData.matchScore !== ""
                        ? `${formData.matchScore}%`
                        : "Not analyzed"
                    }
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Job Description
                  </p>

                  <p className="mt-2 line-clamp-6 text-sm leading-6 text-slate-600">
                    {formData.jobDescription ||
                      "Job description preview will appear here."}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-sm leading-6 text-amber-800">
                    Add job description if you want accurate AI analysis later.
                    Without it, match score may remain not analyzed.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
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

const FormCard = ({ icon: Icon, title, subtitle, children }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
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

      {children}
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  required,
  min,
  max,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  options,
  required,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const PreviewRow = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-3">
      <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
};

export default NewApplication;
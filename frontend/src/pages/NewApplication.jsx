import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Globe2,
  Loader2,
  MapPin,
  Save,
  Sparkles,
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
    location: "",
    source: "",
    status: "APPLIED",
    appliedDate: "",
    jobDescription: "",
    resumeId: "",
  });

  const statusOptions = [
    "SAVED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
  ];

  const sourceSuggestions = [
    "LinkedIn",
    "Naukri",
    "Indeed",
    "Glassdoor",
    "Instahyre",
    "Wellfound",
    "Hirist",
    "Fiverr",
    "Upwork",
    "Company Website",
    "Referral",
    "Email",
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
      console.log(err);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    fetchResumes();

    const today = new Date().toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      appliedDate: today,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      return "Company name is required";
    }

    if (!formData.jobRole.trim()) {
      return "Job role is required";
    }

    if (!formData.status) {
      return "Status is required";
    }

    if (!formData.appliedDate) {
      return "Applied date is required";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        companyName: formData.companyName.trim(),
        jobRole: formData.jobRole.trim(),
        location: formData.location.trim() || null,
        source: formData.source.trim() || null,
        status: formData.status,
        appliedDate: formData.appliedDate,
        jobDescription: formData.jobDescription.trim() || null,
        resumeId: formData.resumeId ? Number(formData.resumeId) : null,
      };

      const res = await api.post("/applications", payload);

      setSuccess("Application created successfully");

      const createdApplication =
        res.data.application || res.data.data || res.data;

      setTimeout(() => {
        if (createdApplication?.id) {
          navigate(`/applications/${createdApplication.id}`);
        } else {
          navigate("/applications");
        }
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedResume = resumes.find(
    (resume) => String(resume.id) === String(formData.resumeId)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back */}
        <div>
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </Link>
        </div>

        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/10">
                <Sparkles size={14} />
                Add new opportunity
              </div>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Save a job application
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Add company details, source, resume used, job description, and
                current status so CareerFlow can track your progress properly.
              </p>
            </div>

            <div className="grid min-w-[260px] grid-cols-2 gap-3">
              <MiniHeroCard label="Status" value={formData.status} />
              <MiniHeroCard
                label="Resume"
                value={selectedResume ? "Selected" : "Optional"}
              />
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

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left Form */}
          <section className="space-y-6 xl:col-span-2">
            {/* Basic Info */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon={Briefcase}
                title="Job Details"
                subtitle="Basic information about the company and role."
              />

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="TCS"
                  icon={Building2}
                  required
                />

                <InputField
                  label="Job Role"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  placeholder="Full Stack Developer"
                  icon={Briefcase}
                  required
                />

                <InputField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Pune / Remote / Bangalore"
                  icon={MapPin}
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
            </div>

            {/* Source + Resume */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon={Globe2}
                title="Application Source & Resume"
                subtitle="Track where you applied and which resume you used."
              />

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
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
                      placeholder="LinkedIn, Glassdoor, Instahyre..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <datalist id="source-options">
                      {sourceSuggestions.map((source) => (
                        <option key={source} value={source} />
                      ))}
                    </datalist>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Example: LinkedIn, Naukri, Glassdoor, Fiverr, referral, or
                    company website.
                  </p>
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
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">
                        {loadingResumes
                          ? "Loading resumes..."
                          : "No resume selected"}
                      </option>

                      {resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.fileName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Select the resume you used while applying for this role.
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon={FileText}
                title="Job Description"
                subtitle="Paste the job description here. It helps during resume analysis."
              />

              <div className="mt-6">
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows="12"
                  placeholder="Paste job description here..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </section>

          {/* Right Summary */}
          <aside className="space-y-6">
            <div className="sticky top-28 space-y-6">
              {/* Status */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader
                  icon={CheckCircle2}
                  title="Application Status"
                  subtitle="Choose the current stage."
                />

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Current selected status
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-950">
                    {formData.status}
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader
                  icon={Sparkles}
                  title="Preview"
                  subtitle="Quick summary before saving."
                />

                <div className="mt-6 space-y-4">
                  <PreviewRow
                    label="Company"
                    value={formData.companyName || "Not added"}
                  />

                  <PreviewRow
                    label="Role"
                    value={formData.jobRole || "Not added"}
                  />

                  <PreviewRow
                    label="Source"
                    value={formData.source || "Not added"}
                  />

                  <PreviewRow
                    label="Resume"
                    value={selectedResume?.fileName || "Not selected"}
                  />

                  <PreviewRow
                    label="Applied Date"
                    value={formData.appliedDate || "Not selected"}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Application
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/applications")}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </AppLayout>
  );
};

const MiniHeroCard = ({ label, value }) => {
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
        <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>
      </div>
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
  required = false,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
            Icon ? "px-12" : "px-4"
          }`}
        />
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

export default NewApplication;
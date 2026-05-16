import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import api from "../api/axios";
import AppLayout from "../components/AppLayout";

const Resumes = () => {
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [previewResume, setPreviewResume] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const filteredResumes = useMemo(() => {
    if (!searchTerm.trim()) return resumes;

    const q = searchTerm.toLowerCase();

    return resumes.filter((resume) => {
      const fileName = resume.fileName?.toLowerCase() || "";
      const preview = resume.extractedTextPreview?.toLowerCase() || "";
      const text = resume.extractedText?.toLowerCase() || "";

      return fileName.includes(q) || preview.includes(q) || text.includes(q);
    });
  }, [resumes, searchTerm]);

  const totalResumes = resumes.length;

  const latestResume = useMemo(() => {
    if (resumes.length === 0) return null;

    return [...resumes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
  }, [resumes]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "NA";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    const allowedExtensions = [".pdf", ".doc", ".docx"];

    const fileName = file.name.toLowerCase();

    const isValidType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      setError("Only PDF, DOC, or DOCX files are allowed");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSuccess("");
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume file first");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("resume", selectedFile);

      const res = await api.post("/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedResume =
        res.data.resume || res.data.data || res.data.file || res.data;

      setResumes((prev) => [uploadedResume, ...prev]);

      setSuccess("Resume uploaded successfully");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(resumeId);

      await api.delete(`/resumes/${resumeId}`);

      setResumes((prev) => prev.filter((resume) => resume.id !== resumeId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  const getPreviewText = (resume) => {
    return (
      resume.extractedText ||
      resume.extractedTextPreview ||
      "No extracted text preview available."
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-600">
                Loading resumes...
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
                Resume vault
              </div>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Manage your resumes
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Upload, store, preview, and connect resumes with applications
                for better tracking and analysis.
              </p>
            </div>

            <div className="grid min-w-[260px] grid-cols-2 gap-3">
              <HeroMiniCard label="Total Resumes" value={totalResumes} />
              <HeroMiniCard
                label="Latest Upload"
                value={latestResume ? formatDate(latestResume.createdAt) : "NA"}
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

        {/* Upload + Search */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Upload Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <UploadCloud size={22} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Upload Resume
                </h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Upload PDF, DOC, or DOCX resume files.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
                <FileText size={26} />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : "Choose a resume file"}
              </p>

              {selectedFile && (
                <p className="mt-1 text-xs text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Plus size={17} />
                Select File
              </button>
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  Upload Resume
                </>
              )}
            </button>
          </div>

          {/* Search + Info */}
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Resume Library
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Search by file name or extracted resume text.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchResumes}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCcw size={17} />
                  Refresh
                </button>
              </div>

              <div className="relative mt-5">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                label="Uploaded"
                value={totalResumes}
                icon={FileText}
              />

              <StatCard
                label="Search Results"
                value={filteredResumes.length}
                icon={Search}
              />

              <StatCard
                label="Latest"
                value={latestResume ? formatDate(latestResume.createdAt) : "NA"}
                icon={ClockIcon}
              />
            </div>
          </div>
        </section>

        {/* Resume List */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Uploaded Resumes
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredResumes.length} of {resumes.length} resumes
              </p>
            </div>
          </div>

          {filteredResumes.length === 0 ? (
            <EmptyState
              hasResumes={resumes.length > 0}
              onClear={() => setSearchTerm("")}
              onUpload={() => fileInputRef.current?.click()}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                      <FileText size={26} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-slate-950">
                        {resume.fileName || "Untitled Resume"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Uploaded on {formatDate(resume.createdAt)}
                      </p>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {resume.extractedTextPreview ||
                          resume.extractedText ||
                          "No extracted text preview available."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewResume(resume)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Eye size={17} />
                      Preview Text
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === resume.id}
                      onClick={() => handleDelete(resume.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {deletingId === resume.id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-6 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Resume Preview
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {previewResume.fileName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Uploaded on {formatDate(previewResume.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewResume(null)}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="max-h-[65vh] overflow-y-auto whitespace-pre-wrap rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                {getPreviewText(previewResume)}
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

const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ hasResumes, onClear, onUpload }) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
        <FileText size={26} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {hasResumes ? "No matching resumes" : "No resumes uploaded yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasResumes
          ? "Try clearing your search to see more resumes."
          : "Upload your first resume to start tracking and analyzing job applications."}
      </p>

      <div className="mt-6">
        {hasResumes ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Search
          </button>
        ) : (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Upload Resume
          </button>
        )}
      </div>
    </div>
  );
};

const ClockIcon = (props) => {
  return <RefreshCcw {...props} />;
};

export default Resumes;
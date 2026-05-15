import { useEffect, useState } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchResumes = async () => {
    try {
      const { data } = await API.get("/resumes");
      setResumes(data.resumes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage("Please select a PDF file.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      setUploading(true);
      setMessage("");

      await API.post("/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFile(null);
      document.getElementById("resume-file").value = "";

      setMessage("Resume uploaded successfully.");
      fetchResumes();
    } catch (error) {
      setMessage(error.response?.data?.message || "Resume upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const deleteResume = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((resume) => resume.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete resume");
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resumes</h1>
            <p className="text-slate-500 text-sm">
              Upload PDF resumes and let CareerFlow extract text for analysis.
            </p>
          </div>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Upload Resume
            </h2>

            {message && (
              <div className="mb-4 bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded-xl">
                {message}
              </div>
            )}

            <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4">
              <input
                id="resume-file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white"
              />

              <button
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-60"
              >
                <Upload size={18} />
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            {selectedFile && (
              <p className="mt-3 text-sm text-slate-500">
                Selected: {selectedFile.name}
              </p>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Uploaded Resumes
              </h2>
            </div>

            {loading ? (
              <div className="p-6 text-slate-500">Loading resumes...</div>
            ) : resumes.length === 0 ? (
              <div className="p-6 text-slate-500">
                No resumes uploaded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="p-5 flex items-center justify-between hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText size={22} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {resume.fileName}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Uploaded on{" "}
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteResume(resume.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
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

export default Resumes;
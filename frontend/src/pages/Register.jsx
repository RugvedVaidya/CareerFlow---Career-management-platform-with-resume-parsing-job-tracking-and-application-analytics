import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      await register(formData.name, formData.email, formData.password);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-[-140px] right-[-140px] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <div className="rounded-xl bg-blue-600 p-2">
                <BriefcaseBusiness size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold">CareerFlow</h1>
                <p className="text-xs text-slate-300">
                  AI Job Application Tracker
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/10">
              <Sparkles size={14} />
              Build your job search command center
            </div>

            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Organize every application from saved to offer.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Create your CareerFlow account and manage resumes, applications,
              AI analysis, reminders, and interview progress from one dashboard.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4">
              <FeatureCard text="Track every job application and source platform." />
              <FeatureCard text="Connect resumes with applications." />
              <FeatureCard text="Analyze resume-job match using skills." />
              <FeatureCard text="Set reminders for follow-ups and interviews." />
            </div>
          </div>

          <div className="relative z-10 text-sm text-slate-400">
            Start organized. Stay consistent.
          </div>
        </section>

        {/* Right Form */}
        <section className="flex items-center justify-center p-5 md:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="rounded-2xl bg-blue-600 p-3 text-white">
                <BriefcaseBusiness size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-950">
                  CareerFlow
                </h1>
                <p className="text-sm text-slate-500">
                  AI Job Application Tracker
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <ShieldCheck size={14} />
                  Create account
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                  Join CareerFlow
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Start tracking your applications, resumes, reminders, and AI
                  analysis.
                </p>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Password should be at least 6 characters.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-700 hover:text-blue-800"
                >
                  Login
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              CareerFlow keeps your job search clean and organized.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

const FeatureCard = ({ text }) => {
  return (
    <div className="flex items-start gap-3 rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
      <div className="mt-0.5 rounded-full bg-green-500/20 p-1 text-green-300">
        <CheckCircle2 size={16} />
      </div>

      <p className="text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
};

export default Register;
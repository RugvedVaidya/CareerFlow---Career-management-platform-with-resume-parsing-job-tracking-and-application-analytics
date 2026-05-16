import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Plus, Search } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const pageInfo = useMemo(() => {
    const path = location.pathname;

    if (path.startsWith("/applications/new")) {
      return {
        title: "Add Application",
        subtitle: "Save a job opportunity and link the resume you used.",
      };
    }

    if (path.startsWith("/applications/")) {
      return {
        title: "Application Details",
        subtitle: "View job details, analysis history, and interview rounds.",
      };
    }

    if (path.startsWith("/applications")) {
      return {
        title: "Applications",
        subtitle: "Track every company, role, status, source, and resume.",
      };
    }

    if (path.startsWith("/resumes")) {
      return {
        title: "Resumes",
        subtitle: "Upload resumes and extract text for analysis.",
      };
    }

    if (path.startsWith("/analyze")) {
      return {
        title: "Analyzer",
        subtitle: "Compare your resume with job descriptions.",
      };
    }

    if (path.startsWith("/reminders")) {
      return {
        title: "Reminders",
        subtitle: "Manage follow-ups, interviews, deadlines, and tasks.",
      };
    }

    return {
      title: "Dashboard",
      subtitle: "Overview of applications, resumes, analyses, and reminders.",
    };
  }, [location.pathname]);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "R";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex min-h-[88px] items-center justify-between gap-5 px-6 py-4 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {pageInfo.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{pageInfo.subtitle}</p>
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          <div className="relative w-full max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search CareerFlow..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/applications/new")}
            className="hidden items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 md:flex"
          >
            <Plus size={18} />
            Add Application
          </button>

          <button
            onClick={() => navigate("/reminders")}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
          </button>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
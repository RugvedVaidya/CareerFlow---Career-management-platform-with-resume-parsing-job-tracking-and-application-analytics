import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  SearchCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Applications",
      path: "/applications",
      icon: Briefcase,
    },
    {
      name: "Resumes",
      path: "/resumes",
      icon: FileText,
    },
    {
      name: "Analyzer",
      path: "/analyze",
      icon: SearchCheck,
    },
  ];

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-slate-950 text-white flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold">CareerFlow</h1>
        <p className="text-sm text-slate-400 mt-1">Job search command center</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="m-4 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
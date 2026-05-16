import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "📊",
    },
    {
      name: "Applications",
      path: "/applications",
      icon: "💼",
    },
    {
      name: "Add Application",
      path: "/applications/new",
      icon: "➕",
    },
    {
      name: "Resumes",
      path: "/resumes",
      icon: "📄",
    },
    {
      name: "Analyze Resume",
      path: "/analyze",
      icon: "🧠",
    },
    {
      name: "Reminders",
      path: "/reminders",
      icon: "⏰",
    },
  ];

  return (
    <aside className="hidden min-h-[calc(100vh-64px)] w-64 border-r bg-white px-4 py-6 shadow-sm md:block">
      <div className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Menu
        </h2>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 rounded-xl border bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-800">CareerFlow AI</h3>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          Track applications, analyze resumes, and never miss follow-ups.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
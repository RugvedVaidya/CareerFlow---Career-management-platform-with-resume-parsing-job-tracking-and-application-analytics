import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Welcome back, {user?.name}
        </h2>
        <p className="text-sm text-slate-500">
          Track applications, resumes, and match scores.
        </p>
      </div>

      <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
        {user?.name?.charAt(0)?.toUpperCase()}
      </div>
    </header>
  );
};

export default Navbar;
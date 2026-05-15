import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import NewApplication from "./pages/NewApplication";
import Resumes from "./pages/Resumes";
import ProtectedRoute from "./components/ProtectedRoute";

const Placeholder = ({ title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-slate-700">
      {title} page coming next
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications/new"
        element={
          <ProtectedRoute>
            <NewApplication />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <Resumes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analyze"
        element={
          <ProtectedRoute>
            <Placeholder title="Analyzer" />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
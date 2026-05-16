import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  CheckCircle,
  Clock,
  Edit,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [editingReminder, setEditingReminder] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    dueDate: "",
    applicationId: "",
  });

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/reminders");

      const data =
        res.data.reminders ||
        res.data.data ||
        res.data.allReminders ||
        [];

      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications");

      const data =
        res.data.applications ||
        res.data.data ||
        res.data.jobs ||
        [];

      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchApplications();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      dueDate: "",
      applicationId: "",
    });
    setEditingReminder(null);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "NA";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (reminder) => {
    if (reminder.isCompleted) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(reminder.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const isUpcoming = (reminder) => {
    if (reminder.isCompleted) return false;
    return !isOverdue(reminder);
  };

  const counts = useMemo(() => {
    return {
      upcoming: reminders.filter((r) => isUpcoming(r)).length,
      overdue: reminders.filter((r) => isOverdue(r)).length,
      completed: reminders.filter((r) => r.isCompleted).length,
    };
  }, [reminders]);

  const filteredReminders = useMemo(() => {
    let list = [...reminders];

    if (activeTab === "upcoming") {
      list = list.filter((r) => isUpcoming(r));
    }

    if (activeTab === "overdue") {
      list = list.filter((r) => isOverdue(r));
    }

    if (activeTab === "completed") {
      list = list.filter((r) => r.isCompleted);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter((r) => {
        const title = r.title?.toLowerCase() || "";
        const msg = r.message?.toLowerCase() || "";
        const company = r.application?.companyName?.toLowerCase() || "";
        const role = r.application?.jobRole?.toLowerCase() || "";

        return (
          title.includes(q) ||
          msg.includes(q) ||
          company.includes(q) ||
          role.includes(q)
        );
      });
    }

    return list;
  }, [reminders, activeTab, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      if (!formData.title.trim()) {
        setError("Title is required");
        return;
      }

      if (!formData.dueDate) {
        setError("Due date is required");
        return;
      }

      const payload = {
        title: formData.title,
        message: formData.message || null,
        dueDate: formData.dueDate,
        applicationId: formData.applicationId
          ? Number(formData.applicationId)
          : null,
      };

      if (editingReminder) {
        await api.put(`/reminders/${editingReminder.id}`, payload);
        setMessage("Reminder updated successfully");
      } else {
        await api.post("/reminders", payload);
        setMessage("Reminder created successfully");
      }

      resetForm();
      fetchReminders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save reminder");
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);

    setFormData({
      title: reminder.title || "",
      message: reminder.message || "",
      dueDate: reminder.dueDate
        ? new Date(reminder.dueDate).toISOString().split("T")[0]
        : "",
      applicationId: reminder.applicationId || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this reminder?");
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/reminders/${id}`);

      setMessage("Reminder deleted successfully");
      fetchReminders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete reminder");
    }
  };

  const handleCompleteToggle = async (reminder) => {
    try {
      setError("");
      setMessage("");

      if (reminder.isCompleted) {
        await api.patch(`/reminders/${reminder.id}/pending`);
        setMessage("Reminder marked as pending");
      } else {
        await api.patch(`/reminders/${reminder.id}/complete`);
        setMessage("Reminder marked as completed");
      }

      fetchReminders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update reminder");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-white px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reminders</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track follow-ups, interviews, deadlines, and application tasks.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            R
          </div>
        </div>

        <div className="space-y-6 p-8">
          {/* Message */}
          {message && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Upcoming</p>
                  <h2 className="mt-4 text-3xl font-bold text-blue-600">
                    {counts.upcoming}
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <CalendarClock size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Overdue</p>
                  <h2 className="mt-4 text-3xl font-bold text-red-600">
                    {counts.overdue}
                  </h2>
                </div>

                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                  <Clock size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Completed</p>
                  <h2 className="mt-4 text-3xl font-bold text-green-600">
                    {counts.completed}
                  </h2>
                </div>

                <div className="rounded-xl bg-green-50 p-3 text-green-600">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingReminder ? "Edit Reminder" : "Create Reminder"}
                </h2>
                <p className="text-sm text-slate-500">
                  Add a reminder for follow-ups, interviews, or deadlines.
                </p>
              </div>

              {editingReminder && (
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <X size={16} />
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleCreateOrUpdate} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Follow up with recruiter"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Message / Notes
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Add reminder details..."
                  rows="3"
                  className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Link Application
                  </label>
                  <select
                    name="applicationId"
                    value={formData.applicationId}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">No application</option>

                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.companyName} - {app.jobRole}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingReminder ? "Update Reminder" : "Create Reminder"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {["all", "upcoming", "overdue", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                      activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reminders..."
                  className="w-full rounded-xl border px-10 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading reminders...</p>
            ) : filteredReminders.length > 0 ? (
              <div className="space-y-3">
                {filteredReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`rounded-xl border p-5 ${
                      reminder.isCompleted
                        ? "bg-green-50"
                        : isOverdue(reminder)
                        ? "bg-red-50"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-3">
                        <div
                          className={`h-fit rounded-xl p-3 ${
                            reminder.isCompleted
                              ? "bg-green-100 text-green-700"
                              : isOverdue(reminder)
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          <Bell size={20} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {reminder.title}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                reminder.isCompleted
                                  ? "bg-green-100 text-green-700"
                                  : isOverdue(reminder)
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {reminder.isCompleted
                                ? "completed"
                                : isOverdue(reminder)
                                ? "overdue"
                                : "upcoming"}
                            </span>
                          </div>

                          {reminder.message && (
                            <p className="mt-2 text-sm text-slate-600">
                              {reminder.message}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-slate-500">
                            Due: {formatDate(reminder.dueDate)}
                          </p>

                          {reminder.application && (
                            <p className="mt-1 text-sm text-slate-500">
                              Application:{" "}
                              <span className="font-medium text-slate-700">
                                {reminder.application.companyName} -{" "}
                                {reminder.application.jobRole}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleCompleteToggle(reminder)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                            reminder.isCompleted
                              ? "bg-slate-600 hover:bg-slate-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {reminder.isCompleted ? "Mark Pending" : "Complete"}
                        </button>

                        <button
                          onClick={() => handleEdit(reminder)}
                          className="flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Edit size={15} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm text-slate-500">No reminders found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reminders;
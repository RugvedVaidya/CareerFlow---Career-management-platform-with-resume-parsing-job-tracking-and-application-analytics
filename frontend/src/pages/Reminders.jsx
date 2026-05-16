import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api from "../api/axios";
import AppLayout from "../components/AppLayout";

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);

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
        res.data.items ||
        res.data ||
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
        res.data ||
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

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isOverdue = (reminder) => {
    if (reminder.isCompleted) return false;
    if (!reminder.dueDate) return false;

    const due = new Date(reminder.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < todayStart;
  };

  const isUpcoming = (reminder) => {
    if (reminder.isCompleted) return false;
    if (!reminder.dueDate) return false;

    const due = new Date(reminder.dueDate);
    due.setHours(0, 0, 0, 0);

    return due >= todayStart;
  };

  const filteredReminders = useMemo(() => {
    let result = [...reminders];

    if (filter === "UPCOMING") {
      result = result.filter((r) => isUpcoming(r));
    }

    if (filter === "OVERDUE") {
      result = result.filter((r) => isOverdue(r));
    }

    if (filter === "COMPLETED") {
      result = result.filter((r) => r.isCompleted);
    }

    if (filter === "PENDING") {
      result = result.filter((r) => !r.isCompleted);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();

      result = result.filter((r) => {
        const title = r.title?.toLowerCase() || "";
        const message = r.message?.toLowerCase() || "";
        const company = r.application?.companyName?.toLowerCase() || "";
        const role = r.application?.jobRole?.toLowerCase() || "";

        return (
          title.includes(q) ||
          message.includes(q) ||
          company.includes(q) ||
          role.includes(q)
        );
      });
    }

    return result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [reminders, filter, searchTerm, todayStart]);

  const counts = useMemo(() => {
    return {
      ALL: reminders.length,
      PENDING: reminders.filter((r) => !r.isCompleted).length,
      UPCOMING: reminders.filter((r) => isUpcoming(r)).length,
      OVERDUE: reminders.filter((r) => isOverdue(r)).length,
      COMPLETED: reminders.filter((r) => r.isCompleted).length,
    };
  }, [reminders, todayStart]);

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      dueDate: "",
      applicationId: "",
    });
  };

  const openCreateModal = () => {
    resetForm();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    setFormData((prev) => ({
      ...prev,
      dueDate: tomorrow.toISOString().split("T")[0],
    }));

    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Reminder title is required";
    }

    if (!formData.dueDate) {
      return "Due date is required";
    }

    return "";
  };

  const createReminder = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim() || null,
        dueDate: formData.dueDate,
        applicationId: formData.applicationId
          ? Number(formData.applicationId)
          : null,
      };

      const res = await api.post("/reminders", payload);

      const createdReminder =
        res.data.reminder || res.data.data || res.data.item || res.data;

      setReminders((prev) => [createdReminder, ...prev]);

      setSuccess("Reminder created successfully");
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create reminder");
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (reminder) => {
    try {
      setUpdatingId(reminder.id);

      const res = await api.put(`/reminders/${reminder.id}`, {
        isCompleted: !reminder.isCompleted,
      });

      const updatedReminder =
        res.data.reminder || res.data.data || res.data.item || {
          ...reminder,
          isCompleted: !reminder.isCompleted,
        };

      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? updatedReminder : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update reminder");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteReminder = async (reminderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(reminderId);

      await api.delete(`/reminders/${reminderId}`);

      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete reminder");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "NA";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getReminderTone = (reminder) => {
    if (reminder.isCompleted) {
      return {
        card: "border-green-100 bg-green-50/60",
        icon: "bg-green-100 text-green-700",
        badge: "bg-green-100 text-green-700",
        label: "Completed",
      };
    }

    if (isOverdue(reminder)) {
      return {
        card: "border-red-100 bg-red-50/70",
        icon: "bg-red-100 text-red-700",
        badge: "bg-red-100 text-red-700",
        label: "Overdue",
      };
    }

    return {
      card: "border-slate-200 bg-white",
      icon: "bg-blue-50 text-blue-700",
      badge: "bg-blue-50 text-blue-700",
      label: "Upcoming",
    };
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-600">
                Loading reminders...
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
                <Bell size={14} />
                Reminder center
              </div>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Stay on top of follow-ups
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Manage HR follow-ups, interview preparation, application
                deadlines, and important job-search tasks.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchReminders}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
              >
                <Plus size={18} />
                New Reminder
              </button>
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

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <FilterCard
            label="All"
            value={counts.ALL}
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          />

          <FilterCard
            label="Pending"
            value={counts.PENDING}
            active={filter === "PENDING"}
            onClick={() => setFilter("PENDING")}
          />

          <FilterCard
            label="Upcoming"
            value={counts.UPCOMING}
            active={filter === "UPCOMING"}
            onClick={() => setFilter("UPCOMING")}
          />

          <FilterCard
            label="Overdue"
            value={counts.OVERDUE}
            active={filter === "OVERDUE"}
            onClick={() => setFilter("OVERDUE")}
            danger
          />

          <FilterCard
            label="Completed"
            value={counts.COMPLETED}
            active={filter === "COMPLETED"}
            onClick={() => setFilter("COMPLETED")}
            success
          />
        </section>

        {/* Search */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search reminders by title, message, company, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </section>

        {/* Reminder List */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Reminders</h3>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredReminders.length} of {reminders.length}{" "}
                reminders
              </p>
            </div>
          </div>

          {filteredReminders.length === 0 ? (
            <EmptyReminders
              hasReminders={reminders.length > 0}
              onClear={() => {
                setSearchTerm("");
                setFilter("ALL");
              }}
              onCreate={openCreateModal}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredReminders.map((reminder) => {
                const tone = getReminderTone(reminder);

                return (
                  <div
                    key={reminder.id}
                    className={`rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${tone.card}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
                        >
                          {reminder.isCompleted ? (
                            <CheckCircle2 size={22} />
                          ) : isOverdue(reminder) ? (
                            <AlertTriangle size={22} />
                          ) : (
                            <CalendarClock size={22} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`font-bold ${
                                reminder.isCompleted
                                  ? "text-green-800 line-through"
                                  : "text-slate-950"
                              }`}
                            >
                              {reminder.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
                            >
                              {tone.label}
                            </span>
                          </div>

                          {reminder.message && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                              {reminder.message}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={15} />
                              Due: {formatDate(reminder.dueDate)}
                            </span>

                            {reminder.application && (
                              <span className="inline-flex items-center gap-1.5">
                                <Briefcase size={15} />
                                {reminder.application.companyName} -{" "}
                                {reminder.application.jobRole}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        disabled={updatingId === reminder.id}
                        onClick={() => toggleComplete(reminder)}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                          reminder.isCompleted
                            ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {updatingId === reminder.id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}

                        {reminder.isCompleted
                          ? "Mark Pending"
                          : "Mark Complete"}
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === reminder.id}
                        onClick={() => deleteReminder(reminder.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingId === reminder.id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    New Reminder
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    Create follow-up reminder
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add a task and optionally link it to an application.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={createReminder} className="space-y-5 p-6">
              <InputField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Follow up with TCS HR"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Message / Notes
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Send a polite follow-up email regarding application status."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Link Application
                  </label>

                  <select
                    name="applicationId"
                    value={formData.applicationId}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="">No application linked</option>

                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.companyName} - {app.jobRole}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

const FilterCard = ({ label, value, active, onClick, danger, success }) => {
  let badgeClass = "bg-blue-50 text-blue-700";

  if (danger) badgeClass = "bg-red-50 text-red-700";
  if (success) badgeClass = "bg-green-50 text-green-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left shadow-sm transition ${
        active
          ? "border-blue-300 bg-blue-50 ring-4 ring-blue-500/10"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
      }`}
    >
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
      >
        {label}
      </span>

      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">reminders</p>
    </button>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
};

const EmptyReminders = ({ hasReminders, onClear, onCreate }) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
        <Bell size={26} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {hasReminders ? "No matching reminders" : "No reminders yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasReminders
          ? "Try clearing search or filter options to see more reminders."
          : "Create reminders for follow-ups, interviews, deadlines, or tasks."}
      </p>

      <div className="mt-6 flex justify-center gap-3">
        {hasReminders ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Reminder
          </button>
        )}
      </div>
    </div>
  );
};

export default Reminders;
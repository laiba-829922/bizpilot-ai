import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  CalendarDays,
  Receipt,
  TrendingDown,
  Filter,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Sidebar from "../components/Sidebar";

const STORAGE_KEY = "bizpilot_expenses";
const EXPENSES_API = "https://bizpilot-api.vercel.app/api/expenses/";

async function expenseRequest(url, options = {}) {
  const token = sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please log in again.");
    }

    throw new Error(`Expense request failed (${response.status}).`);
  }

  if (response.status === 204) return null;

  return response.json();
}

const CATEGORIES = [
  "Rent",
  "Salaries",
  "Marketing",
  "Utilities",
  "Transport",
  "Equipment",
  "Software",
  "Other",
];

const initialForm = {
  title: "",
  amount: "",
  category: "Other",
  date: new Date().toLocaleDateString("en-CA"),
  description: "",
};

const formatMoney = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentMonth = () => getToday().slice(0, 7);

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-outline bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-text">
            {title}
          </p>

          <h3 className="mt-3 wrap-break-words text-xl font-extrabold sm:text-2xl">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-text">{subtitle}</p>
    </div>
  );
}

function ExpenseModal({
  open,
  editingExpense,
  form,
  setForm,
  onClose,
  onSubmit,
  formError,
}) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const inputClass =
    "w-full rounded-xl border border-outline bg-background px-4 py-3 text-sm text-primary-text outline-none transition placeholder:text-muted-text focus:border-brand";

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-outline bg-surface shadow-2xl sm:max-w-xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-outline p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-extrabold">
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </h2>

            <p className="mt-1 text-sm text-muted-text">
              {editingExpense
                ? "Update your expense information."
                : "Record a new business expense."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline text-muted-text hover:text-primary-text"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="min-h-0 overflow-y-auto p-5 sm:p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Expense Title
              </label>

              <input
                type="text"
                required
                maxLength={120}
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="e.g. Office Rent"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Amount (PKR)
              </label>

              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  updateField("amount", event.target.value)
                }
                placeholder="Enter amount"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className={inputClass}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Expense Date
              </label>

              <input
                type="date"
                required
                value={form.date}
                onChange={(event) =>
                  updateField("date", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description (Optional)
              </label>

              <textarea
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Add expense details..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {formError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500"
            >
              {formError}
            </p>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-outline px-5 py-3 text-sm font-bold hover:bg-background"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-extrabold text-brand-foreground hover:brightness-95"
            >
              <Save size={17} />
              {editingExpense ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState(loadExpenses);
  const [expensesLoaded, setExpensesLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [apiExpenses, setApiExpenses] = useState([]);
const [apiLoading, setApiLoading] = useState(false);
const [apiError, setApiError] = useState("");
useEffect(() => {
  fetchExpenses();
}, []);

useEffect(() => {
  console.log("API Expenses:", apiExpenses);
  console.log("API Loading:", apiLoading);
  console.log("API Error:", apiError);
}, [apiExpenses, apiLoading, apiError]);


const fetchExpenses = async () => {
  setApiLoading(true);
  setApiError("");

  try {
    const data = await expenseRequest(EXPENSES_API);

    if (!Array.isArray(data)) {
      throw new Error("Invalid expenses data received.");
    }

    setApiExpenses(data);
setExpenses(data);
setExpensesLoaded(true);

  } catch (error) {
    setApiError(error.message);
  } finally {
    setApiLoading(false);
  }
};


  // useEffect(() => {
  //   try {
  //     localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  //     setStorageError("");
  //   } catch {
  //     setStorageError(
  //       "Unable to save expenses. Browser storage may be full or disabled."
  //     );
  //   }
  // }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const currentMonth = getCurrentMonth();
    const today = getToday();

    return expenses
      .filter((expense) => {
        const matchesSearch =
          !query ||
          [
            expense.title,
            expense.category,
            expense.description,
          ].some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

        const matchesCategory =
          categoryFilter === "All" ||
          expense.category === categoryFilter;

        const matchesDate =
          dateFilter === "All" ||
          (dateFilter === "Today" && expense.date === today) ||
          (dateFilter === "This Month" &&
            expense.date?.startsWith(currentMonth));

        return matchesSearch && matchesCategory && matchesDate;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search, categoryFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    const currentMonth = getCurrentMonth();

    const monthlyExpenses = expenses
      .filter((expense) => expense.date?.startsWith(currentMonth))
      .reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      );

    const highestExpense = expenses.reduce(
      (highest, expense) =>
        Math.max(highest, Number(expense.amount || 0)),
      0
    );

    return {
      totalExpenses,
      monthlyExpenses,
      highestExpense,
      totalRecords: expenses.length,
    };
  }, [expenses]);

  const categoryChartData = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      amount: expenses
        .filter((expense) => expense.category === category)
        .reduce(
          (sum, expense) => sum + Number(expense.amount || 0),
          0
        ),
    })).filter((item) => item.amount > 0);
  }, [expenses]);

  const openAddModal = () => {
    setEditingExpense(null);
    setForm({
      ...initialForm,
      date: getToday(),
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);

    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
      description: expense.description || "",
    });

    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
    setFormError("");
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  const amount = Number(form.amount);

  if (
    !form.title.trim() ||
    !form.date ||
    !CATEGORIES.includes(form.category) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    setFormError("Please enter valid expense details.");
    return;
  }

  const cleaned = {
    title: form.title.trim(),
    amount,
    category: form.category,
    date: form.date,
    description: form.description.trim(),
  };

  setFormError("");

  try {
    if (editingExpense) {
  const updatedExpense = await expenseRequest(
    `${EXPENSES_API}${editingExpense.id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(cleaned),
    }
  );

  setExpenses((previous) =>
    previous.map((expense) =>
      expense.id === editingExpense.id
        ? updatedExpense
        : expense
    )
  );

  closeModal();
  return;
}

    const savedExpense = await expenseRequest(EXPENSES_API, {
      method: "POST",
      body: JSON.stringify({
        ...cleaned,
        client_id: crypto.randomUUID(),
      }),
    });

    setExpenses((previous) => [savedExpense, ...previous]);

    closeModal();
  } catch (error) {
    setFormError(error.message || "Unable to save expense.");
  }
};

const handleDelete = async (expense) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${expense.title}"?`
  );

  if (!confirmed) return;

  try {
    await expenseRequest(
      `${EXPENSES_API}${expense.id}/`,
      {
        method: "DELETE",
      }
    );

    setExpenses((previous) =>
      previous.filter((item) => item.id !== expense.id)
    );

  } catch (error) {
    alert(error.message || "Unable to delete expense.");
  }
};
  const tooltipStyle = {
    backgroundColor: "var(--surface, #1c1c1c)",
    border: "1px solid #555555",
    borderRadius: "12px",
  };

  return (
    <div className="flex min-h-screen min-w-0 bg-background text-primary-text">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">

          {/* Header */}
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-brand">
                <Wallet size={18} />

                <span className="text-xs font-extrabold uppercase tracking-widest">
                  Expense Management
                </span>
              </div>

              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Expenses
              </h1>

              <p className="mt-2 text-sm text-muted-text sm:text-base">
                Track and manage your business spending.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-extrabold text-brand-foreground hover:brightness-95"
            >
              <Plus size={18} />
              Add New Expense
            </button>
          </header>

          {/* Summary Cards */}
          <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Expenses"
              value={formatMoney(stats.totalExpenses)}
              subtitle="Total recorded business spending"
              icon={Wallet}
            />

            <StatCard
              title="This Month"
              value={formatMoney(stats.monthlyExpenses)}
              subtitle="Expenses recorded this month"
              icon={CalendarDays}
            />

            <StatCard
              title="Highest Expense"
              value={formatMoney(stats.highestExpense)}
              subtitle="Largest individual expense"
              icon={TrendingDown}
            />

            <StatCard
              title="Expense Records"
              value={stats.totalRecords}
              subtitle="Total expense transactions"
              icon={Receipt}
            />
          </section>

          {/* Expense Chart */}
          <section className="mt-6 min-w-0 rounded-2xl border border-outline bg-surface p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <ChartNoAxesColumnIncreasing size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold sm:text-xl">
                  Expenses by Category
                </h2>

                <p className="mt-1 text-sm text-muted-text">
                  Compare spending across expense categories.
                </p>
              </div>
            </div>

            <div className="mt-6 h-72 min-w-0 sm:h-80">
              {categoryChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-outline bg-background px-4 text-center text-sm text-muted-text">
                  Add an expense to see your spending chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke="#888888"
                      strokeOpacity={0.15}
                      vertical={false}
                      strokeDasharray="3 5"
                    />

                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#888888", fontSize: 11 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={65}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#888888", fontSize: 11 }}
                      tickFormatter={(value) =>
                        value >= 1000000
                          ? `${(value / 1000000).toFixed(1)}M`
                          : value >= 1000
                            ? `${(value / 1000).toFixed(0)}K`
                            : value
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        formatMoney(value),
                        "Expenses",
                      ]}
                      contentStyle={tooltipStyle}
                    />

                    <Bar
                      dataKey="amount"
                      fill="#EAB308"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={65}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* Expense List */}
          <section className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-outline bg-surface">
            <div className="border-b border-outline p-4 sm:p-6">
              <h2 className="text-lg font-bold sm:text-xl">
                Expense History
              </h2>

              <p className="mt-1 text-sm text-muted-text">
                {filteredExpenses.length} expense(s) found
              </p>

              {/* Filters */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px]">
                <div className="relative min-w-0">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search expenses..."
                    className="w-full rounded-xl border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-text focus:border-brand"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-text"
                  />

                  <select
                    aria-label="Filter by category"
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                    className="w-full rounded-xl border border-outline bg-background py-3 pl-10 pr-3 text-sm outline-none focus:border-brand"
                  >
                    <option value="All">All Categories</option>

                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  aria-label="Filter by date"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-brand"
                >
                  <option value="All">All Dates</option>
                  <option value="Today">Today</option>
                  <option value="This Month">This Month</option>
                </select>
              </div>
            </div>

            {storageError && (
              <p
                role="alert"
                className="mx-4 mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 sm:mx-6"
              >
                {storageError}
              </p>
            )}

            {filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Receipt size={30} />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  No expenses found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-text">
                  {expenses.length === 0
                    ? "Start tracking your business spending by adding your first expense."
                    : "Try changing your search or filters."}
                </p>

                {expenses.length === 0 && (
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-brand-foreground"
                  >
                    <Plus size={17} />
                    Add Expense
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="divide-y divide-outline md:hidden">
                  {filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="min-w-0 space-y-4 p-4 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="wrap-break-words text-sm font-bold">
                            {expense.title}
                          </h3>

                          <p className="mt-1 text-xs text-muted-text">
                            {expense.category}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(expense)}
                            aria-label={`Edit ${expense.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline text-brand"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(expense)}
                            aria-label={`Delete ${expense.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 rounded-xl bg-background p-4">
                        <div>
                          <p className="text-xs text-muted-text">
                            Amount
                          </p>

                          <p className="mt-1 wrap-break-words text-sm font-bold">
                            {formatMoney(expense.amount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-text">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {expense.date}
                          </p>
                        </div>
                      </div>

                      {expense.description && (
                        <p className="wrap-break-words text-xs leading-6 text-muted-text">
                          {expense.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden w-full overflow-x-auto md:block">
                  <table className="w-full min-w-212.5 text-left text-sm">
                    <thead className="border-b border-outline bg-background">
                      <tr className="text-xs uppercase tracking-wider text-muted-text">
                        <th className="px-5 py-5 font-bold">
                          Expense
                        </th>

                        <th className="px-5 py-5 font-bold">
                          Category
                        </th>

                        <th className="px-5 py-5 font-bold">
                          Amount
                        </th>

                        <th className="px-5 py-5 font-bold">
                          Date
                        </th>

                        <th className="px-5 py-5 text-right font-bold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-outline">
                      {filteredExpenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="transition hover:bg-background/50"
                        >
                          <td className="px-5 py-5">
                            <p className="font-bold">
                              {expense.title}
                            </p>

                            {expense.description && (
                              <p className="mt-1 max-w-65 truncate text-xs text-muted-text">
                                {expense.description}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-5 text-muted-text">
                            {expense.category}
                          </td>

                          <td className="px-5 py-5 font-bold">
                            {formatMoney(expense.amount)}
                          </td>

                          <td className="px-5 py-5 text-muted-text">
                            {expense.date}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(expense)}
                                aria-label={`Edit ${expense.title}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline text-brand hover:border-brand"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(expense)}
                                aria-label={`Delete ${expense.title}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline text-red-500 hover:border-red-500"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <p className="mt-5 text-xs text-muted-text">
            Expense records are currently stored in this browser.
            Django backend integration will be added later.
          </p>
        </div>
      </main>

      <ExpenseModal
        open={modalOpen}
        editingExpense={editingExpense}
        form={form}
        setForm={setForm}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formError={formError}
      />
    </div>
  );
}
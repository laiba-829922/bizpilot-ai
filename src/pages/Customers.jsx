import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Wallet,
  RefreshCw,
  UserRoundCheck,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

const STORAGE_KEY = "bizpilot_customers";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
};

function loadCustomers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}

function getInitials(name) {
  return String(name || "C")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function CustomerAvatar({ name }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-extrabold text-brand">
      {getInitials(name)}
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-outline bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-text">
            {title}
          </p>

          <h3 className="mt-3 text-2xl font-extrabold text-primary-text">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-text">
        {description}
      </p>
    </div>
  );
}

function CustomerModal({
  open,
  editingCustomer,
  form,
  setForm,
  onClose,
  onSubmit,
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
        <div className="flex items-center justify-between border-b border-outline px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-xl font-extrabold text-primary-text">
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </h2>

            <p className="mt-1 text-sm text-muted-text">
              {editingCustomer
                ? "Update customer information."
                : "Enter the customer's information."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline text-muted-text transition hover:text-primary-text"
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
                Customer Name
              </label>

              <input
                type="text"
                required
                maxLength={100}
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Enter full name"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Email Address
              </label>

              <input
                type="email"
                required
                maxLength={254}
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                placeholder="customer@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Phone Number
              </label>

              <input
                type="tel"
                required
                maxLength={25}
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder="03XXXXXXXXX"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                City
              </label>

              <input
                type="text"
                required
                maxLength={100}
                value={form.city}
                onChange={(event) =>
                  updateField("city", event.target.value)
                }
                placeholder="Lahore"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-outline px-5 py-3 text-sm font-bold transition hover:bg-background"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-extrabold text-brand-foreground transition hover:brightness-95"
            >
              <Save size={17} />

              {editingCustomer ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState(loadCustomers);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch {
      setError("Unable to save customers in browser storage.");
    }
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.city,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;

    const cities = new Set(
      customers
        .map((customer) => customer.city.trim().toLowerCase())
        .filter(Boolean)
    );

    return {
      totalCustomers,
      totalCities: cities.size,
      newCustomers: customers.filter((customer) => {
        const created = new Date(customer.createdAt);

        if (Number.isNaN(created.getTime())) return false;

        const now = new Date();

        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  }, [customers]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    setForm(initialForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleaned = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      city: form.city.trim(),
    };

    if (Object.values(cleaned).some((value) => !value)) {
      setError("Please fill in all customer fields.");
      return;
    }

    const duplicateEmail = customers.some(
      (customer) =>
        customer.email.toLowerCase() === cleaned.email &&
        customer.id !== editingCustomer?.id
    );

    if (duplicateEmail) {
      setError("A customer with this email already exists.");
      return;
    }

    if (editingCustomer) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...customer, ...cleaned }
            : customer
        )
      );
    } else {
      const newCustomer = {
        id: crypto.randomUUID(),
        ...cleaned,
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
      };

      setCustomers((previous) => [newCustomer, ...previous]);
    }

    setError("");
    closeModal();
  };

  const handleDelete = (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    setCustomers((previous) =>
      previous.filter((item) => item.id !== customer.id)
    );
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
                <Users size={18} />

                <span className="text-xs font-extrabold uppercase tracking-widest">
                  Customer Management
                </span>
              </div>

              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Customers
              </h1>

              <p className="mt-2 text-sm text-muted-text sm:text-base">
                Manage your customer relationships in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-extrabold text-brand-foreground transition hover:brightness-95"
            >
              <UserPlus size={18} />
              Add New Customer
            </button>
          </header>

          {/* Stats */}
          <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              description="Customers in your directory"
              icon={Users}
            />

            <StatCard
              title="New This Month"
              value={stats.newCustomers}
              description="Customers added this month"
              icon={UserRoundCheck}
            />

            <StatCard
              title="Cities Covered"
              value={stats.totalCities}
              description="Unique customer locations"
              icon={MapPin}
            />
          </section>

          {/* Customers List */}
          <section className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-outline bg-surface">
            <div className="flex flex-col gap-4 border-b border-outline p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">
                  All Customers
                </h2>

                <p className="mt-1 text-sm text-muted-text">
                  {filteredCustomers.length} customer(s) found
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customers..."
                  className="w-full rounded-xl border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-text focus:border-brand"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500 sm:mx-6"
              >
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Users size={30} />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {search ? "No matching customers" : "No customers yet"}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-text">
                  {search
                    ? "Try searching with a different name, email, phone number, or city."
                    : "Start building your customer directory by adding your first customer."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-brand-foreground"
                  >
                    <UserPlus size={17} />
                    Add Customer
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="divide-y divide-outline md:hidden">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="min-w-0 space-y-5 p-4 sm:p-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <CustomerAvatar name={customer.name} />

                        <div className="min-w-0 flex-1">
                          <h3 className="wrap-break-words text-sm font-bold">
                            {customer.name}
                          </h3>

                          <p className="mt-1 break-all text-xs text-muted-text">
                            {customer.email}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(customer)}
                            aria-label={`Edit ${customer.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline text-brand"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(customer)}
                            aria-label={`Delete ${customer.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 rounded-xl bg-background p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-muted-text">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {customer.phone}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-text">
                            City
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {customer.city}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-text">
                            Orders
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {customer.totalOrders}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-text">
                            Total Spent
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {formatMoney(customer.totalSpent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden w-full overflow-x-auto md:block">
                  <table className="w-full min-w-225 text-left text-sm">
                    <thead className="border-b border-outline bg-background">
                      <tr className="text-xs uppercase tracking-wider text-muted-text">
                        <th className="px-5 py-5 font-bold">
                          Customer
                        </th>

                        <th className="px-5 py-5 font-bold">
                          Phone
                        </th>

                        <th className="px-5 py-5 font-bold">
                          City
                        </th>

                        <th className="px-5 py-5 font-bold">
                          Orders
                        </th>

                        <th className="px-5 py-5 font-bold">
                          Total Spent
                        </th>

                        <th className="px-5 py-5 text-right font-bold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-outline">
                      {filteredCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="transition hover:bg-background/50"
                        >
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <CustomerAvatar name={customer.name} />

                              <div className="min-w-0">
                                <p className="font-bold">
                                  {customer.name}
                                </p>

                                <p className="mt-1 max-w-57.5 truncate text-xs text-muted-text">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5 text-muted-text">
                            {customer.phone}
                          </td>

                          <td className="px-5 py-5 text-muted-text">
                            {customer.city}
                          </td>

                          <td className="px-5 py-5 font-semibold">
                            {customer.totalOrders}
                          </td>

                          <td className="px-5 py-5 font-semibold">
                            {formatMoney(customer.totalSpent)}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(customer)}
                                aria-label={`Edit ${customer.name}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline text-brand transition hover:border-brand"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(customer)}
                                aria-label={`Delete ${customer.name}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline text-red-500 transition hover:border-red-500"
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
            Customer records are currently stored in this browser.
            Backend synchronization will be added later.
          </p>
        </div>
      </main>

      <CustomerModal
        open={modalOpen}
        editingCustomer={editingCustomer}
        form={form}
        setForm={setForm}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
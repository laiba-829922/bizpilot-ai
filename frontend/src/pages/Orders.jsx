import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";

import {
  Plus,
  ShoppingCart,
  X,
  Loader2,
  Pencil,
  Trash2,
  Save,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = "https://bizpilot-api.vercel.app/api/orders/";

const initialForm = {
  customer_name: "",
  amount: "",
  status: "pending",
};

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock3,
    className: "bg-yellow-500/10 text-yellow-500",
  },
  processing: {
    label: "Processing",
    icon: RefreshCw,
    className: "bg-blue-500/10 text-blue-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-500/10 text-red-500",
  },
};

const formatMoney = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getToken = () => sessionStorage.getItem("access_token");

const getApiError = async (response) => {
  const data = await response.json().catch(() => null);

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (data && typeof data === "object") {
    const messages = Object.entries(data).flatMap(([field, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return values.map((message) => `${field}: ${message}`);
    });

    if (messages.length) return messages.join(" | ");
  }

  return `Request failed (${response.status})`;
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const result = await response.json();

      const orderList = Array.isArray(result)
        ? result
        : Array.isArray(result.results)
          ? result.results
          : [];

      setOrders(orderList);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!showModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) {
        setShowModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal, saving]);

  const handleAdd = () => {
    setEditingOrder(null);
    setForm({ ...initialForm });
    setFormError("");
    setShowModal(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);

    setForm({
      customer_name: order.customer_name || "",
      amount: String(order.amount ?? ""),
      status: order.status || "pending",
    });

    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingOrder(null);
    setForm({ ...initialForm });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(form.amount);

    if (
      !form.customer_name.trim() ||
      form.amount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setFormError("Enter a customer name and a valid order amount.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const token = getToken();

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const isEditing = Boolean(editingOrder);

      const url = isEditing
        ? `${API_URL}${editingOrder.id}/`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: form.customer_name.trim(),
          amount: form.amount,
          status: form.status,
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setShowModal(false);
      setEditingOrder(null);
      setForm({ ...initialForm });

      await fetchOrders();
    } catch (err) {
      setFormError(err.message || "Unable to save order.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete order #${order.id}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(order.id);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(`${API_URL}${order.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      await fetchOrders();
    } catch (err) {
      setError(err.message || "Unable to delete order.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen min-w-0 bg-background text-primary-text">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-8 pt-20 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">

          {/* Header */}
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Orders Management
              </h1>

              <p className="mt-2 text-sm text-muted-text sm:text-base">
                Manage and track your business orders.
              </p>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                title="Refresh Orders"
                aria-label="Refresh Orders"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline bg-surface text-muted-text transition hover:text-brand disabled:opacity-50 sm:h-12 sm:w-12"
              >
                <RefreshCw
                  size={19}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={handleAdd}
                className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-brand-foreground transition hover:opacity-90 sm:flex-none sm:px-5 sm:text-base"
              >
                <Plus size={19} className="shrink-0" />
                <span>Add New Order</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Orders Container */}
          <section className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-outline bg-surface sm:mt-8">

            {loading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 p-6 text-sm text-muted-text">
                <Loader2 size={22} className="animate-spin" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="px-5 py-12 text-center sm:p-16">
                <ShoppingCart
                  size={42}
                  className="mx-auto mb-4 text-muted-text"
                />

                <h2 className="text-lg font-bold sm:text-xl">
                  No Orders Yet
                </h2>

                <p className="mt-2 text-sm text-muted-text">
                  Click Add New Order to create your first order.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="divide-y divide-outline md:hidden">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="min-w-0 p-4 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-text">
                            Order ID
                          </p>

                          <h3 className="mt-1 text-base font-bold">
                            #{order.id}
                          </h3>
                        </div>

                        <StatusBadge status={order.status} />
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 min-[380px]:grid-cols-2">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-text">
                            Customer
                          </p>

                          <p className="mt-1 wrap-break-word text-sm font-semibold">
                            {order.customer_name}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-muted-text">
                            Amount
                          </p>

                          <p className="mt-1 wrap-break-word text-sm font-bold">
                            {formatMoney(order.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs text-muted-text">
                          Date & Time
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDateTime(order.created_at)}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center gap-3 border-t border-outline pt-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(order)}
                          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-outline px-3 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(order)}
                          disabled={deletingId === order.id}
                          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-outline px-3 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingId === order.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}

                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Tablet / Desktop Table */}
                <div className="hidden w-full min-w-0 overflow-x-auto md:block">
                  <table className="w-full min-w-212.5 text-left">

                    <thead className="border-b border-outline bg-background">
                      <tr className="text-xs uppercase tracking-wider text-muted-text">
                        <th className="whitespace-nowrap px-5 py-4">
                          Order ID
                        </th>

                        <th className="px-5 py-4">
                          Customer
                        </th>

                        <th className="whitespace-nowrap px-5 py-4">
                          Amount
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="whitespace-nowrap px-5 py-4">
                          Date & Time
                        </th>

                        <th className="px-5 py-4 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-outline/60 transition last:border-0 hover:bg-elevated"
                        >
                          <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold">
                            #{order.id}
                          </td>

                          <td className="max-w-55 wrap-break-word px-5 py-5 text-sm font-medium">
                            {order.customer_name}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-sm font-bold">
                            {formatMoney(order.amount)}
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge status={order.status} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-sm text-muted-text">
                            {formatDateTime(order.created_at)}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(order)}
                                title="Edit Order"
                                aria-label={`Edit order ${order.id}`}
                                className="rounded-lg border border-outline p-2.5 text-brand transition hover:bg-brand-soft"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(order)}
                                disabled={deletingId === order.id}
                                title="Delete Order"
                                aria-label={`Delete order ${order.id}`}
                                className="rounded-lg border border-outline p-2.5 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                              >
                                {deletingId === order.id ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={17} />
                                )}
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
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-60 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            className="flex max-h-[95dvh] w-full min-w-0 flex-col overflow-hidden rounded-t-2xl border border-outline bg-surface shadow-2xl sm:max-h-[90dvh] sm:max-w-lg sm:rounded-2xl"
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-outline px-4 py-5 sm:px-7 sm:py-6">
              <div className="min-w-0">
                <h2
                  id="order-modal-title"
                  className="text-xl font-extrabold sm:text-2xl"
                >
                  {editingOrder ? "Edit Order" : "Add New Order"}
                </h2>

                <p className="mt-1 text-xs text-muted-text sm:text-sm">
                  {editingOrder
                    ? "Update your customer's order details."
                    : "Enter your customer's order details."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                aria-label="Close"
                className="shrink-0 rounded-lg p-2 text-muted-text transition hover:bg-elevated disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6"
            >
              {formError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
                >
                  {formError}
                </div>
              )}

              <div className="space-y-5">

                {/* Customer Name */}
                <div>
                  <label
                    htmlFor="order-customer"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Customer Name
                  </label>

                  <input
                    id="order-customer"
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customer_name: e.target.value,
                      })
                    }
                    placeholder="e.g. Muhammad Ali"
                    className="w-full min-w-0 rounded-xl border border-outline bg-background px-4 py-3 text-base text-primary-text outline-none focus:border-brand"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label
                    htmlFor="order-amount"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Order Amount (Rs.)
                  </label>

                  <input
                    id="order-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount: e.target.value,
                      })
                    }
                    placeholder="e.g. 15000"
                    className="w-full min-w-0 rounded-xl border border-outline bg-background px-4 py-3 text-base text-primary-text outline-none focus:border-brand"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="order-status"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Order Status
                  </label>

                  <select
                    id="order-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                    className="w-full min-w-0 rounded-xl border border-outline bg-background px-4 py-3 text-base text-primary-text outline-none focus:border-brand"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Created Date */}
                {editingOrder && (
                  <div className="rounded-xl border border-outline bg-background p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-text">
                      <Clock3 size={17} />
                      Order Created
                    </div>

                    <p className="mt-2 text-sm font-semibold">
                      {formatDateTime(editingOrder.created_at)}
                    </p>
                  </div>
                )}

              </div>

              {/* Modal Buttons */}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-outline pt-5 min-[380px]:flex-row min-[380px]:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="w-full rounded-xl border border-outline px-5 py-3 font-semibold transition hover:bg-elevated disabled:opacity-50 min-[380px]:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-brand-foreground transition hover:opacity-90 disabled:opacity-60 min-[380px]:w-auto"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : editingOrder ? (
                    <Save size={18} />
                  ) : (
                    <Plus size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingOrder
                      ? "Save Changes"
                      : "Save Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
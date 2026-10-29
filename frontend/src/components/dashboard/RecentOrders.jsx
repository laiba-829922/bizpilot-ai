import { useEffect, useState } from "react";

const API_URL = "https://bizpilot-api.vercel.app/api/orders/";

const formatAmount = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
};

const formatOrderId = (id) => {
  return `#ORD-${String(id).padStart(3, "0")}`;
};

const getStatusStyles = (status) => {
  switch (String(status).toLowerCase()) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-500";

    case "cancelled":
      return "bg-red-500/10 text-red-500";

    case "processing":
      return "bg-blue-500/10 text-blue-500";

    case "pending":
      return "bg-amber-500/10 text-amber-500";

    default:
      return "bg-background text-muted-text";
  }
};

const formatStatus = (status) => {
  const value = String(status || "unknown");

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("access_token");

        if (!token) {
          throw new Error("Please log in to view orders.");
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders.");
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        const orderList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : [];

        setOrders(orderList);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Orders error:", err);

        setError(err.message || "Unable to load orders.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, []);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-outline bg-surface">

      {/* Header */}
      <div className="border-b border-outline px-4 py-5 sm:px-6">
        <h3 className="text-lg font-bold text-primary-text sm:text-xl">
          Recent Orders
        </h3>

        <p className="mt-1 text-xs text-muted-text sm:text-sm">
          Overview of your business orders
        </p>
      </div>

      {/* Loading / Error / Empty */}
      {loading || error || orders.length === 0 ? (
        <div className="px-4 py-12 text-center sm:px-6">
          {loading ? (
            <p className="text-sm text-muted-text">
              Loading orders...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500">
              {error}
            </p>
          ) : (
            <p className="text-sm text-muted-text">
              No orders found.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="divide-y divide-outline md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="min-w-0 space-y-4 p-4 sm:p-5"
              >
                {/* Order ID + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-text">
                      Order ID
                    </p>

                    <p className="mt-1 text-sm font-bold text-primary-text">
                      {formatOrderId(order.id)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>

                {/* Customer */}
                <div className="min-w-0">
                  <p className="text-xs text-muted-text">
                    Customer
                  </p>

                  <p className="mt-1 wrap-break-word text-sm font-medium text-primary-text">
                    {order.customer_name || "Unknown Customer"}
                  </p>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between gap-3 border-t border-outline pt-3">
                  <span className="text-xs font-medium text-muted-text">
                    Amount
                  </span>

                  <span className="wrap-break-word text-right text-sm font-bold text-primary-text">
                    {formatAmount(order.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet / Desktop Table */}
          <div className="hidden w-full min-w-0 overflow-x-auto md:block">
            <table className="w-full min-w-162.5 text-left text-sm">

              <thead className="bg-background text-muted-text">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold lg:px-6">
                    Order ID
                  </th>

                  <th className="px-5 py-4 font-semibold lg:px-6">
                    Customer
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 font-semibold lg:px-6">
                    Amount
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 font-semibold lg:px-6">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-outline text-primary-text transition-colors hover:bg-background"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-semibold lg:px-6">
                      {formatOrderId(order.id)}
                    </td>

                    <td className="max-w-65 wrap-break-word px-5 py-4 lg:px-6">
                      {order.customer_name || "Unknown Customer"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium lg:px-6">
                      {formatAmount(order.amount)}
                    </td>

                    <td className="px-5 py-4 lg:px-6">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </>
      )}
    </section>
  );
}
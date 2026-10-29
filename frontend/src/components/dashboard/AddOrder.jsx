import { useState } from "react";

export default function AddOrder() {
  const [form, setForm] = useState({
    customer_name: "",
    amount: "",
    status: "pending",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = sessionStorage.getItem("access_token");

      const response = await fetch("http://127.0.0.1:8001/api/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setMessage("Unable to save order.");
        return;
      }

      setMessage("Order saved successfully!");

      setForm({
        customer_name: "",
        amount: "",
        status: "pending",
      });
    } catch {
      setMessage("Server connection failed.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-outline bg-surface p-6"
    >
      <h3 className="mb-6 text-xl font-bold text-primary-text">
        Add New Order
      </h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <input
          required
          placeholder="Customer Name"
          value={form.customer_name}
          onChange={(e) =>
            setForm({ ...form, customer_name: e.target.value })
          }
          className="rounded-xl border border-outline bg-background p-3 text-primary-text"
        />

        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Order Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          className="rounded-xl border border-outline bg-background p-3 text-primary-text"
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
          className="rounded-xl border border-outline bg-background p-3 text-primary-text"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button
        type="submit"
        className="mt-5 rounded-xl bg-brand px-6 py-3 font-bold text-brand-foreground"
      >
        Save Order
      </button>

      {message && (
        <p className="mt-4 text-sm text-primary-text">{message}</p>
      )}
    </form>
  );
}
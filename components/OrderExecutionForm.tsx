"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderExecutionForm() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const commitPurchaseOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const orderPayload = {
      gameId: (form.elements.namedItem("gameId") as HTMLInputElement).value,
      unitCount: Number((form.elements.namedItem("unitCount") as HTMLInputElement).value),
      deliveryState: (form.elements.namedItem("deliveryState") as HTMLSelectElement).value,
      customerId: (form.elements.namedItem("customerId") as HTMLInputElement).value,
      grandTotal: Number((form.elements.namedItem("grandTotal") as HTMLInputElement).value),
    };

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    setIsFormOpen(false);
    router.refresh();
  };

  const inputClass =
    "w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none";
  const inputStyle = {
    background: "var(--gk-void)",
    border: "1px solid var(--gk-border)",
  };

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{
          border: "1px solid var(--gk-accent)",
          color: "var(--gk-accent-glow)",
          background: "var(--gk-accent-dim)",
        }}
      >
        + Log Purchase Order
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--gk-panel)", border: "1px solid var(--gk-border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">🛒 Execute Purchase Order</h2>
              <button
                onClick={() => setIsFormOpen(false)}
                style={{ color: "var(--gk-muted)" }}
                className="hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={commitPurchaseOrder} className="space-y-3">
              <input
                name="gameId"
                placeholder="Game ID (e.g. gp1)"
                required
                className={inputClass}
                style={inputStyle}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="unitCount"
                  type="number"
                  placeholder="Unit count"
                  required
                  min={1}
                  className={inputClass}
                  style={inputStyle}
                />
                <input
                  name="grandTotal"
                  type="number"
                  step="0.01"
                  placeholder="Grand total ($)"
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <select
                name="deliveryState"
                required
                className={inputClass}
                style={{ ...inputStyle, color: "#9ca3af" }}
              >
                <option value="">Delivery state…</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="refunded">Refunded</option>
              </select>

              <input
                name="customerId"
                placeholder="Customer ID"
                required
                className={inputClass}
                style={inputStyle}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ border: "1px solid var(--gk-border)", color: "var(--gk-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
                  style={{ background: "var(--gk-accent)" }}
                >
                  Commit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

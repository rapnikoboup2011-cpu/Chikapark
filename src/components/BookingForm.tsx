"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

const inputClassName =
  "rounded-lg border border-surface-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60 outline-none focus:border-gold focus:ring-1 focus:ring-gold";

export function BookingForm({ spotId }: { spotId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId,
          date: formData.get("date"),
          timeSlot: "full_day",
          customerName: formData.get("customerName"),
          customerPhone: formData.get("customerPhone"),
          customerEmail: formData.get("customerEmail") || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Не удалось создать бронь");
        setSubmitting(false);
        if (res.status === 409) {
          router.refresh();
        }
        return;
      }

      router.push(`/booking/${spotId}/pending/${data.id}`);
    } catch {
      setError("Не удалось связаться с сервером, попробуйте ещё раз");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-muted">
          Дата
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          min={todayISODate()}
          defaultValue={todayISODate()}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="customerName" className="text-sm font-medium text-muted">
          Имя
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          required
          minLength={2}
          maxLength={200}
          placeholder="Как к вам обращаться"
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="customerPhone" className="text-sm font-medium text-muted">
          Телефон
        </label>
        <input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          required
          placeholder="+7 900 000-00-00"
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="customerEmail" className="text-sm font-medium text-muted">
          Email <span className="text-muted/60">(необязательно)</span>
        </label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          placeholder="для чека и подтверждения"
          className={inputClassName}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-950 p-3 text-sm text-rose-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gold-strong disabled:opacity-50"
      >
        {submitting ? "Бронируем…" : "Забронировать место"}
      </button>
    </form>
  );
}

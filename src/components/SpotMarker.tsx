"use client";

import Link from "next/link";
import type { Spot } from "@prisma/client";

const STATUS_STYLES: Record<Spot["status"], string> = {
  FREE: "bg-emerald-500 hover:bg-emerald-600 cursor-pointer",
  PENDING: "bg-amber-400 cursor-not-allowed",
  BOOKED: "bg-rose-500 cursor-not-allowed",
  DISABLED: "bg-zinc-400 cursor-not-allowed",
};

const STATUS_LABELS: Record<Spot["status"], string> = {
  FREE: "свободно",
  PENDING: "бронируется",
  BOOKED: "занято",
  DISABLED: "недоступно",
};

function formatPrice(kopecks: number) {
  return `${Math.round(kopecks / 100).toLocaleString("ru-RU")} ₽`;
}

export function SpotMarker({ spot }: { spot: Spot }) {
  const title = `${spot.number} · ${STATUS_LABELS[spot.status]} · ${formatPrice(spot.basePrice)}`;
  const label = spot.number.replace(/[^0-9]/g, "") || spot.number;
  const className = `absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold text-white shadow ring-2 ring-white transition-colors ${STATUS_STYLES[spot.status]}`;
  const style = { left: `${spot.positionX}%`, top: `${spot.positionY}%` };

  if (spot.status !== "FREE") {
    return (
      <span title={title} className={className} style={style}>
        {label}
      </span>
    );
  }

  return (
    <Link href={`/booking/${spot.id}`} title={title} aria-label={title} className={className} style={style}>
      {label}
    </Link>
  );
}

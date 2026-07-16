"use client";

import Link from "next/link";
import type { Spot } from "@prisma/client";

const STATUS_COLORS: Record<Spot["status"], string> = {
  FREE: "#10b981",
  PENDING: "#fbbf24",
  BOOKED: "#f43f5e",
  DISABLED: "#a1a1aa",
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

function Pin({ color, label, interactive }: { color: string; label: string; interactive: boolean }) {
  return (
    <span className="flex flex-col items-center">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-md transition-transform ${
          interactive ? "group-hover:-translate-y-0.5" : ""
        }`}
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
      <span
        className="-mt-px h-0 w-0 border-x-[6px] border-x-transparent border-t-[9px] drop-shadow-sm"
        style={{ borderTopColor: color }}
      />
    </span>
  );
}

export function SpotMarker({ spot }: { spot: Spot }) {
  const title = `${spot.number} · ${STATUS_LABELS[spot.status]} · ${formatPrice(spot.basePrice)}`;
  const label = spot.number.replace(/[^0-9]/g, "") || spot.number;
  const color = STATUS_COLORS[spot.status];
  const style = { left: `${spot.positionX}%`, top: `${spot.positionY}%` };

  if (spot.status !== "FREE") {
    return (
      <span
        title={title}
        className="absolute -translate-x-1/2 -translate-y-full cursor-not-allowed opacity-90"
        style={style}
      >
        <Pin color={color} label={label} interactive={false} />
      </span>
    );
  }

  return (
    <Link
      href={`/booking/${spot.id}`}
      title={title}
      aria-label={title}
      className="group absolute -translate-x-1/2 -translate-y-full"
      style={style}
    >
      <Pin color={color} label={label} interactive />
    </Link>
  );
}

"use client";

import { useState } from "react";
import type { Zone } from "@prisma/client";
import type { SpotWithZone } from "@/types/spot";
import { SpotMarker } from "./SpotMarker";

const LEGEND: { status: SpotWithZone["status"]; label: string; color: string }[] = [
  { status: "FREE", label: "Свободно", color: "bg-emerald-500" },
  { status: "PENDING", label: "Бронируется", color: "bg-amber-400" },
  { status: "BOOKED", label: "Занято", color: "bg-rose-500" },
  { status: "DISABLED", label: "Недоступно", color: "bg-zinc-400" },
];

export function SchemeMap({
  zones,
  spots,
}: {
  zones: Zone[];
  spots: SpotWithZone[];
}) {
  const [activeZoneId, setActiveZoneId] = useState(zones[0]?.id);
  const activeSpots = spots.filter((spot) => spot.zoneId === activeZoneId);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setActiveZoneId(zone.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              zone.id === activeZoneId
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>

      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-sky-50 to-sky-100 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800">
        {activeSpots.map((spot) => (
          <SpotMarker key={spot.id} spot={spot} />
        ))}
        {activeSpots.length === 0 && (
          <p className="flex h-full items-center justify-center text-sm text-zinc-500">
            В этой зоне пока нет мест
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        {LEGEND.map((item) => (
          <span key={item.status} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

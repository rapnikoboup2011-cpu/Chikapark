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
  const activeZone = zones.find((zone) => zone.id === activeZoneId);
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
                ? "bg-gold text-black"
                : "bg-surface text-muted hover:text-foreground border border-surface-border"
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>

      <div
        className={`relative h-[420px] w-full overflow-hidden rounded-2xl border border-surface-border ${
          activeZone?.mapImage ? "bg-surface" : "bg-gradient-to-b from-[#141210] to-[#0c0b09]"
        }`}
      >
        {activeZone?.mapImage && (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary venue photos, not a known image domain
          <img
            src={activeZone.mapImage}
            alt={activeZone.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {activeSpots.map((spot) => (
          <SpotMarker key={spot.id} spot={spot} />
        ))}
        {activeSpots.length === 0 && (
          <p className="flex h-full items-center justify-center text-sm text-muted">
            В этой зоне пока нет мест
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted">
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

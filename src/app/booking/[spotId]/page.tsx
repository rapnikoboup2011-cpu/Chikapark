import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { releaseExpiredBookings } from "@/lib/bookings";
import { BookingForm } from "@/components/BookingForm";

const ZONE_LABELS: Record<string, string> = {
  BEACH: "Пляж",
  POOL: "Бассейн",
  VIP: "VIP-зона",
};

function formatPrice(kopecks: number) {
  return `${Math.round(kopecks / 100).toLocaleString("ru-RU")} ₽`;
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ spotId: string }>;
}) {
  const { spotId } = await params;
  await releaseExpiredBookings();

  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
    include: { zone: true },
  });

  if (!spot) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm text-muted hover:text-gold">
        ← Назад к схеме
      </Link>

      <div className="rounded-2xl border border-surface-border bg-surface p-6">
        <p className="text-sm text-muted">{ZONE_LABELS[spot.zone.type] ?? spot.zone.name}</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-foreground">
          Место {spot.number}
        </h1>
        <p className="mt-2 text-lg text-gold-strong">{formatPrice(spot.basePrice)}</p>

        {spot.status === "FREE" ? (
          <BookingForm spotId={spot.id} />
        ) : (
          <p className="mt-6 rounded-lg bg-rose-950 p-4 text-sm text-rose-400">
            Это место сейчас недоступно для бронирования.
          </p>
        )}
      </div>
    </div>
  );
}

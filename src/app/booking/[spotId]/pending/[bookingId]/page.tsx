import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { releaseExpiredBookings } from "@/lib/bookings";
import { CountdownTimer } from "@/components/CountdownTimer";

const ZONE_LABELS: Record<string, string> = {
  BEACH: "Пляж",
  POOL: "Бассейн",
  VIP: "VIP-зона",
};

const STATUS_MESSAGES: Record<string, { title: string; tone: string }> = {
  CONFIRMED: { title: "Бронь подтверждена", tone: "bg-emerald-950 text-emerald-400" },
  EXPIRED: { title: "Время на оплату истекло, место снова свободно", tone: "bg-rose-950 text-rose-400" },
  CANCELLED: { title: "Бронь отменена", tone: "bg-rose-950 text-rose-400" },
};

function formatPrice(kopecks: number) {
  return `${Math.round(kopecks / 100).toLocaleString("ru-RU")} ₽`;
}

export default async function PendingBookingPage({
  params,
}: {
  params: Promise<{ spotId: string; bookingId: string }>;
}) {
  const { spotId, bookingId } = await params;
  await releaseExpiredBookings();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { spot: { include: { zone: true } } },
  });

  if (!booking || booking.spotId !== spotId) {
    notFound();
  }

  const statusInfo = STATUS_MESSAGES[booking.status];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm text-muted hover:text-gold">
        ← Назад к схеме
      </Link>

      <div className="rounded-2xl border border-surface-border bg-surface p-6">
        <p className="text-sm text-muted">
          {ZONE_LABELS[booking.spot.zone.type] ?? booking.spot.zone.name} · Место{" "}
          {booking.spot.number}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-gold-strong">
          {formatPrice(booking.totalPrice)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {new Date(booking.date).toLocaleDateString("ru-RU")}
        </p>

        {statusInfo ? (
          <p className={`mt-6 rounded-lg p-4 text-sm ${statusInfo.tone}`}>{statusInfo.title}</p>
        ) : (
          <div className="mt-6 rounded-lg bg-amber-950 p-4 text-sm text-amber-400">
            <p>
              Место придержано за вами. Оплатите бронь в течение{" "}
              <span className="font-semibold">
                <CountdownTimer expiresAt={booking.expiresAt.toISOString()} />
              </span>
              , иначе оно снова станет доступно.
            </p>
            <p className="mt-2 text-muted">
              Оплата через Т-Кассу будет подключена на следующем шаге разработки.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

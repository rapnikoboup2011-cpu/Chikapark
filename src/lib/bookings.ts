import { prisma } from "./prisma";

export function pendingTtlMinutes() {
  const raw = Number(process.env.BOOKING_PENDING_TTL_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : 15;
}

// Pending bookings are auto-cancelled once their TTL passes without payment
// confirmation. No cron/queue exists yet, so this sweep runs lazily on every
// read that needs an up-to-date spot status (see CLAUDE.md booking rules).
export async function releaseExpiredBookings() {
  const expired = await prisma.booking.findMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
    select: { id: true, spotId: true },
  });

  if (expired.length === 0) return;

  await prisma.$transaction([
    prisma.booking.updateMany({
      where: { id: { in: expired.map((b) => b.id) } },
      data: { status: "EXPIRED" },
    }),
    prisma.spot.updateMany({
      where: { id: { in: expired.map((b) => b.spotId) }, status: "PENDING" },
      data: { status: "FREE" },
    }),
  ]);
}

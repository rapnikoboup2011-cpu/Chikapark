import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { releaseExpiredBookings } from "@/lib/bookings";

export async function GET() {
  await releaseExpiredBookings();

  const spots = await prisma.spot.findMany({
    include: { zone: true },
    orderBy: [{ zoneId: "asc" }, { number: "asc" }],
  });

  return NextResponse.json(spots);
}

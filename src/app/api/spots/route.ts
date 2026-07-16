import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const spots = await prisma.spot.findMany({
    include: { zone: true },
    orderBy: [{ zoneId: "asc" }, { number: "asc" }],
  });

  return NextResponse.json(spots);
}

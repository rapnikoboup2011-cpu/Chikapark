import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pendingTtlMinutes, releaseExpiredBookings } from "@/lib/bookings";

const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  await releaseExpiredBookings();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const { spotId, date, timeSlot, customerName, customerPhone, customerEmail } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof spotId !== "string" || !spotId) {
    return NextResponse.json({ error: "Не указано место" }, { status: 400 });
  }
  if (typeof customerName !== "string" || customerName.trim().length < 2 || customerName.length > 200) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  }
  if (typeof customerPhone !== "string" || !PHONE_RE.test(customerPhone.trim())) {
    return NextResponse.json({ error: "Укажите корректный телефон" }, { status: 400 });
  }
  if (
    customerEmail !== undefined &&
    customerEmail !== null &&
    customerEmail !== "" &&
    (typeof customerEmail !== "string" || !EMAIL_RE.test(customerEmail.trim()))
  ) {
    return NextResponse.json({ error: "Укажите корректный email" }, { status: 400 });
  }
  const parsedDate = typeof date === "string" ? new Date(date) : null;
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Укажите дату" }, { status: 400 });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) {
    return NextResponse.json({ error: "Дата не может быть в прошлом" }, { status: 400 });
  }

  const spot = await prisma.spot.findUnique({ where: { id: spotId } });
  if (!spot) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  // Atomically claim the spot: the WHERE status:FREE guard means only one
  // concurrent request can flip it to PENDING, so two guests can't double-book.
  const claim = await prisma.spot.updateMany({
    where: { id: spotId, status: "FREE" },
    data: { status: "PENDING" },
  });
  if (claim.count === 0) {
    return NextResponse.json({ error: "Это место уже забронировано" }, { status: 409 });
  }

  const expiresAt = new Date(Date.now() + pendingTtlMinutes() * 60_000);

  try {
    const booking = await prisma.booking.create({
      data: {
        spotId,
        date: parsedDate,
        timeSlot: typeof timeSlot === "string" && timeSlot ? timeSlot : "full_day",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail:
          typeof customerEmail === "string" && customerEmail.trim() ? customerEmail.trim() : null,
        totalPrice: spot.basePrice,
        expiresAt,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    await prisma.spot.update({ where: { id: spotId }, data: { status: "FREE" } });
    throw error;
  }
}

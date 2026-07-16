import { PrismaClient, ZoneType, SpotStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.notificationLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.zone.deleteMany();

  const beach = await prisma.zone.create({
    data: { name: "Пляж", type: ZoneType.BEACH },
  });
  const pool = await prisma.zone.create({
    data: { name: "Бассейн", type: ZoneType.POOL },
  });
  const vip = await prisma.zone.create({
    data: { name: "VIP-зоны", type: ZoneType.VIP },
  });

  const row = (count: number, y: number, startX = 10, gap = 12) =>
    Array.from({ length: count }, (_, i) => ({ x: startX + i * gap, y }));

  const beachSpots = [...row(6, 20), ...row(6, 45), ...row(6, 70)];
  await prisma.spot.createMany({
    data: beachSpots.map((pos, i) => ({
      zoneId: beach.id,
      number: `A${i + 1}`,
      positionX: pos.x,
      positionY: pos.y,
      basePrice: 150000,
      status:
        i === 2 ? SpotStatus.BOOKED : i === 7 ? SpotStatus.PENDING : SpotStatus.FREE,
    })),
  });

  const poolSpots = [...row(5, 30, 15, 15), ...row(5, 65, 15, 15)];
  await prisma.spot.createMany({
    data: poolSpots.map((pos, i) => ({
      zoneId: pool.id,
      number: `P${i + 1}`,
      positionX: pos.x,
      positionY: pos.y,
      basePrice: 250000,
      status: i === 4 ? SpotStatus.BOOKED : SpotStatus.FREE,
    })),
  });

  const vipSpots = row(4, 50, 15, 22);
  await prisma.spot.createMany({
    data: vipSpots.map((pos, i) => ({
      zoneId: vip.id,
      number: `VIP-${i + 1}`,
      positionX: pos.x,
      positionY: pos.y,
      basePrice: 800000,
      status: i === 3 ? SpotStatus.DISABLED : SpotStatus.FREE,
    })),
  });

  const zonesCount = await prisma.zone.count();
  const spotsCount = await prisma.spot.count();
  console.log(`Создано зон: ${zonesCount}, мест: ${spotsCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { prisma } from "@/lib/prisma";
import { releaseExpiredBookings } from "@/lib/bookings";
import { SchemeMap } from "@/components/SchemeMap";

export const dynamic = "force-dynamic";

export default async function Home() {
  await releaseExpiredBookings();

  const [zones, spots] = await Promise.all([
    prisma.zone.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.spot.findMany({ include: { zone: true }, orderBy: { number: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Чайка Парк
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Выберите зону и свободное место, чтобы забронировать лежак
        </p>
      </header>

      {zones.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Схема пока пуста — запустите <code>npm run db:seed</code>
        </p>
      ) : (
        <SchemeMap zones={zones} spots={spots} />
      )}
    </div>
  );
}

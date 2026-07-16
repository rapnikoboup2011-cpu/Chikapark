import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
    include: { zone: true },
  });

  if (!spot) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Назад к схеме
      </Link>

      <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {ZONE_LABELS[spot.zone.type] ?? spot.zone.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Место {spot.number}
        </h1>
        <p className="mt-2 text-lg text-zinc-700 dark:text-zinc-300">
          {formatPrice(spot.basePrice)}
        </p>

        {spot.status === "FREE" ? (
          <p className="mt-6 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            Форма бронирования появится на следующем шаге разработки.
          </p>
        ) : (
          <p className="mt-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            Это место сейчас недоступно для бронирования.
          </p>
        )}
      </div>
    </div>
  );
}

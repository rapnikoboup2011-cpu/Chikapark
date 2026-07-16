import type { Spot, Zone } from "@prisma/client";

export type SpotWithZone = Spot & {
  zone: Zone;
};

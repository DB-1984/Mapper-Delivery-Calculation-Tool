/**
* Takes a miles value and a DeliveryBand type object
* has access to underMiles from route.ts where it's
* called - finds first match to determine cost.
*/

import type { DeliveryBand } from "@/types/delivery";

export function getDeliveryPrice(
  miles: number,
  bands: DeliveryBand[]
): number | null {
  const band = bands.find(
    ({ underMiles }) => miles < underMiles
  );

  return band?.price ?? null;
}
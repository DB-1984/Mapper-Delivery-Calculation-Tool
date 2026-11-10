/**
 * This route.ts file defines a local API endpoint.
 * It acts as both the route and its request handler/controller.
 *
 * Exported functions named after HTTP methods, such as POST and GET,
 * handle requests made to this endpoint.
 *
 * We use an API route here instead of importing a Server Action into
 * the client component. The interactive form remains a Client Component,
 * while this route handles the server-side Google API request.
 */

import deliveryBands from "@/data/delivery-bands.json";
import { getDeliveryPrice } from "@/lib/get-delivery-price";
import type { DeliveryBand } from "@/types/delivery";

type GoogleRoutesResponse = {
  routes?: Array<{
    distanceMeters?: number;
  }>;
  error?: {
    message?: string;
  };
};

export async function POST(request: Request) {
  try {
    const originPostcode = process.env.ORIGIN_POSTCODE;
    const apiKey = process.env.GOOGLE_DISTANCE_MATRIX_KEY;

    if (!originPostcode || !apiKey) {
      console.error("Delivery environment variables are missing.", {
        hasOriginPostcode: Boolean(originPostcode),
        hasApiKey: Boolean(apiKey),
      });

      return Response.json(
        {
          error: "The delivery calculator is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("destination" in body) ||
      typeof body.destination !== "string"
    ) {
      return Response.json(
        {
          error: "Please provide a destination postcode.",
        },
        {
          status: 400,
        }
      );
    }

    const destination = body.destination.trim().toUpperCase();

    if (!destination) {
      return Response.json(
        {
          error: "Please provide a destination postcode.",
        },
        {
          status: 400,
        }
      );
    }

    const googleResponse = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters",
        },
        body: JSON.stringify({
          origin: {
            address: originPostcode.trim().toUpperCase(),
          },
          destination: {
            address: destination,
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_UNAWARE",
        }),
        cache: "no-store",
      }
    );

    const googleData = (await googleResponse.json()) as GoogleRoutesResponse;

    if (!googleResponse.ok) {
      console.error("Google HTTP error:", googleResponse.status, googleData.error?.message);

      return Response.json(
        {
          error: googleData.error?.message ?? "Unable to contact the distance service.",
        },
        {
          status: 502,
        }
      );
    }

    const distanceMeters = googleData.routes?.[0]?.distanceMeters;

    if (typeof distanceMeters !== "number") {
      return Response.json(
        {
          error: "Please check that the destination postcode is valid.",
        },
        {
          status: 400,
        }
      );
    }

    const preciseDistanceMiles = distanceMeters / 1609.344;
    const displayedDistanceMiles = Number(
      preciseDistanceMiles.toFixed(1)
    );

    const deliveryPrice = getDeliveryPrice(
      preciseDistanceMiles,
      deliveryBands as DeliveryBand[]
    );

    return Response.json({
      destination,
      distanceMiles: displayedDistanceMiles,
      deliveryPrice,
      m25CheckRequired: preciseDistanceMiles < 50,
    });
  } catch (error) {
    console.error("Delivery API error:", error);

    return Response.json(
      {
        error: "Unable to calculate delivery. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}

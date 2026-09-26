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

type GoogleDistanceResponse = {
  status?: string;
  error_message?: string;
  rows?: Array<{
    elements?: Array<{
      status?: string;
      distance?: {
        value?: number;
        text?: string;
      };
    }>;
  }>;
};

export async function POST(request: Request) {
  try {
    /*
     * Environment variables have the type string | undefined.
     * These checks ensure that both variables exist and narrow
     * their types to string for the rest of this function.
     */
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

    /*
     * request.json() could contain any kind of value, so it is
     * initially treated as unknown and checked before being used.
     */
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

    /*
     * Build the query sent from this server to Google's
     * Distance Matrix API. The API key is never sent to the browser.
     */
    const searchParams = new URLSearchParams({
      origins: originPostcode.trim().toUpperCase(),
      destinations: destination,
      units: "imperial",
      key: apiKey,
    });

    const googleResponse = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${searchParams.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!googleResponse.ok) {
      console.error("Google HTTP error:", googleResponse.status);

      return Response.json(
        {
          error: "Unable to contact the distance service.",
        },
        {
          status: 502,
        }
      );
    }

    const googleData =
      (await googleResponse.json()) as GoogleDistanceResponse;

    if (googleData.status !== "OK") {
      console.error("Google API error:", {
        status: googleData.status,
        message: googleData.error_message,
      });

      return Response.json(
        {
          error: "The distance service could not process this request.",
        },
        {
          status: 502,
        }
      );
    }

    const distanceElement = googleData.rows?.[0]?.elements?.[0];

    if (
      distanceElement?.status !== "OK" ||
      typeof distanceElement.distance?.value !== "number"
    ) {
      return Response.json(
        {
          error: "Please check that the destination postcode is valid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Google returns the road distance in metres.
     * Use the precise mileage for pricing and round only the
     * mileage displayed in the interface.
     */
    const distanceMetres = distanceElement.distance.value;
    const preciseDistanceMiles = distanceMetres / 1609.344;
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
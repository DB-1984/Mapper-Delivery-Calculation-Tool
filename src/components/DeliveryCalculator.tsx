/**
 * Displays map via LocationPicker, submits postcode
 * to the API, then displays the result
 */

"use client";

import { useCallback, useState, type SubmitEvent } from "react";
import LocationPicker from "@/components/LocationPicker";
import type { DeliveryResult, SelectedLocation } from "@/types/delivery";

export default function DeliveryCalculator() {
  const [destination, setDestination] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // handleLocationSelect is passed to LocationPicker as its onSelect prop.
  // Because onSelect is a dependency of LocationPicker's useEffect,
  // useCallback preserves the function's identity between renders.
  // Otherwise, the effect would detect a new function reference and
  // unnecessarily rebuild the Google autocomplete UI and event listener.
  const handleLocationSelect = useCallback((location: SelectedLocation) => {
    setDestination(location.postcode);
    setSelectedAddress(location.address);
    setResult(null);
    setError("");
  }, []);

  // POST the updated address and destination state to our API
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!destination) {
      setError(
        "Please select an address or postcode from the Google suggestions."
      );
      return;
    }

    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to calculate delivery.");
      }

      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to calculate delivery."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // The interface for address looklup is supplied by LocationPicker - the rest of this
  // JSX simply displays the response from the api call
  return (
    <main className="fixed inset-0 overflow-hidden bg-zinc-100">
      <form onSubmit={handleSubmit} className="contents">
        <LocationPicker onSelect={handleLocationSelect} />
        <div className="fixed right-1 top-1 z-30 flex items-center gap-1 rounded-full border border-white/60 bg-white/90 p-1 sm:px-2 sm:py-1 shadow-lg backdrop-blur-md">  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="text-blue-700">
    <circle cx="12" cy="12" r="9" stroke="#00e1ae" strokeWidth="1.8"></circle>
    <path d="M15.75 8.25L13.55 13.55L8.25 15.75L10.45 10.45L15.75 8.25Z" fill="#00e1ae" stroke="#00e1ae" strokeWidth="1.2" strokeLinejoin="round"></path>
    <circle cx="12" cy="12" r="1.15" fill="white"></circle>
  </svg>
  <span className="hidden mapper-logo sm:inline font-black text-sm tracking-tighter text-zinc-950">Mapper</span>
</div>
        <section className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-md rounded-2xl border border-white/60 bg-white/90 p-5 shadow-2xl backdrop-blur-md">
          {!selectedAddress ? (
            <div>
              <p className="font-semibold text-zinc-950">
                Choose a delivery location
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                Search for an address or postcode above.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Delivery to
              </p>

              <p className="mt-1 font-medium text-zinc-950">
                {selectedAddress}
              </p>

              <p className="mt-1 text-sm text-zinc-600">{destination}</p>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          {result && (
            <div className="mt-4 border-t border-zinc-200 pt-4">
              <p className="text-sm text-zinc-600">
                Approximately {result.distanceMiles} road miles
              </p>

              {result.deliveryPrice === null ? (
                <p className="mt-2 text-xl font-bold text-zinc-950">
                  Contact us for an individual quote
                </p>
              ) : (
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Estimated delivery
                    </p>

                    <p className="text-4xl font-bold tracking-tight text-zinc-950">
                      £{result.deliveryPrice}
                    </p>
                  </div>

                  <p className="pb-1 text-right text-xs text-zinc-500">
                    Ground floor
                  </p>
                </div>
              )}

              {result.m25CheckRequired && (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                  An additional £50 may apply if the address is inside the M25.
                </p>
              )}

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                An additional £75 applies for each flight of up to 13 steps,
                subject to a safe-access assessment.
              </p>
            </div>
          )}

          {!result && (
            <button
              type="submit"
              disabled={isLoading || !destination}
              className="mt-5 w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Calculating…" : "Calculate delivery"}
            </button>
          )}

          {result && (
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              {isLoading ? "Recalculating…" : "Recalculate"}
            </button>
          )}
        </section>
      </form>
    </main>
  );
}

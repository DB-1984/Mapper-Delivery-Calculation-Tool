/**
 * Works with the Google API to display the
 * map and predictive search field
 */

"use client";

import { useEffect, useRef, useState } from "react";

import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

import type { SelectedLocation } from "@/types/delivery";

type LocationPickerProps = {
  onSelect: (location: SelectedLocation) => void;
};

type MapPosition = {
  lat: number;
  lng: number;
};

type PlaceSelectionEvent = Event & {
  placePrediction: google.maps.places.PlacePrediction;
};

// Banbury town centre
const defaultPosition: MapPosition = {
  lat: 52.0629,
  lng: -1.3398,
};

// LocationPicker returns LocationPickerContent wrapped in Google's APIProvider,
// which makes the Google Maps services available to its child components.
//
// When the user selects an address, LocationPickerContent updates the map position
// and calls onSelect with the selected location. In the parent, onSelect refers to
// handleLocationSelect, which stores the postcode and address for the quote.
//
// LocationPickerContent's useEffect creates the Google autocomplete element and
// event listener. Because that effect uses onSelect, onSelect is a dependency.
// The parent uses useCallback to preserve the function's identity and prevent
// the autocomplete UI and event listener from being rebuilt unnecessarily.
export default function LocationPicker({ onSelect }: LocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
        Google Maps API key is missing.
      </p>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <LocationPickerContent onSelect={onSelect} />
    </APIProvider>
  );
}

function LocationPickerContent({ onSelect }: LocationPickerProps) {
  const places = useMapsLibrary("places");
  const autocompleteContainer = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MapPosition>(defaultPosition);
  const [selectionError, setSelectionError] = useState("");
    
  // Wait for the Google Places library to become available, then create
  // and configure the autocomplete element and its event listener.
  useEffect(() => {
    const container = autocompleteContainer.current;

    if (!places || !container) {
      return;
    }

    const autocomplete = new places.PlaceAutocompleteElement();
    autocomplete.includedRegionCodes = ["gb"];
    autocomplete.placeholder = "Search for an address or postcode";

    // selectPlace, from the API docs, sets the pin on the map
    async function selectPlace(event: Event) {
      setSelectionError("");

      // TypeScript-friendly casting of the event as defined in types (above)
      const selectionEvent = event as PlaceSelectionEvent;
      const place = selectionEvent.placePrediction.toPlace();

      await place.fetchFields({
        fields: ["addressComponents", "formattedAddress", "location"],
      });

      if (!place.location) {
        setSelectionError("Google could not locate that address.");

        return;
      }

      const postcodeComponent = place.addressComponents?.find((component) =>
        component.types.includes("postal_code")
      );

      const postcode = postcodeComponent?.longText;

      if (!postcode) {
        setSelectionError("No postcode was found for that location.");

        return;
      }

      const selectedPosition: MapPosition = {
        lat: place.location.lat(),
        lng: place.location.lng(),
      };

      setPosition(selectedPosition);

      onSelect({
        postcode,
        address: place.formattedAddress ?? postcode,
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
      });
    }

    function handlePlaceSelect(event: Event) {
      void selectPlace(event);
    }

    autocomplete.addEventListener("gmp-select", handlePlaceSelect);

    container.replaceChildren(autocomplete);

    // Remove the Google listener and autocomplete element when the
    // effect reruns or the component is removed from the page.
    return () => {

      autocomplete.removeEventListener("gmp-select", handlePlaceSelect);
      container.replaceChildren();

    };
  }, [places, onSelect]);

  return (
    <div className="absolute inset-0">
      <div className="absolute left-4 right-4 top-4 z-20 mx-auto max-w-md">
        <div className="rounded-2xl border border-white/60 bg-white/90 p-2 shadow-2xl backdrop-blur-md">
          <div ref={autocompleteContainer} className="w-full" />
        </div>
  
        {selectionError && (
          <p
            role="alert"
            className="mt-2 rounded-xl border border-red-100 bg-red-50/95 p-3 text-sm text-red-800 shadow-lg backdrop-blur-md"
          >
            {selectionError}
          </p>
        )}
      </div>
  
      <div className="h-full w-full">
        <Map
          defaultCenter={defaultPosition}
          defaultZoom={12}
          mapId={
            process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ??
            "DEMO_MAP_ID"
          }
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
        >
          <SelectedMarker position={position} />
        </Map>
      </div>
    </div>
  );
}

function SelectedMarker({ position }: { position: MapPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    map.panTo(position);
    map.setZoom(15);
  }, [map, position]);

  return <AdvancedMarker position={position} />;
}

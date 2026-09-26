# Mapper — Delivery Quote Calculator

**[Try the live app](https://mapper-7evj.onrender.com/)** (the Render service may take a minute to wake up).

Mapper is a delivery quotation tool built for an instrument retailer. Staff can search for a UK address or postcode, see the selected location on a map and get an estimated delivery price based on the road distance from the showroom.

## How it works

Google Places autocomplete helps staff select a destination, which is then shown on an interactive map. When they request a quote, a Next.js API route retrieves the road distance through Google’s Distance Matrix API and matches it against fixed mileage bands stored in a local JSON file.

The API request runs on the server, keeping the Distance Matrix key out of the browser. The showroom’s origin postcode is set through an environment variable, and the pricing bands can be updated without adding a database.

## Interface

The responsive layout centres on a full-screen map with floating search and quotation panels. React manages the selected address, loading and error states, and the resulting quote.

## Built with

* Next.js App Router
* React and TypeScript
* Tailwind CSS
* `@vis.gl/react-google-maps`
* Google Maps JavaScript API
* Google Places API
* Google Distance Matrix API
* Local JSON pricing configuration

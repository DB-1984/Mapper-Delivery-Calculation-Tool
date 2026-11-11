# Mapper — Delivery Quote Calculator

**A practical delivery quotation tool built with Next.js, React and TypeScript, integrating Google Maps APIs with configurable distance-based pricing.**

Mapper is a self-directed application developed around a real operational requirement for an instrument retailer: providing quick, consistent delivery estimates based on road distance from the showroom.

Staff can search for a UK address or postcode, view the destination on an interactive map and generate a delivery quotation using predefined mileage bands.

The project demonstrates external API integration, server-side request handling, TypeScript and the separation of business logic from the user interface.

**[Try the Live App](https://mapper.davidbrandondev.com/)** | **[Source Code](https://github.com/DB-1984/Mapper-Delivery-Calculation-Tool)**

---

## Video Demonstration

[![Watch the Mapper demonstration](https://img.youtube.com/vi/ttgnArUTppU/hqdefault.jpg)](https://www.youtube.com/watch?v=ttgnArUTppU)

*Click the image to watch Mapper in action on YouTube.*

---

## Technology Stack

- **Next.js 16 (App Router)** — Application framework and server-side API route
- **React 19** — Interactive user interface and state management
- **TypeScript** — Typed application development
- **Tailwind CSS v4** — Responsive styling
- **@vis.gl/react-google-maps** — React integration with Google Maps
- **Google Maps JavaScript API** — Interactive map rendering
- **Google Places API** — Address and postcode autocomplete
- **Google Distance Matrix API** — Road-distance calculation
- **JSON** — Configurable mileage-based pricing rules

---

## Key Features

### Address Search and Map Integration

Mapper uses Google Places autocomplete to help staff locate delivery destinations.

- Search by UK address or postcode
- Interactive Google Map displaying the selected location
- Responsive map-based interface
- Floating address search and quotation panels

### Distance-Based Delivery Quotes

Once a destination has been selected, staff can request a delivery estimate.

- Road-distance calculation using Google's Distance Matrix API
- Server-side processing through a Next.js API route
- Delivery pricing based on predefined mileage bands
- Showroom origin configured through an environment variable
- Pricing rules stored in a local JSON configuration file

Using road distance rather than straight-line distance provides a more useful basis for delivery estimates.

### Interactive React Interface

React manages the application's interactive behaviour, including:

- Selected delivery address
- Loading states during API requests
- Error handling and user feedback
- Calculated distance and delivery quotation

The interface keeps the quotation process straightforward without requiring staff to navigate multiple pages.

---

## Technical Approach

### Server-Side API Integration

Mapper separates its browser-based interface from the external distance calculation.

The frontend sends a quotation request to a Next.js API route, which communicates with Google's Distance Matrix API.

The resulting road distance is used to determine the appropriate delivery charge.

Keeping this request on the server prevents the Distance Matrix API key from being exposed in client-side JavaScript.

### Configurable Business Logic

Delivery prices are calculated using fixed mileage bands stored in a local JSON file.

This separates the pricing rules from the application interface, making them straightforward to maintain without modifying frontend components or introducing an unnecessary database.

For a relatively small set of predetermined pricing rules, JSON provides a simple and maintainable solution.

### TypeScript and React

The project uses TypeScript with React and Next.js.

React manages the state of the selected location, quotation request and resulting feedback, while TypeScript provides additional structure to the application's data and component interfaces.

### Map-Based User Experience

The interface centres around a full-screen Google Map, with floating controls for address selection and quotation results.

Tailwind CSS provides responsive styling, while `@vis.gl/react-google-maps` integrates Google Maps with React's component architecture.

---

## Application Flow

1. A staff member searches for a UK address or postcode.
2. Google Places autocomplete helps identify the destination.
3. The selected location is displayed on the map.
4. The user requests a delivery quotation.
5. A Next.js API route retrieves the road distance from Google.
6. The distance is matched against the configured mileage bands.
7. The calculated delivery estimate is returned to the interface.

---

## Local Development

### Requirements

- Node.js and npm
- Google Maps Platform API credentials
- Access to the required Google Maps, Places and Distance Matrix APIs

### Installation

Clone the repository:

```bash
git clone https://github.com/DB-1984/Mapper-Delivery-Calculation-Tool.git
```

Navigate into the project directory:

```bash
cd Mapper-Delivery-Calculation-Tool
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables in `.env.local`.

You'll need to supply your own Google Maps API credentials and showroom origin postcode. The client-side Maps/Places key and server-side Distance Matrix key should be configured according to the environment variable names used in the source code.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

For a production build:

```bash
npm run build
npm run start
```

---

## Project Context

Mapper was developed as a portfolio project based on a practical requirement from my commercial experience in musical instrument retail.

Delivery quotations can involve significant variation in road distance, making consistent mileage-based pricing useful for day-to-day operations.

The project provided an opportunity to combine business requirements with a modern React and Next.js application, integrating external services while keeping pricing logic configurable and API requests appropriately separated between client and server.

---

## Links

- **Live Application:** https://mapper.davidbrandondev.com/
- **Video Demonstration:** https://www.youtube.com/watch?v=ttgnArUTppU
- **Source Code:** https://github.com/DB-1984/Mapper-Delivery-Calculation-Tool
- **Developer Portfolio:** https://davidbrandondev.com/
- **GitHub Profile:** https://github.com/DB-1984

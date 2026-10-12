# Little Lemon

A responsive Little Lemon restaurant landing page and table reservation app built with React, Material UI, and Vite. The booking API runs locally on Node.js and stores reservations in `server/data/bookings.json`.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local Vite URL shown in the terminal (usually `http://localhost:5173`).

The development command starts both the React site and booking API. The API listens on port 3001; Vite proxies `/api` requests to it. To build the frontend, run `npm run build`. To run just the API, use `npm run start:api`.

## Booking API

- `GET /api/health` — service status
- `GET /api/availability?date=YYYY-MM-DD&guests=2` — current capacity by dining time
- `POST /api/bookings` — validates and saves a reservation; responds with HTTP 409 if that time has filled

Each dining time seats up to 24 guests. Reservation dates can be booked up to 90 days ahead in the interface. Bookings are stored locally as JSON; this is intended as a self-contained demo app rather than a production reservation service.
# little-lemon

# ParkShare — Frontend (Phase 1)

Smart Parking for a Smarter Tomorrow. React + Vite + Tailwind CSS, running on sample data.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Structure

```
src/
  components/
    ui/        Button, Badge, Logo, Rating, SectionHeading
    layout/    Navbar, Footer, Layout
    landing/   Hero, HowItWorks, Features, Audience, CallToAction
    parking/   MapView, SpaceCard, SpaceCardSkeleton
    owner/     EarningsChart
  pages/       Landing, FindParking, SpaceDetails, ActiveParking, OwnerDashboard, Auth, NotFound
  data/        mockData.js      realistic sample data
  services/    api.js           set USE_MOCK = false to call the real backend
  hooks/       useReveal.js
  utils/       format.js
```

## Connecting the backend later

All data access goes through `src/services/api.js`. Flip `USE_MOCK` to `false`, set `VITE_API_URL`,
and keep the same response shapes. `MapView` takes `spaces`, `selectedId`, `onSelect`, so a Google Maps
or Mapbox implementation can replace it without touching the pages.

## Authentication
`/auth` (log in), `/auth?mode=signup`, `/auth?mode=forgot`. Login is live and talks to the Express + MongoDB
backend in `../backend` (see its README for setup). The API URL defaults to `http://localhost:5000/api`;
override it with `VITE_API_URL` in a `.env` file. Parking spaces and bookings still use sample data.

After login, drivers go to Find Parking; space owners and the admin go to the owner dashboard.

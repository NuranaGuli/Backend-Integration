# Welcome to 05 Backend Integration
***

## Task

The challenge in this project was connecting a Next.js 15 frontend to a real backend — not just building UI, but making authentication, protected routes, data validation, and state management all work together end-to-end.

The specific hard parts were: getting JWT-based auth to flow correctly through middleware without breaking Server Actions, handling Zod validation errors cleanly across both the API layer and Server Actions, and keeping everything strictly typed with no `any` anywhere in the codebase.

## Description

I built **CyberKey Game Store** — a digital game key marketplace where admins manage game listings and track purchase orders through a protected dashboard.

**Authentication** runs through `/api/auth/` routes and a parallel set of Server Actions (`app/actions/authActions.ts`). Passwords are hashed with bcrypt (10 rounds). On successful login, a signed JWT is stored as an `httpOnly` cookie named `gk_token`. The `middleware.ts` file intercepts all requests to `/api/vault`, `/api/orders`, `/api/allocation`, and `/dashboard`, runs `jwtVerify` from `jose`, and returns `401` before the route handler is even reached if the token is missing or expired.

**Validation** is centralised in `lib/validations/authSchemas.ts` using Zod. The `PlayerRegistrationSchema` enforces email format, minimum 8-character security key, at least one uppercase letter, at least one digit, and a server-side `.refine()` check that both key fields match. The same schemas are imported by both the API routes and the Server Actions so there's no duplicated logic.

**Data** is stored in global in-memory arrays (`lib/gameVault.ts`) with a real bcrypt-hashed seed account so the app works immediately after `npm run dev` — no database setup needed. The seed data includes 5 game listings and 4 purchase orders across all delivery states.

On the frontend, form submissions go through **Server Actions** with `useTransition` for pending states. Dashboard data is fetched with **TanStack React Query v5** and auto-refreshes every 8 seconds.

## Installation

```bash
git clone https://github.com/NuranaGuli/Backend-Integration.git
cd Backend-Integration
npm install
```

Create a `.env.local` file:

```bash
JWT_SECRET=your_secret_key_here
```

## Usage

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the root page redirects to `/login`.

**Sign in immediately** with the pre-seeded admin account:

```
playerEmail:  admin@cyberkey.gg
securityKey:  Admin123
```

Or register a new account at `/register` (security key must be at least 8 characters, include one uppercase letter and one digit).

After signing in you'll land on `/dashboard` where you can:

- Browse the game vault (5 pre-seeded titles, auto-refreshes every 8 seconds)
- Add a new game listing via **Add Game Listing**
- Log a purchase order via **Log Purchase Order**
- Track delivery states: `pending → processing → fulfilled → refunded`

**Test the API directly:**

```bash
# Login and save the session cookie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"playerEmail":"admin@cyberkey.gg","securityKey":"Admin123"}'

# Fetch all game listings (requires auth)
curl http://localhost:3000/api/vault -b cookies.txt

# Add a new game listing
curl -X POST http://localhost:3000/api/vault \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Hollow Knight",
    "retailPrice": 9.99,
    "availableKeys": 50,
    "genre": "indie",
    "platform": "steam",
    "ageRating": "PEGI 7",
    "publisher": "Team Cherry"
  }'

# Fetch all orders
curl http://localhost:3000/api/orders -b cookies.txt
```

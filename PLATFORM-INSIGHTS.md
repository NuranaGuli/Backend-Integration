# PLATFORM-INSIGHTS — CyberKey Game Store/enterprise-platform

This document outlines the core technical decisions, data flow, and engineering rationales behind the CyberKey platform.

---

## 1. Project Overview & Data Layer

CyberKey is a digital storefront designed for video game license key distribution, featuring player onboarding, inventory ingestion, and an order processing pipeline.

* **In-Memory Store:** For prototyping speed, data is stored in volatile collections (`global._playerAccounts`, `global._gameProducts`). 
* **State Preservation:** Collections are pinned to the Node.js global scope to persist across Next.js Fast Refresh cycles during development.
* **Production Path:** Data structures map directly onto Prisma models, decoupling the architecture to support a seamless migration to PostgreSQL/SQLite later.

---

## 2. Core Data Models (`lib/gameVault.ts`)

* **GameProduct** (Inventory Catalog): `id, title, retailPrice, availableKeys, genre, platform, ageRating, publisher`
* **PurchaseOrder** (Transaction Logs): `id, gameId, unitCount, deliveryState, customerId, grandTotal`
  * *State Pipeline:* Moves sequentially through `pending → processing → fulfilled → refunded`.
* **PlayerAccount** (Identity & Access): `id, playerEmail, hashedSecurityKey, accountTier`
  * *Privilege Tiers:* `admin` | `moderator` (manages Content Safety / Block Lists) | `player`

---

## 3. Authentication & Gatekeeping

* **Edge-Compatible JWT:** Session security uses the `jose` library because standard libraries like `jsonwebtoken` are incompatible with the Next.js Edge Runtime mühiti.
* **Cookie Isolation Matrix:** Tokens are stored under the custom key `gk_token` using `httpOnly: true`, `secure: true` (in production), and `sameSite: "strict"` to mitigate XSS and CSRF vectors.
* **Next.js 15 Async Headers:** Every authentication action explicitly triggers `await cookies()` upfront to prevent request context dropping during downstream async operations.
* **Centralized Middleware:** Stateless token verification is handled centrally in `middleware.ts` for `/api/vault/*`, `/api/orders/*`, `/api/allocation/*`, and `/dashboard/*`. Open endpoints like `/api/auth/*` are explicitly bypassed.

---

## 4. Decoupled Ingestion Layers (Actions vs. APIs)

* **Server Actions (`app/actions/`):** Processes `FormData` using native `"use server"` pipelines. This eliminates manual client-side fetch abstractions and leverages Progressive Enhancement.
* **API Routes (`app/api/`):** Exposes standard RESTful endpoints to provision clean integration points for external programmatic clients, automation scripts, and mobile platforms.

---

## 5. State Management & Synchronization

* **Client State:** Global state engines (e.g., Redux, Zustand) are omitted. Identity tracking is managed via a lightweight `PlayerSessionContext`.
* **Server State Synchronization:** Managed through `@tanstack/react-query`. The system uses short-polling (`refetchInterval: 8000`) inside the dashboard to keep data reactive without persistent socket overhead.
* **Cache Controls:** Configured with `staleTime: 30000` to prevent redundant network fetches when switching tabs or window focus.

---

## 6. Defensive Validation Strategy (`lib/validations/`)

All read/write boundaries are secured with strict Zod runtime schemas. When structural validation fails, the backend enforces a flattening mechanism:

```typescript
const fieldErrors = validatedFields.error.flatten().fieldErrors;
const allViolations = Object.values(fieldErrors).flat().filter(Boolean) as string[];

Engineering Rationale: Zod’s raw error stacks return deeply nested arrays. Flattening reduces anomalies into a predictable flat string[] array. This eliminates server-side crashes from missing properties and maps cleanly into the client-side error handler (outcome.violations?.[0]).

```

## 7. Next.js 15 & React 19 Paradigms
Async Context Mapping: Folder-level dynamic parameters ([id]/route.ts) are evaluated asynchronously (const { id } = await params;) per Next.js 15 structural standards.

Non-Blocking UI Transactions: Mutations on the frontend use React 19’s useTransition hook. Wrapping network submissions in startTransition maintains layout interactivity and keeps loading states fluid during backend latency.

## 8. Styling Framework Tokenization
The frontend implements Tailwind CSS v4 but extracts core theme configurations into CSS Custom Properties in globals.css (--gk-void, --gk-accent, --gk-panel).

Engineering Rationale: This keeps the layout easily themeable at the root CSS engine level without relying on bloated theme configuration files, making it simple to inject tokens directly via dynamic style variables (style={{ color: "var(--gk-accent)" }}).
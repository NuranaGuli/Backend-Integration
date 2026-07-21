# Frontend API Integration Guide

This document is a practical handoff for the frontend team. It describes the available API routes, the expected request payloads, and the response shapes the UI should expect when integrating with the backend.

## Base URL

All API routes are exposed through the Next.js app on the same host:

- Local development: http://localhost:3000

For frontend code, use relative paths such as /api/auth/login or /api/vault.

## Authentication model

Authentication is cookie-based.

- After a successful login, the backend sets a cookie named gk_token.
- Follow-up requests that need user context should keep the cookie automatically in the browser.
- The frontend should not manually attach an Authorization header unless the backend is changed later.

### Login

- Method: POST
- Path: /api/auth/login
- Body:

```json
{
  "playerEmail": "admin@cyberkey.gg",
  "securityKey": "secret123"
}
```

Success response:

```json
{
  "sessionEstablished": true
}
```

### Register

- Method: POST
- Path: /api/auth/register
- Body:

```json
{
  "playerEmail": "new-player@example.com",
  "securityKey": "secret123"
}
```

Success response (201):

```json
{
  "id": "pa3",
  "playerEmail": "new-player@example.com",
  "accountTier": "player"
}
```

### Get current profile

- Method: GET
- Path: /api/auth/me
- Requires the gk_token cookie.

Success response:

```json
{
  "id": "pa1",
  "playerEmail": "admin@cyberkey.gg",
  "accountTier": "admin"
}
```

### Logout

- Method: POST
- Path: /api/auth/logout
- Clears the authentication cookie.

## Vault endpoints

These routes manage the game vault catalog.

### List all vault entries

- Method: GET
- Path: /api/vault

Example response:

```json
[
  {
    "id": "gp1",
    "title": "Cyberpunk 2077 Ultimate Edition",
    "retailPrice": 29.99,
    "availableKeys": 150,
    "genre": "rpg",
    "platform": "steam",
    "ageRating": "PEGI 18",
    "publisher": "CD Projekt RED"
  }
]
```

### Create a vault entry

- Method: POST
- Path: /api/vault
- Body:

```json
{
  "title": "New Game",
  "retailPrice": 19.99,
  "availableKeys": 100,
  "genre": "indie",
  "platform": "epic",
  "ageRating": "PEGI 12",
  "publisher": "Studio Name"
}
```

### Get one vault entry

- Method: GET
- Path: /api/vault/:id

### Update one vault entry

- Method: PUT
- Path: /api/vault/:id
- Body: any subset of the vault properties.

### Delete one vault entry

- Method: DELETE
- Path: /api/vault/:id

## Orders endpoints

These routes manage purchase orders.

### List orders

- Method: GET
- Path: /api/orders

Example response:

```json
[
  {
    "id": "po1",
    "gameId": "gp1",
    "unitCount": 2,
    "deliveryState": "pending",
    "customerId": "c1",
    "grandTotal": 59.98
  }
]
```

### Create an order

- Method: POST
- Path: /api/orders
- Body:

```json
{
  "gameId": "gp1",
  "unitCount": 2,
  "deliveryState": "pending",
  "customerId": "c1",
  "grandTotal": 59.98
}
```

### Get one order

- Method: GET
- Path: /api/orders/:id

### Update one order

- Method: PUT
- Path: /api/orders/:id
- Body: any subset of the order properties.

### Delete one order

- Method: DELETE
- Path: /api/orders/:id

## Allocation endpoints

These are lightweight read/write routes for stock allocation data.

### List allocation snapshot

- Method: GET
- Path: /api/allocation

### Update allocation for a game

- Method: PUT
- Path: /api/allocation/:id
- Body:

```json
{
  "availableKeys": 75
}
```

## Request conventions

- Send JSON bodies with Content-Type: application/json.
- Use fetch with credentials: "include" so the browser preserves the auth cookie.
- For forms, prefer a standard POST request and parse the JSON response.

Example:

```ts
const response = await fetch("/api/vault", {
  method: "GET",
  credentials: "include",
});

const data = await response.json();
```

## Error handling

The API returns JSON error payloads with standard HTTP status codes.

Common codes:

- 400: malformed JSON or invalid body
- 401: missing or invalid session
- 404: resource not found
- 409: duplicate account registration
- 422: validation failure

Example error body:

```json
{
  "error": "Authentication failed — the supplied credentials do not match our records."
}
```

## Frontend integration notes

- The UI can call the routes above without changing the current page structure.
- Preserve the existing cookie-based login flow for authenticated requests.
- If a request fails, show the returned error message in the UI instead of assuming a successful response.

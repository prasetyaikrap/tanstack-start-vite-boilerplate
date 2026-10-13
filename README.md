# TanStack Start Vite Boilerplate

A starter template for building full-stack React applications with **TanStack Start**, server-side rendering, and a typed data layer for talking to REST APIs.

## Tech Stack

| Concern | Library |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR, server functions) on [Vite](https://vite.dev/) + [Nitro](https://nitro.build/) |
| Routing | [TanStack Router](https://tanstack.com/router) — file-based |
| Data fetching | [TanStack Query](https://tanstack.com/query) with SSR integration |
| Tables | [TanStack Table](https://tanstack.com/table) |
| UI | [Chakra UI v3](https://chakra-ui.com/), [lucide-react](https://lucide.dev/) icons, `next-themes` (color mode) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| API contracts | Zod schemas + a typed `RestClient` |
| i18n | [i18next](https://www.i18next.com/) (`en`, `id`) |
| Pattern matching | [ts-pattern](https://github.com/gvergnaud/ts-pattern) |
| Lint / format | [Biome](https://biomejs.dev/) |
| Tests | [Vitest](https://vitest.dev/) + Testing Library |
| Runtime / package manager | [Bun](https://bun.sh/) |

## Project Structure

```
.
├── public/
│   └── locales/{en,id}/common.json   # Translations, loaded over HTTP
├── src/
│   ├── routes/                       # File-based routes (__root.tsx = document shell + providers)
│   ├── router.tsx                    # Router + TanStack Query SSR integration
│   ├── components/
│   │   ├── forms/                    # React Hook Form inputs (input, select, combobox, daypicker, ...)
│   │   ├── layouts/                  # App providers, admin layout, Authenticated, CanAccess
│   │   ├── table/                    # Data table built on TanStack Table (filters, sorting, pagination)
│   │   └── ui/                       # Chakra-based UI pieces (toaster, empty state, file upload, ...)
│   ├── configs/                      # envs, cookies, metadata, constants, permissions
│   ├── contexts/resource-provider/   # Exposes auth/data/menu/RBAC providers to components
│   ├── hooks/                        # useList, useOne, useCreate, useUpdate, useDelete, useTable,
│   │                                 # useInfiniteList, useSSEventStream, usePermission, ...
│   ├── providers/
│   │   ├── rest-client/              # Typed fetch client built from route contracts
│   │   ├── data/                     # Data providers (one per API), interceptors, response handlers
│   │   │   └── api/                  # Zod schemas + route contracts per API
│   │   ├── authentications/          # AuthProvider (login / check / logout)
│   │   ├── rbac/                     # Permission checks for routes and components
│   │   ├── menus/                    # Sidebar menu definition
│   │   ├── i18n/                     # i18next setup
│   │   └── tanstack-query/           # QueryClient + router context
│   ├── types/                        # Shared types (ApiError, pagination, metadata, ...)
│   ├── utils/                        # Server functions (cookies), API error helpers, metadata
│   └── styles/
├── biome.json
├── vite.config.ts
└── tsconfig.json                     # Path alias: @/* → src/*
```

## Prerequisites

- [Bun](https://bun.sh/) 1.x
- A backend API (see [Backend API Contract](#backend-api-contract)). The default data provider points to a public mock API, so the app runs without one.

## Getting Started

```bash
bun install
bun run dev           # http://localhost:3000
```

### Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the dev server on port 3000 |
| `bun run build` | Production build |
| `bun run serve` | Preview the production build |
| `bun run test` | Run Vitest |
| `bun run lint` | Biome lint |
| `bun run format` | Biome format |
| `bun run check` | Biome lint + format + import sorting |

### Environment Variables

Set them in a `.env` file (all are optional). All variables are read in `src/configs/envs.ts`. Only `VITE_`-prefixed variables are exposed to the browser.

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_ENV` | `development` | Environment name; enables i18n debug logs in development |
| `VITE_APP_HOST` | `http://localhost:3000` | Public URL of this app (used to load translations) |
| `VITE_APP_ID` | `TANSTACK-VITE-BOILERPLATE` | Sent as `X-Client-Id` on every API request, and used to prefix cookie names. Must be allowed by the backend |
| `VITE_APP_VERSION` | `dev-environment-v0.0.0` | Sent as `X-Client-Version` |
| `VITE_APP_AUTH_SERVICE_HOST` | `http://localhost:4000` | Base URL of the authentication service |
| `VITE_APP_USE_MOCK` | `false` | Reserved for a mock mode; not used yet |
| `VITE_APP_GOOGLE_ADSENSE_ACCOUNT` | — | Enables Google AdSense scripts when set |

## Architecture

Providers are created once in `src/providers/tanstack-query/root-provider.tsx`, passed through the **router context**, and exposed to components by `ResourceProvider`:

```
router context ─► authProvider    login / check / logout
               ─► dataProviders   one per backend API (auth, default, ...)
               ─► rbacProvider    permission checks
               ─► menuProvider    sidebar menu
               ─► queryClient     TanStack Query (shared with SSR)
```

Components never call `fetch` directly — they use the data hooks, which call a data provider, which calls a typed `RestClient`.

```
component ─► useList / useOne / useCreate / ... ─► dataProviders[name] ─► RestClient ─► API
```

## Data Layer

### 1. Describe the API with a contract

Each API has a contract of routes with Zod schemas (`src/providers/data/api/*-schema.ts`). The contract types every call's params, query, payload and response.

```ts
// src/providers/data/api/order-schema.ts
import z from "zod";
import { contract } from "@/providers/rest-client/handler";
import { schema as BaseSchema } from "./base";

const { BaseResponse, BaseResponses, BaseErrorResponse } = BaseSchema;

export const orderRouter = contract({
	orderList: {
		method: "GET",
		path: "/v1/orders",
		response: { 200: BaseResponses, 400: BaseErrorResponse, 500: BaseErrorResponse },
	},
	orderDetail: {
		method: "GET",
		path: "/v1/orders/:id",
		params: z.object({ id: z.string() }),
		response: { 200: BaseResponse, 404: BaseErrorResponse },
	},
});
```

`:id` in a path is replaced from `params`. A `FormData` payload is sent as multipart; anything else is sent as JSON.

### 2. Add a data provider

A data provider maps generic operations (`getList`, `getOne`, `create`, `update`, `delete`, optional `stream`) to the API's routes. Use `auth-provider.ts` and `mock-provider.ts` as references.

```ts
// src/providers/data/order-provider.ts
export function orderProvider(): DataProvider<ResourceKeys> {
	const client = new RestClient({ baseUrl: ENVS.APP_ORDER_SERVICE_HOST, routers: orderRouter });
	client.addRequestInterceptor(authRequestInterceptor);
	client.addResponseInterceptor(authResponseInterceptor);
	const service = client.init();

	return {
		getList: async ({ resource, filters, sorters, pagination, meta }) => {
			const query = generateParams(filters, sorters, pagination, {
				paginationMode: meta?.paginationMode,
				useQueryField: true, // filters as one JSON "queries" param — see Backend API Contract
			});
			return match({ resource })
				.with({ resource: "orderList" }, () =>
					service.orderList({ query }).then(responsesOk).catch(responseError),
				)
				.otherwise(() => Promise.reject(responseError(resourceNotFoundError)));
		},
		// getOne, create, update, delete follow the same pattern
	};
}
```

Then register it:

```ts
// src/providers/data/index.ts
export const dataProviders = {
	auth: authProvider(),
	default: mockProvider(),
	orders: orderProvider(),
};
```

### 3. Use it from components

```tsx
const { queryResult } = useList({
	dataProviderName: "orders",
	resource: "orderList",
	pagination: { currentPage: 1, pageSize: 20 },
	filters: [{ field: "status", value: "paid" }],
	sorters: [{ field: "created_at", order: "desc" }],
});

const createOrder = useCreate({
	dataProviderName: "orders",
	resource: "orderCreate",
	onError: (error) => showErrorToast(error),
});
```

| Hook | Use for |
|---|---|
| `useList` / `useInfiniteList` | Paginated lists (page, infinite or cursor mode) |
| `useTable` | A list wired to TanStack Table (sorting, filters, pagination state) |
| `useOne` | A single record |
| `useCreate` / `useUpdate` / `useDelete` | Mutations |
| `useSSEventStream` | Server-Sent Event streams (e.g. LLM responses) |

`dataProviderName` defaults to `"default"`.

## Authentication

- Tokens are stored in **httpOnly cookies** (`<app_id>_access_token`, `<app_id>_refresh_token`), read and written through TanStack Start server functions (`src/utils/server-actions.ts`).
- `authRequestInterceptor` adds `X-Client-Id`, `X-Client-Version`, `Content-Type` (except for `FormData`) and `Authorization: Bearer <access token>` to every request.
- `authResponseInterceptor` handles expired tokens: on a `401` it calls the auth service's renew endpoint with the refresh token and `X-Renew-Token: true`, stores the new tokens, and retries the original request once. If renewal fails, both cookies are deleted.
- `AuthProvider` (`src/providers/authentications`) exposes `login`, `check` and `logout`. Its methods are placeholders to implement against your auth service; `components/layouts/authenticated.tsx` is the layout guard for authenticated pages.

## Error Handling

Every failed API call rejects with the same `ApiError` shape (`src/types/core.ts`):

```ts
type ApiError = {
	code: number;          // HTTP status
	message: string;       // safe to show to users
	data?: unknown;
	error?: { id: string; type: string; code: number; data?: unknown }; // backend error detail
	requestId?: string;    // X-Request-Id response header
};
```

Show it with `showErrorToast` (`src/utils/api-error.ts`). It displays the message plus an **Error ID** — the backend's error `id`, which matches the server log line, falling back to the request ID — so users can quote it to support:

```ts
useUpdate({ resource: "orderUpdate", onError: (error) => showErrorToast(error, "Could not save the order") });
```

## Streaming (Server-Sent Events)

`useSSEventStream` calls a data provider's `stream` method and dispatches each event to a handler by event name. Each event's `data:` lines are joined with `\n` and JSON-parsed; if parsing fails, the handler receives the raw string.

```tsx
const chat = useSSEventStream<ChatInput, { token: { token: string }; complete: string }>({
	dataProviderName: "agents",
	resource: "agentChat",
	events: {
		token: ({ token }) => appendToMessage(token),
		complete: () => markDone(),
		error: (error) => showErrorToast(error),
	},
});

chat.mutate({ message: "Hello" });
chat.abort(); // cancel the in-flight stream
```

## Permissions and Menus

- Define permission keys in `src/configs/permissions`. Check them with `usePermission().rbacProvider.hasPermission([...])`, or wrap UI in `<CanAccess permissions={[...]}>`.
- Protect routes with `rbacProvider.checkRoutePermission(...)` in a route's `beforeLoad`. It redirects to `/login` when unauthenticated and `/unauthorized` when the user lacks the permission.
- The sidebar menu is defined in `src/providers/menus/index.tsx`.

## Internationalization

Translations live in `public/locales/<lang>/common.json` and are loaded over HTTP from `VITE_APP_HOST`. Supported languages are `en` (fallback) and `id`; the browser language is detected automatically. Use the `useTranslation` hook in components.

## Routing

Routes are files in `src/routes` (TanStack Router file-based routing); `src/routeTree.gen.ts` is generated — do not edit it. `src/routes/__root.tsx` renders the HTML document, metadata and app providers.

Folders or files inside `src/routes` named `components`, `utils`, `hooks`, `types`, `type`, `schema` or `constants` are **not** treated as routes (see `routeFileIgnorePattern` in `vite.config.ts`), so route-specific code can live next to its route:

```
src/routes/orders/
├── index.tsx          # /orders
├── $id.tsx            # /orders/:id
├── components/        # not a route
└── schema.ts          # not a route
```

## Backend API Contract

The frontend and backend are independent, but the data layer expects a REST API with these conventions (the same ones the companion Go Echo boilerplate uses):

**Request headers** — sent automatically by the interceptors:

| Header | Value |
|---|---|
| `X-Client-Id` | `VITE_APP_ID` — must be in the backend's allowed client IDs |
| `X-Client-Version` | `VITE_APP_VERSION` |
| `Authorization` | `Bearer <access token>` |
| `X-Renew-Token` | `true` — only on the token renew request |

The backend's CORS configuration must allow these headers and expose `X-Request-Id`.

**Responses:**

```jsonc
// Success
{ "code": 200, "message": "...", "data": { } }

// List
{ "code": 200, "message": "...", "data": [ ],
  "metadata": { "total_count": 120, "total_page": 6, "current_page": 1, "per_page": 20,
                "next_cursor": "…", "prev_cursor": "…" } }   // cursors only for cursor pagination

// Error
{ "code": 404, "message": "Order not found",
  "error": { "id": "e2f9…", "type": "NOTFOUND_ERROR", "code": 404, "data": null } }
```

**List query parameters** (built by `generateParams`):

| Parameter | Example | Meaning |
|---|---|---|
| `_page` | `2` | Page number |
| `_limit` | `20` | Page size |
| `_sort` | `-created_at,name` | Comma-separated fields; `-` prefix for descending |
| `queries` | `{"status":"paid"}` | Filters as one JSON object (when `useQueryField: true`); otherwise each filter is its own parameter |

**Streaming:** `text/event-stream` with `event:` names and JSON `data:` lines; an `error` event carries the error body above.

## Code Style

- Biome formats with tabs and sorts imports — run `bun run check` before committing.
- Import from `src` with the `@/` alias.
- Multi-word file names use kebab-case (`form-input.tsx`, `auth-provider.ts`); hooks use `useSomething.ts`.

## Author

**Prasetya Ikra Priyadi** — [mail@prasetyapriyadi.my.id](mailto:mail@prasetyapriyadi.my.id)

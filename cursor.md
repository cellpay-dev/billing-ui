# Billing Analytics UI – Project Context

Use this file as the single source of truth for local context, conventions, and structure. Refer to it when making changes so behavior stays consistent.

---

## Stack & structure

- **Frontend**: Vanilla JS (no framework). Static assets under `public/static/`.
- **Key files**:
  - `public/static/api.js` – All backend API calls, axios instance, `getApiErrorMessage`, auth.
  - `public/static/app.js` – UI, routing, permissions, CRM, reports, modals.
  - `public/static/config.js` – App config (e.g. backend URL, auth keys).
  - `public/static/style.css` – Styles (Tailwind-style classes used in markup).
- **Backend**: REST API; base URL from `window.AppConfig?.api?.backendUrl` or `/analytics/api`. Auth via Bearer token in `localStorage` (key from config). Signin response may include `expiresAt` (ISO date); when present it is stored and used to proactively clear session and redirect to login before sending requests with an expired token. `window.isSessionExpired()` (api.js) returns true when stored `expiresAt` is in the past.

---

## Server, build & deployment

- **src/index.tsx** – Hono app entry: defines routes and serves HTML. Serves static from `/static/*` (root `./`). Routes: `GET /` (main SPA shell: sidebar, `#main-content`, scripts load `/static/api.js` and `/static/app.js`), `GET /login` (login page with form and api.js), `GET /logout` (clears storage and redirects to login). All app HTML is inlined in this file; changing layout or script order requires editing index.tsx.
- **src/renderer.tsx** – Hono JSX layout (`jsxRenderer`) wrapping content in `<html><head><link style.css></head><body>{children}</body></html>`. Not used by the current index routes (they use `c.html(...)` strings). Kept for potential future JSX-rendered pages.
- **scripts/build-tomcat.mjs** – Tomcat deployment build. Runs the dev server, fetches `/`, `/login`, `/logout`, injects `<base href="/billing-analytics/">` and `window.APP_BASE`, rewrites static paths and redirects for context path, strips Vite client script, writes `dist-tomcat/` (index.html, login.html, logout.html + `static/` copy). Run before deploying to Tomcat at context path `/billing-analytics`. Requires `npm run dev` to be available; run from project root (e.g. `node scripts/build-tomcat.mjs`).

---

## API & error handling

- **All API calls** go through the axios instance in `api.js` (request interceptor adds `Authorization: Bearer <token>`; response interceptor handles 401 → clear storage and redirect to login).
- **Error messages**: Use `window.getApiErrorMessage(error)` everywhere a caught API error is shown to the user. It reads backend body (`message`, `error`, `errorMessage`, `msg`, or `errors[]`) and returns a safe, user-facing string. Never show raw `error.message` (e.g. "Request failed with status code 500") when a friendly or backend message can be shown.
- **Inline error UI**: Use `getApiErrorDisplay(err, { title: '...' })` (in app.js) for card-style error blocks; it uses `getApiErrorMessage` and styles 403 (amber) vs other (red).

---

## Roles & permissions

- **Roles**: `admin`, `manager`, `sales` only. Backend may send `roles` array or string (e.g. `ROLE_ADMIN`); normalized in app to `admin` | `manager` | `sales`.
- **Permission check**: `hasPermission('permissionKey')` (e.g. `hasPermission('manageCarrierMargins')`, `hasPermission('viewReports')`). Defined in `PERMISSIONS` in app.js.
- **Admin-only actions**: Gate create/edit/delete with `hasPermission('...')`; hide or disable buttons and columns for non-admin. Non-admin can still view list and detail (e.g. CRM, Carrier Margin popup).

---

## Employee Management (auth users)

- **List**: `GET /api/auth/users` – returns `[{ id, userName, name, email, role, enabled }]`. Role is one of `admin`, `manager`, `sales`.
- **Create**: `POST /api/auth/users` – body: `{ username, password, role, name, email }`; role required, one of admin/sales/manager. Response includes created user and `message`.
- **Update**: `PUT /api/auth/users` – body: `{ id, name?, email?, role?, password?, enabled? }`; optional password to change password. Response includes updated user and `message`.
- **UI**: Employees page uses `fetchAuthUsers`, `createAuthUser`, `updateAuthUser` from api.js. Add/Edit gated by `addEmployee`/`editEmployee` permissions. Edit and Reset password use `data-employee-id` + event listeners (no user content in onclick).

---

## B2B CRM & carrier margins

- **Clients list**: `GET /api/b2b/crm/clients` – returns items with `clientId`, `clientCode`, `partnerName`, etc. Use `clientId` (or `id`) for create carrier margin.
- **Create client**: `POST /api/b2b/crm/clients` – body: `{ partnerName, emailTo, status?, storeId, creditLimit? }`. Admin only (`addB2BClient` permission). Status `active` (enabled) or `inactive` (disabled).
- **Update client**: `PUT /api/b2b/crm/clients` – body: `{ clientId, partnerName?, emailTo?, status?, creditLimit? }`. `clientId` required. Admin only (`updateB2BClient` permission). Status typically `active` (enabled) or `inactive` (disabled).
- **Client details (margins)**: `GET /api/b2b/crm/clients/:clientCode` – returns array of margins with `clientCarrierMarginId`, `carrierName`, `discount`, `fee`, `discountType`, `feeType`, `updatedOn`. Use `clientCarrierMarginId` for update/delete.
- **Carrier margin APIs**: Create `POST /api/b2b/crm/clients/carrier-margins` (body: clientId, carrierId, discount, discountType, fee, feeType). Update `PUT /api/b2b/crm/clients/carrier-margins` (body: clientCarrierMarginId/id, discount, discountType, fee, feeType). Delete `DELETE /api/b2b/crm/clients/carrier-margins/:id`.
- **UI**: "Add B2B Customer" button and create-client modal only when `hasPermission('addB2BClient')` (admin). Modal title `<Client Name> - Carrier Margin`. Add/Create carrier margin only when `hasPermission('manageCarrierMargins')`. Edit client (partnerName, emailTo, status, creditLimit) only when `hasPermission('updateB2BClient')` (admin). Edit/Delete use row data from `data-*` attributes. Carriers dropdown from `GET /api/b2b/carriers` (use `carrierId` or `id`).

---

## Tasks & Tickets API

- **Integration**: All task/ticket requests use the shared axios instance in `api.js` (base URL from `AppConfig.api.backendUrl`, e.g. `/analytics/api`; Bearer token added automatically). Paths are relative: `/tasks`, `/tasks/:id`, `/tickets`, `/tickets/:id`, `/auth/users/assignable`.
- **List (bucketed)**: `GET /api/tasks` and `GET /api/tickets` return `{ assignedToMe: [], openedByMe: [], all?: [] }`. Use each key for tabs ("Assigned to me", "Opened by me", "All" for admin). Item shape: id, title, description, createdBy, assignedTo, creatorName, assigneeName, state (OPEN | IN_PROGRESS | COMPLETED | CANCELLED), createdAt, updatedAt; tickets add priority (LOW | MEDIUM | HIGH | CRITICAL), resolvedAt.
- **Create**: `POST /api/tasks` body `{ title, description?, assignedToUserId }`; `POST /api/tickets` body `{ title, description?, assignedToUserId, priority? }`. Assignee list from `GET /api/auth/users/assignable` (id, username, name)—used only for task/ticket assignment so non-admin users can assign without access to full `/api/auth/users`.
- **Detail**: `GET /api/tasks/:id` and `GET /api/tickets/:id` return full item plus `comments[]` (id, userId, userName, commentText, stateAfter, createdAt).
- **Update**: `PATCH /api/tasks/:id` and `PATCH /api/tickets/:id` with `{ comment?, state?, assignedToUserId? }` (tickets also `priority?`). **Comment is required when sending state or assignedToUserId.** Only admin can set state to CANCELLED for tasks/tickets created by admin; otherwise API returns 400.
- **UI**: Tasks and Tickets pages use bucketed tabs, create modals (gated by addTask/addTicket), and detail pages with update form (gated by editTask/editTicket). Use getApiErrorMessage for all API errors. Enums: state OPEN, IN_PROGRESS, COMPLETED, CANCELLED; priority LOW, MEDIUM, HIGH, CRITICAL.

---

## Conventions

- **Notifications**: `addNotification(type, title, message)` for toasts (e.g. success/error after create/update/delete).
- **Escaping**: When injecting user or API content into HTML, escape `<`, `&`, `"` as needed (e.g. `.replace(/</g, '&lt;')`, attribute values with `&quot;` / `&amp;`). Prefer data attributes + JS for dynamic values in handlers instead of building long inline `onclick` strings with user content.
- **Date ranges**: Reports use a shared date range (e.g. Last Day, Last 7 Days); ensure default and labels match backend expectations.
- **Config**: `window.AppConfig` and `window.APP_BASE` for API base URL, auth token key, etc. Do not hardcode secrets.

---

## When adding or changing behavior

1. Put new API functions in `api.js` and expose on `window` if called from app.js.
2. Use `getApiErrorMessage(err)` in every catch that shows an error to the user.
3. Gate admin-only features with `hasPermission(...)` and keep view-only for non-admin where required.
4. Keep `cursor.md` updated if you add new conventions or major flows.

# CLAUDE.md

Behavioral primer for Claude sessions opened in `askchimps/dashboard`.

## What this repo is

AskChimps web dashboard. Next.js 16 App Router + Tailwind v4 + TypeScript strict. Server Components by default, Server Actions for mutating flows, httpOnly cookie carrying the access JWT.

> System architecture + ADRs live in [`askchimps/askchimps`](https://github.com/askchimps/askchimps). Backend lives in [`askchimps/api`](https://github.com/askchimps/api). Read those before non-trivial changes here.

## Stack — do not propose alternatives without justification

| Layer | Pick |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 |
| Auth carrier | httpOnly cookie storing JWT issued by `askchimps/api` |
| Client | Server Components + Server Actions; client components only when needed |
| Validation | zod (already a dep) |
| Linting | eslint w/ `eslint-config-next` |
| Node | 22 LTS (lts/jod), see `.nvmrc` |
| Port | dev + start on `3002` (api owns `3000`) |

## Conventions

- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
- **Branches**: `<type>/<slug>`. Never commit to `main` directly (per harness CLAUDE.md). Exception for the current session can be granted by the user.
- **Server vs client boundary**:
  - Default to Server Components. Add `'use client'` only when you need interactivity, hooks, or browser APIs.
  - Files in `src/lib/{api,session,env}.ts` import `'server-only'` — never import them from a client component.
  - Use Server Actions (`'use server'`) for all mutations and any path that needs to read/write cookies.
- **No localStorage / no client-side token storage**. The session token never reaches the browser. Only the httpOnly cookie does.
- **API client**: `src/lib/api.ts` is the single point of contact with `askchimps/api`. Add new endpoints there, not ad-hoc fetches.

## What this repo MUST NEVER contain

- ❌ Hard-coded API tokens or secrets.
- ❌ Client-side fetches that bundle the JWT.
- ❌ `localStorage.setItem('token', …)` or similar.
- ❌ Direct DB access (talk to `askchimps/api` only).
- ❌ Server Actions that bypass the api's RBAC (always re-use the
  user's cookie-bound JWT — never mint or impersonate).

## Pitfalls

- **Next.js 15+ async `cookies()` and `headers()`**: always `await` them
  inside Server Components and Server Actions. Old sync patterns will break.
- **`redirect()` in Server Actions** throws a special error to bubble up;
  don't try/catch around it.
- **Proxy** (formerly `middleware.ts` in Next ≤15) runs on the edge
  runtime — it can't import server-only helpers like `cookies()`. Use
  `req.cookies.get(...)` instead. File is `src/proxy.ts`.
- **CORS not needed**: dashboard talks to the api server-side. Browser
  never sees `api.askchimps.ai`. If we add client-side calls, we'll add
  CORS in the api.

## Useful one-liners

```bash
# Dev (Next on 3002, api on 3000)
npm run dev

# Typecheck without build
npm run typecheck

# Lint
npm run lint

# Production-grade build + run
npm run build && npm start
```

## When you finish a unit of work

- All commits Conventional.
- `npm run lint` + `npm run typecheck` clean.
- README updated if a route or env var changed.
- ADR added to `askchimps/askchimps/product/architecture-decisions.md` if a
  cross-system decision changed.

# askchimps/dashboard

AskChimps web dashboard. Next.js 15 (App Router), Tailwind v4, TypeScript strict.

> Backend lives in [`askchimps/api`](https://github.com/askchimps/api). System architecture + ADRs in [`askchimps/askchimps`](https://github.com/askchimps/askchimps).

## Quick start

```bash
nvm use                       # Node 22 LTS (lts/jod)
cp .env.example .env.local    # API base + cookie config
npm install
npm run dev                   # http://127.0.0.1:3002
```

The backend stack must be running on `http://127.0.0.1:3000`:

```bash
cd ../api
docker compose up -d
docker compose exec api npx prisma db seed   # prints credentials
```

Then in the dashboard hit `http://127.0.0.1:3002`. Default form value
prefills `admin@askchimps.ai`; password is `Admin@123` per the seed.

## What's in here so far

- `/login` — email + password form. Calls `POST /v1/auth/login` server-side
  via a Server Action and sets an httpOnly session cookie.
- `/` — protected dashboard. Calls `GET /v1/auth/me` and `GET /v1/orgs`
  server-side using the session cookie. Shows the current user, role,
  memberships, and the orgs the actor can see.
- `src/middleware.ts` — Next 15 middleware: redirects unauthenticated requests to `/login`.
- `actions/logout.ts` — clears the cookie + redirects to `/login`.

## Auth model

- Backend issues a JWT on login (`/v1/auth/login`).
- Dashboard stores it in an httpOnly cookie (`askchimps_session`,
  configurable). The cookie is set by a Server Action — never readable by
  client JS.
- Every server-side fetch to the API attaches `Authorization: Bearer …`.
- Role label rules:
  - `isPlatformAdmin` → "admin (platform)" — sees every org
  - Otherwise the user's per-org membership role(s)

## Repo layout

```
dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx           root layout
│   │   ├── page.tsx             protected dashboard (/)
│   │   ├── login/
│   │   │   ├── page.tsx         login screen
│   │   │   ├── login-form.tsx   client component (useActionState)
│   │   │   └── actions.ts       loginAction (server)
│   │   ├── actions/
│   │   │   └── logout.ts        logoutAction
│   │   └── globals.css
│   ├── lib/
│   │   ├── api.ts               server-side API client
│   │   ├── env.ts               server-only env helpers
│   │   ├── session.ts           httpOnly cookie set/get/clear
│   │   └── types.ts             shared response shapes
│   └── middleware.ts                 auth redirect (Next 15 middleware)
├── .env.example
├── .nvmrc
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Next dev server on `127.0.0.1:3002` |
| `npm run build` | Production build |
| `npm run start` | Run production build on port 3002 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## What's next

This is a thin shell for visibility. Coming features (when api lands them):

- Per-org config view (the YAML from `askchimps/api/config/clients/<id>.yaml`)
- Leads + calls list with outcome and bucket
- Webhook registration + delivery log
- Bull Board admin link (proxied)
- Analytics rollups

## Related

- [`askchimps/api`](https://github.com/askchimps/api) — backend (NestJS)
- [`askchimps/askchimps`](https://github.com/askchimps/askchimps) — planning,
  ADRs, tasks
- [`askchimps/infra`](https://github.com/askchimps/infra) — VM IaC

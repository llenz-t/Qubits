# ClassPulse

**Automated Attendance & Alerts for Islington College** — built for the *Automating Student Services* hackathon.

One rule engine solves three problems at once: attendance is checked daily (not weekly), parents are notified the moment a student crosses an absence threshold (no staff relay), and those notices arrive through a clearly-flagged urgent channel instead of getting lost in an inbox.

---

## Table of contents

1. [What this is](#what-this-is)
2. [The three portals](#the-three-portals)
3. [Tech stack](#tech-stack)
4. [AI tools used to build this](#ai-tools-used-to-build-this)
5. [Project structure](#project-structure)
6. [Getting started (local development)](#getting-started-local-development)
7. [Environment variables](#environment-variables)
8. [Database](#database)
9. [API reference](#api-reference)
10. [Key business rules](#key-business-rules)
11. [Deployment](#deployment)
12. [Known limitations / roadmap](#known-limitations--roadmap)

---

## What this is

Islington College tracks attendance on paper-thin margins: a student can slide from "fine" to "debarred from exams" before anyone outside the lecture hall notices. ClassPulse turns the college's existing attendance data into an automation layer with three consumers:

- **Students** see their real attendance percentage and exactly how much margin they have left, and get an automatic alert the moment their standing changes — before it becomes a crisis.
- **Parents** get the same alerts directly, without depending on staff to relay anything, plus a read-only view of attendance and exam-clearance status.
- **Admins** get a control room: an auto-built queue of exactly who the rules flagged (the *Absence Pool*), pre-filled outreach messages, a one-click **Send All** to notify everyone in the queue at once, and justification review.

## The three portals

| Portal | Who | Core capability |
|---|---|---|
| **Student** | Enrolled students | Attendance overview (donut chart + per-course breakdown), absence justification upload, event/message inbox |
| **Parent** | Guardians | Phone-verified, read-only mirror of their child's attendance and messages |
| **Admin** | College staff | Student roster, course/session management, justification review, Absence Pool with bulk notify, event broadcasts |

The landing page (`frontend/src/components/landing/`) is the pitch surface — problem statement, the "Daily / Instant / Flagged" value props, and the portal picker.

## Tech stack

**Frontend** — `frontend/`
- React 18 + TypeScript, built with **Vite 5**
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin) for the handful of utility-class spots; most components use inline styles by convention
- [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/react`) for all iconography — no emoji-as-icon anywhere in the UI
- [Recharts](https://recharts.org/) for the attendance donut chart
- No routing library and no global state manager — the app is a single state machine in `App.tsx` (landing vs. one of three portals) and each portal fetches its own data with plain `fetch`

**Backend** — `backend/`
- **Node.js + Express 5**
- **Supabase** (Postgres + Storage) as the only datastore — `@supabase/supabase-js` is the sole database client, there is no ORM
- **Multer** for justification-file uploads (streamed into Supabase Storage, not disk)
- `DEMO_MODE`-style simple role lookups instead of JWT/session auth (this is a hackathon demo, not a production auth system — see [Known limitations](#known-limitations--roadmap))

**Tooling**
- ESLint + `typescript-eslint` for linting
- No test framework is wired in yet (see roadmap)

## AI tools used to build this

This repository was built and iterated on with **[Claude Code](https://claude.com/claude-code)** (Anthropic) doing the actual feature implementation, debugging, and refactors, directed by the project author. Specifically:

- **Feature work & bug fixes** — the student/parent/admin dashboards, the Absence Pool + Send All flow, the weighted attendance-percentage logic, and this documentation pass were all implemented through Claude Code sessions.
- **[Impeccable](https://github.com/anthropics)** design skill — used for a mechanical + visual design audit and polish pass (icon consistency, removing "AI slop" patterns like emoji-as-icons and colored side-borders, browser-surface theming, contrast/spacing checks).
- **Taste/minimalist design skills** — used to steer the visual direction (flat cards, muted palette, no gradients/heavy shadows) for the final UI pass.
- Visual references for the product were a hand-drawn wireframe PDF and a set of reference-product screenshots, translated into working React components by Claude Code rather than a separate design tool.

No AI is used at runtime in the shipped product — attendance flagging, message sending, etc. are deterministic rule-based logic in `backend/src/services/`, not model calls.

## Project structure

```
Hackthon/
├── backend/
│   ├── src/
│   │   ├── server.js            # Express app entry point, route mounting, CORS
│   │   ├── config/
│   │   │   └── supabaseClient.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js        # Multer config for justification file uploads
│   │   ├── routes/               # student / parent / admin route definitions
│   │   └── services/             # All business logic + Supabase queries live here
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Landing vs. portal switch — the whole "router"
│   │   ├── perspectives/          # One top-level screen per portal + the portal picker
│   │   ├── components/
│   │   │   ├── landing/           # Marketing/pitch page
│   │   │   ├── student/ parent/ admin/
│   │   │   └── shared/            # DonutChart, MetricCard, ProgressBar, StatusBadge, InformationPage
│   │   ├── lib/
│   │   │   ├── apiClient.ts       # Every fetch() call to the backend, in one place
│   │   │   └── constants.ts       # Attendance thresholds + the weighted-percent formula
│   │   └── types/canonical.ts     # Shared TypeScript types matching backend response shapes
│   └── .env.example
├── ClassPulse Wireframes.pdf        # Original hackathon wireframe (source of truth for the landing page)
├── INFORMATION_FEATURE_GUIDE.md     # Deep-dive on the Events/Absence-Pool/Messages feature
└── README.md                        # This file
```

## Getting started (local development)

**Prerequisites:** Node.js 18+, npm, and a Supabase project (see [Database](#database)).

```bash
# 1. Clone and enter the repo
git clone <this-repo-url>
cd Hackthon

# 2. Backend
cd backend
cp .env.example .env      # then fill in your Supabase keys
npm install
npm run dev                # starts on http://localhost:3000 (node --watch)

# 3. Frontend (separate terminal)
cd frontend
cp .env.example .env       # only needed if not using the default dev proxy
npm install
npm run dev                # starts on http://localhost:5173
```

Open `http://localhost:5173`. The Vite dev server proxies `/api/*` to `http://localhost:3000` automatically (see `frontend/vite.config.ts`), so the frontend `.env` is only required when pointing at a non-default backend URL (e.g. after deploying).

**Other scripts:**

| Location | Command | Does |
|---|---|---|
| `frontend/` | `npm run build` | Type-checks (`tsc -b`) then produces a production build in `dist/` |
| `frontend/` | `npm run preview` | Serves the production build locally |
| `frontend/` | `npm run lint` | ESLint |
| `backend/` | `npm start` | Runs the server without file-watching (production-style) |

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full annotated list. Summary:

| Variable | Where | Purpose |
|---|---|---|
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | backend | Server-side Supabase client credentials |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | backend `.env` (read by root config), unused directly by current frontend code | Present for future direct-from-browser Supabase calls |
| `VITE_API_BASE_URL` | frontend | Where the frontend sends API requests when not using the dev proxy |
| `CORS_ORIGINS` | backend | Comma-separated list of allowed origins |
| `MAX_EXCEL_UPLOAD_BYTES` / `MAX_PDF_UPLOAD_BYTES` | backend | Upload size caps enforced in `middleware/upload.js` |
| `DEMO_MODE` | backend | Flags that auth is the simplified hackathon-demo lookup, not real session auth |
| `PORT` | backend | Express listen port (defaults to `3000`) |

## Database

All persistent data lives in **Supabase Postgres**. There are no migration files checked into this repo (schema changes so far were applied directly via the Supabase SQL editor — see `INFORMATION_FEATURE_GUIDE.md` for one example migration). Tables referenced by the backend today:

`students`, `parents`, `modules`, `programmemodules`, `classsessions`, `classoccurrence`, `attendancesummary`, `justifications`, `events`, `importantmessages`, plus a `justification-files` Supabase **Storage** bucket for uploaded medical certificates/proof documents.

`attendancesummary` is the aggregate table everything reads from — it carries `present`, `late`, `absentraw`, `convertedabsent`, and `totaleffectiveabsent` per `(student, module)` pair. To stand up a fresh project: create a Supabase project, recreate these tables (there is no single source-of-truth SQL file for the full schema — `INFORMATION_FEATURE_GUIDE.md` has the `events`/`importantmessages` DDL as a template), then point the backend `.env` at it.

## API reference

All routes are mounted under `/api` in `backend/src/server.js`.

**Student** (`/api/students`)
- `GET /:studentId/dashboard` — attendance overview + per-course breakdown
- `GET /search?name=` — name search used on the student login screen
- `POST /:studentId/justifications` — submit an absence justification (multipart, with file)
- `GET /:studentId/justifications` — list a student's justifications
- `GET /:studentId/messages` · `PATCH /:studentId/messages/:messageId/read`
- `GET /:studentId/events` (via the shared Information endpoints)

**Parent** (`/api/parents`)
- `POST /lookup` — phone-number login, returns the linked student's dashboard
- `GET /:studentId/messages` — read-only version of the student's messages

**Admin** (`/api/admin`)
- `GET /students` — roster with attendance, filterable by programme/year/section/search
- `GET /courses` · `PATCH /courses/:offeringId` · `POST /courses/bulk-deduct`
- `GET /justifications` · `PATCH /justifications/:justificationId` — review/approve/reject
- `GET /events` · `POST /events` · `DELETE /events/:eventId`
- `GET /absence-pool` — students flagged by the automation rule (see below)
- `POST /absence-pool/send` — send one absence notice
- `GET /health` — liveness check (mounted at the app root, not under `/api`)

## Key business rules

- **Attendance percentage weighting** (`frontend/src/lib/constants.ts`): a **late** only counts as **67% credit** (three lates ≈ one missed class), matching the college's actual policy — deliberately *not* framed as "classes you can still miss" in the UI, since that wording rewards skipping. The visible metric is called **Attendance Safety Margin** instead.
- **Absence Pool queue** (`backend/src/services/messageService.js`): a `(student, module)` pair enters the queue once `totaleffectiveabsent >= 3`, and drops back out once a message has been sent *at that absence level*. If the student's absences climb further after being notified, they **reappear** in the queue — so nobody silently keeps sliding after one warning.
- **Send All**: sends every pending queue message in parallel via the existing single-send endpoint (no separate bulk API); any failures stay in the queue instead of being marked sent.

## Deployment

This is two independently deployable pieces plus a managed database — no server-side rendering or shared build step.

**Database:** Supabase is already hosted — nothing to deploy, just use your project's production credentials.

**Backend (`backend/`):**
1. Deploy to any Node host (Render, Railway, Fly.io, a plain VPS, etc.) — it's a stock Express app with `npm start` as the run command.
2. Set the environment variables from `backend/.env.example` in that host's dashboard (use production Supabase keys).
3. Set `CORS_ORIGINS` to your deployed frontend's URL.

**Frontend (`frontend/`):**
1. `npm run build` produces a static `dist/` folder — deploy it to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.).
2. Set `VITE_API_BASE_URL` at build time to your deployed backend's URL (the local dev proxy in `vite.config.ts` only applies to `npm run dev`).
3. Rebuild whenever that URL changes — it's baked in at build time, not read at runtime.

There is no CI/CD pipeline configured in this repo yet; both deploys are manual today.

## Known limitations / roadmap

- Auth is a simplified demo lookup (`DEMO_MODE`), not real session/JWT-based auth — do not use this as-is for production student data.
- No automated test suite.
- A pre-existing type/logic issue in `AdminCoursesManager.tsx` (bulk-deduct filter state) is tracked but not yet fixed.
- From `INFORMATION_FEATURE_GUIDE.md`'s original roadmap: event editing (currently delete-and-recreate only), email/SMS delivery of messages (currently in-app only), an admin view of who has read their messages, and message templates. **Bulk send to the Absence Pool has since been implemented** (the "Send All" button).

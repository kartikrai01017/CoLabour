# CoLabour — Cooperative-Owned Local Services MVP

> Minimal viable platform that connects verified local trade workers (electricians, plumbers, cleaners) with households. Owned by the cooperative — fair pay, no investor commission. MVP loop: **register → book → match → accept → complete → rate**.

## Stack

- **Frontend:** React 18 + Vite + React Router (simple, competitor-inspired UI — edit `frontend/src/index.css` variables to re-skin)
- **Backend:** Node.js + Express + JWT + bcryptjs (in-memory store, replace with DB later)
- **MVP scope:** All features present as UI/mock, **only Auth (register/login/me) is connected through backend** as requested. Others are mocked in localStorage and clearly marked with `TODO`.

## Project Structure

```
CoLabour/
├── backend/
│   ├── server.js        # Express server, auth endpoints only (connected feature)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api.js       # Auth hits backend; others TODO
│   │   ├── App.jsx
│   │   ├── index.css    # Change --accent / --primary to match competitor palette
│   │   └── pages/       # Home, Login, Register, Dashboard, BookService, Workers, Bookings
│   ├── vite.config.js
│   └── package.json
├── README.md            # this file
├── FUTURE.md            # empty placeholder for future edits
└── .gitignore
```

## Features (MVP Minimum)

- User accounts (customer/worker/admin) — **LIVE via backend**
- Worker profiles & verification badge (mock)
- Service catalogue (plumbing, electrical, cleaning, etc.)
- Booking / request form (mock → localStorage)
- Basic matching engine (skill + location — mock distance filter)
- Job acceptance & status tracking (pending → matched → in_progress → completed)
- Completion & rating (★ mock)

All features have **code comments & documentation** at top of each file. Search `TODO` to find integration points.

## Quick Start (Localhost)

### Prerequisites
- Node.js 18+ (`node -v`)
- npm (`npm -v`)

### 1. Start Backend (port 5000)

```bash
cd backend
npm install
npm run dev     # or npm start
# Expected: ✓ CoLabour Backend running on http://localhost:5000
```

Health check: http://localhost:5000/api/health

Demo user seeded: `demo@colabour.com` / `demo123`

### 2. Start Frontend (port 5173)

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
# Expected: Local: http://localhost:5173/
```

Open http://localhost:5173 in browser.

### 3. Test the Connected Feature (Auth)

- Register a new account (customer/worker) — hits `POST /api/auth/register`
- Login — hits `POST /api/auth/login`
- Dashboard reads `GET /api/auth/me` with JWT
- Check browser devtools → Application → Local Storage → `colabour_token`

Backend also exposes:
- `POST /api/auth/register` — { name, email, password, role, skill?, location? }
- `POST /api/auth/login` — { email, password }
- `GET /api/auth/me` — header `Authorization: Bearer <token>`
- `GET /api/workers` — mock placeholder

### Commands Reference

| Command | Where | Purpose |
|---------|-------|---------|
| `npm install` | backend/ , frontend/ | Install deps |
| `npm run dev` | backend/ | Start backend with nodemon (auto-reload) |
| `npm start` | backend/ | Start backend without reload |
| `npm run dev` | frontend/ | Start Vite dev server |
| `npm run build` | frontend/ | Production build → `dist/` |
| `npm run preview` | frontend/ | Preview production build |

## Editing & Extending

- **UI re-skin:** Edit `frontend/src/index.css` `:root` variables (`--primary`, `--accent`, `--radius`). Minimal CSS, no heavy framework — 1-file change themes the whole app.
- **Connect a new feature to backend:** Follow pattern in `frontend/src/api.js`:
  1. Add endpoint in `backend/server.js`
  2. Add function in `api.js` (uncomment TODO examples)
  3. Replace mock localStorage logic in the relevant `pages/*.jsx`
- **Code is documented:** Every file has header comment explaining purpose and edit points. Keep comments when editing.

## Environment

Copy `backend/.env.example` to `backend/.env` if you change secrets:

```
PORT=5000
JWT_SECRET=colabour_mvp_secret_2026_change_in_prod
```

## Future

See `FUTURE.md` (intentionally empty — will be edited as features are added).

---
Built as MVP — editable, minimal, one backend-connected feature (Auth) to prove the loop.

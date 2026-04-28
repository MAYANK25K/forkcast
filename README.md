# 🍴 Forkcast — Restaurant Analytics Platform

> A full-stack analytics dashboard for restaurant operators. Track revenue, order volume, average order value, and peak-hour patterns across an entire fleet or for a single venue — on any device.

🚀 **Live Demo:** [https://forkcast-xi.vercel.app/](https://forkcast-xi.vercel.app/)

---

## Repository Structure

This is a **monorepo** — both the frontend and backend live inside one GitHub repository under separate folders.

```
forkcast/
├── frontend/          ← Next.js 16 · React 19 · Tailwind CSS v4
├── backend/           ← Laravel 13 · PHP 8.3 · SQLite / PostgreSQL
└── README.md          ← you are here
```

Keeping both projects in one repo makes it easy to version them together, review full-stack changes in a single pull request, and share this README as the single source of truth.

---

## What Forkcast Does

| Feature | Description |
|---------|-------------|
| **Overview dashboard** | 4 global KPIs (revenue, orders, AOV, active venues) with a live leaderboard and restaurant grid |
| **Restaurant dashboard** | Per-venue KPI cards, daily orders chart, daily revenue chart, AOV trend line, and peak-hour heatmap |
| **Leaderboard** | Top 10 restaurants ranked by total revenue, filterable by date range, order amount, and hour |
| **Restaurants catalog** | Searchable, sortable grid/list of all venues — click any card to open its dashboard |
| **Filters** | Every analytics view accepts date range, min/max order amount, and hour-of-day filters |
| **Responsive UI** | Mobile bottom-tab navigation, tablet icon-rail sidebar, full sidebar on desktop |


---


## Cloning the Project


Anyone can clone and run the full project with these steps.

### Clone the repository

```bash
git clone https://github.com/MAYANK25K/forkcast.git
cd forkcast
```

### Set up the backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
# Backend running at http://localhost:8000
```

### Set up the frontend (new terminal tab)

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local → set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
# Frontend running at http://localhost:3000
```

Full detailed setup instructions are in each project's individual README.

---

## License

MIT © Forkcast

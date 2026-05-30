# Liventory

**The operating system for plant nursery inventory management.**

Liventory is a production-ready inventory management platform built specifically for wholesale and retail plant nurseries. It replaces spreadsheets, handwritten notes, and disconnected software with a unified, modern web application.

---

## Features

- **Real-time inventory tracking** — Add, edit, delete, and search plants instantly
- **Location management** — Organize by Greenhouse, Hoop House, Field, Shade House, and more
- **Transaction history** — Full audit log of all inventory movements
- **CSV Import wizard** — Upload existing Excel/spreadsheet inventory with column mapping
- **CSV Export** — Export inventory, transactions, or locations
- **Interactive reports** — Charts showing inventory by location and value by category
- **AI Agents** — Three specialized assistants powered by Claude:
  - Inventory Analyst (low stock, excess inventory, discrepancies)
  - Production Planner (propagation timing, future shortages)
  - Operations Advisor (efficiency, relocation, weekly summaries)
- **Demo data system** — Load/delete/reset realistic nursery data for investor demos
- **Dark mode UI** — Professional interface inspired by Linear, Notion, and Stripe

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (via Prisma 7) |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Charts | Recharts |
| CSV Parsing | Papa Parse |
| AI | Anthropic Claude API |
| Deployment | Vercel |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- Anthropic API key (optional, for AI features)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/liventory"
ANTHROPIC_API_KEY="sk-ant-..."   # Optional - enables AI agents
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Data

Liventory includes a full demo dataset with 60+ realistic nursery inventory records, 8 locations, and pre-generated AI insights — perfect for investor presentations and demos.

### Load Demo Data

Navigate to **Settings** → click **Load Demo Data**

Or via API:
```bash
curl -X POST http://localhost:3000/api/demo \
  -H "Content-Type: application/json" \
  -d '{"action": "load"}'
```

### Delete Demo Data

Navigate to **Settings** → click **Delete Demo Data**

Or via API:
```bash
curl -X POST http://localhost:3000/api/demo \
  -H "Content-Type: application/json" \
  -d '{"action": "delete"}'
```

### Reset Demo Environment

Deletes and reloads fresh demo data:
```bash
curl -X POST http://localhost:3000/api/demo \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

Demo records are flagged with `isDemo: true` and labeled in the UI. They do not affect real inventory.

---

## CSV Import

1. Navigate to **Import CSV**
2. Drag and drop your CSV file (exported from Excel, Google Sheets, etc.)
3. Map your column names to Liventory fields
4. Preview the first 10 rows
5. Click **Import**

Liventory auto-detects common column names and creates missing locations automatically.

---

## AI Agents

Requires `ANTHROPIC_API_KEY` in your environment.

Navigate to **AI Agents** and click **Run Analysis** on any agent:

- **Inventory Analyst** — Detects stock issues and recommends adjustments
- **Production Planner** — Recommends propagation timing and priorities
- **Operations Advisor** — Analyzes operational efficiency and generates weekly summaries

Without an API key, agents return a placeholder message.

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List inventory (search, filter, paginate) |
| `/api/inventory` | POST | Create inventory item |
| `/api/inventory/[id]` | GET | Get single item with history |
| `/api/inventory/[id]` | PUT | Update item |
| `/api/inventory/[id]` | DELETE | Delete item |
| `/api/locations` | GET | List locations |
| `/api/locations` | POST | Create location |
| `/api/locations/[id]` | PUT | Update location |
| `/api/locations/[id]` | DELETE | Delete location |
| `/api/transactions` | GET | List transactions |
| `/api/transactions` | POST | Record transaction |
| `/api/dashboard` | GET | Dashboard stats |
| `/api/export` | GET | Export CSV (`?type=inventory\|transactions\|locations`) |
| `/api/import` | POST | Import CSV rows |
| `/api/ai` | GET | Get AI insights |
| `/api/ai` | POST | Run AI agent (`agentType: INVENTORY_ANALYST\|PRODUCTION_PLANNER\|OPERATIONS_ADVISOR`) |
| `/api/ai` | PATCH | Mark insight as read |
| `/api/demo` | POST | Demo data actions (`load\|delete\|reset\|status`) |

---

## Database Schema

### Inventory
Core plant record with quantities, pricing, location, propagation method, and category.

### Location
Growing areas with type (Greenhouse, Hoop House, Field, Shade House, Overwintering, Nursery Bed, Other).

### InventoryTransaction
Audit log of all stock movements: ADD, REMOVE, MOVE, ADJUST, SALE, RESERVATION.

### AiInsight
AI-generated operational recommendations with severity levels (CRITICAL, WARNING, INFO).

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel Dashboard:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `ANTHROPIC_API_KEY` — your Anthropic API key
4. Deploy

For production PostgreSQL, use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app).

---

## Investor Demo Guide

### Setup (5 minutes before demo)

1. Go to **Settings**
2. Click **Reset Demo Environment** (loads fresh data)
3. Navigate to **Dashboard** — verify stats show ~3,000+ plants

### Demo Flow (15 minutes)

1. **Dashboard** — Show total inventory value, low stock alerts, charts
2. **Inventory** — Search "Green Giant", show filtering, edit a record
3. **AI Agents** — Run Inventory Analyst, show real-time insights
4. **Locations** — Show 8 growing areas with plant counts
5. **Transactions** — Show audit history
6. **Reports** — Show value by category pie chart, export CSV
7. **Import** — Show CSV import wizard (upload a sample file)

### Key Talking Points

- **Problem**: 90%+ of nurseries use spreadsheets and memory
- **Solution**: Purpose-built for nursery workflows
- **Differentiation**: AI agents that understand plant propagation cycles
- **Market**: 24,000+ wholesale nurseries in the US alone
- **Go-to-market**: Direct sales to regional growers

---

## Project Structure

```
src/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── ai/           # AI agent endpoints
│   │   ├── dashboard/    # Dashboard stats
│   │   ├── demo/         # Demo data management
│   │   ├── export/       # CSV export
│   │   ├── import/       # CSV import
│   │   ├── inventory/    # CRUD inventory
│   │   ├── locations/    # CRUD locations
│   │   └── transactions/ # Transaction recording
│   ├── ai/               # AI Agents page
│   ├── import/           # CSV Import page
│   ├── inventory/        # Inventory page
│   ├── locations/        # Locations page
│   ├── reports/          # Reports page
│   ├── settings/         # Settings + demo management
│   └── transactions/     # Transaction history
├── components/
│   └── Sidebar.tsx       # Navigation sidebar
├── lib/
│   ├── demo-seed.ts      # Demo data seeder
│   └── prisma.ts         # Database client
└── types/
    └── index.ts          # TypeScript types
prisma/
└── schema.prisma         # Database schema
```

---

## License

MIT

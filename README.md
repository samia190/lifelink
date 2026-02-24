# 🏥 LIFELINK Mental Medical Center

> **Enterprise-Grade Hybrid Mental & Medical Healthcare Ecosystem for Kenya**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-purple.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-gold.svg)](#)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Modules](#modules)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Security](#security)

---

## Overview

LIFELINK is a comprehensive, production-ready healthcare platform purpose-built for the Kenyan market. It integrates mental health services, medical consultations, AI-powered patient support, M-Pesa payments, telehealth via WebRTC, corporate wellness programs, and an intelligent automation engine — all under a premium brand experience.

**Key Highlights:**
- 🧠 AI-powered mental health chat with crisis detection (English + Swahili)
- 💳 M-Pesa STK Push integration (Safaricom Daraja API)
- 📹 Encrypted telehealth sessions via Twilio WebRTC
- 🏢 Corporate wellness with HR analytics
- 🔒 Kenya Data Protection Act compliant
- ⚡ 10 automated background workflows
- 📊 Business intelligence with real-time analytics

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    NGINX Reverse Proxy               │
│              (SSL, Rate Limiting, Gzip)             │
├──────────────────────┬──────────────────────────────┤
│   Frontend (3000)    │      Backend (4000)           │
│   Next.js 14 SSR     │      Express + TypeScript     │
│   TailwindCSS        │      Socket.IO (WebSocket)    │
│   Zustand            │      Cron Jobs Engine         │
├──────────────────────┴──────────────────────────────┤
│              PostgreSQL  │  Redis (Sessions/Cache)   │
├──────────────────────────┴──────────────────────────┤
│    OpenAI │ Twilio │ M-Pesa │ Africa's Talking │ S3 │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TailwindCSS, Zustand, Axios |
| **Backend** | Express.js, TypeScript, Socket.IO, node-cron |
| **Database** | PostgreSQL 16, Prisma ORM (35+ models) |
| **Cache** | Redis 7 |
| **AI** | OpenAI GPT-4 (chat, risk scoring, session summaries) |
| **Payments** | M-Pesa Daraja API, Stripe |
| **Telehealth** | Twilio Video (WebRTC) |
| **SMS** | Africa's Talking |
| **Email** | Nodemailer (SMTP) |
| **Storage** | AWS S3 |
| **Auth** | JWT + Refresh Tokens, 2FA (TOTP) |
| **Deployment** | Docker, Docker Compose, Nginx |

---

## Modules

| # | Module | Description |
|---|--------|-------------|
| A | **Brand & Frontend** | Premium navy/gold design, responsive, animated |
| B | **AI Chat** | GPT-4 counselor, crisis detection, Swahili support |
| C | **Appointments** | Multi-type booking, conflict detection, reminders |
| D | **Telehealth** | WebRTC video, recording consent, session notes |
| E | **Patient Management** | Records, prescriptions, treatment plans, progress |
| F | **Business Intelligence** | Revenue analytics, growth forecast, KPIs |
| G | **Corporate Wellness** | Bulk enrollment, usage reports, HR analytics |
| H | **Webinar Hub** | Live sessions, certificates, replay access |
| I | **Automation Engine** | 10 cron jobs for reminders, reports, escalation |
| J | **Security** | AES-256 encryption, RBAC (9 roles), audit logging |
| K | **Database** | 35+ models, 15+ enums, seed data |
| L | **Roles** | Super Admin, Admin, Doctor, Nurse, Therapist, Patient, Corporate Manager, Staff, Receptionist |
| M | **Revenue** | M-Pesa + Stripe, invoicing, billing records |
| N | **Crisis Management** | Risk scoring, emergency escalation, alerts |
| O | **Blog & Content** | SEO-optimized posts, categories, tags |
| P | **Notifications** | Email + SMS (appointment, payment, crisis) |
| Q | **Legal** | Privacy policy, terms, AI disclaimer (KDPA) |
| R | **Scalability** | Docker, Redis caching, rate limiting, health checks |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+ (local install or Docker)
- **Docker** (optional, for running PostgreSQL)
- npm

### Step 1 — Start PostgreSQL

If you don't have PostgreSQL installed locally, start it with Docker:

```bash
docker run --name lifelink-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lifelink_db -p 5432:5432 -d postgres:16-alpine
```

If you already have PostgreSQL running, create the database:

```sql
CREATE DATABASE lifelink_db;
```

### Step 2 — Install Dependencies

```bash
cd lifelink

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### Step 3 — Configure Environment

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`. The default works with the Docker command above:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lifelink_db?schema=public
```

> **Note:** Also copy `.env` into the `backend/` folder so Prisma can find it:
> ```bash
> cp .env backend/.env
> ```

### Step 4 — Setup Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed with sample data (admin, doctors, services, blog posts)
npx prisma db seed

cd ..
```

### Step 5 — Run the Project

**Option A — Run backend and frontend separately (recommended):**

```bash
# Terminal 1: Start backend (port 4000)
cd backend
npx ts-node-dev --respawn --transpile-only src/server.ts

# Terminal 2: Start frontend (port 3000)
cd frontend
npx next dev --turbo
```

**Option B — Run both at once from root:**

```bash
# First install concurrently at root level
npm install concurrently --save-dev

# Then run
npm run dev
```

### Step 6 — Open in Browser

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| API Health Check | http://localhost:4000/health |
| Prisma Studio (DB GUI) | Run `npx prisma studio` in `backend/` |

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@lifelink.co.ke | Admin@LifeLink2026! |
| Doctor | dr.wanjiku@lifelink.co.ke | Doctor@LifeLink2026! |
| Doctor | dr.odhiambo@lifelink.co.ke | Doctor@LifeLink2026! |
| Doctor | dr.mwangi@lifelink.co.ke | Doctor@LifeLink2026! |

---

## Environment Variables

Create a `.env` file in the root directory. See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret |
| `ENCRYPTION_KEY` | AES-256 encryption key (32 chars) |
| `MPESA_CONSUMER_KEY` | Safaricom Daraja API key |
| `MPESA_CONSUMER_SECRET` | Safaricom Daraja secret |
| `MPESA_SHORTCODE` | M-Pesa business shortcode |
| `MPESA_PASSKEY` | M-Pesa passkey |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_API_KEY_SID` | Twilio API key for Video |
| `AT_API_KEY` | Africa's Talking API key |
| `SMTP_HOST` | Email SMTP host |

---

## Database

### Schema Overview

The database uses **35+ models** organized into domains:

- **Authentication**: User, Profile, RefreshSession
- **Patients**: Patient, MedicalRecord, Prescription, TreatmentPlan, ProgressTracking
- **Appointments**: Appointment, AvailabilitySlot
- **Telehealth**: TelehealthSession, SessionNote
- **Payments**: Payment, BillingRecord, Invoice
- **Corporate**: CorporateAccount, CorporateEmployee, CorporateUsageReport
- **Content**: BlogPost, Service, Webinar, WebinarRegistration
- **AI/Chat**: ChatConversation, ChatMessage
- **System**: AuditLog, SystemLog, AutomationTask, AnalyticsEvent, Notification

### Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>

# Deploy migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

---

## API Reference

Base URL: `http://localhost:4000/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/verify-2fa` | Verify 2FA code |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| POST | `/auth/setup-2fa` | Setup 2FA |
| PUT | `/auth/change-password` | Change password |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/appointments` | Create appointment |
| GET | `/appointments` | List appointments |
| GET | `/appointments/:id` | Get appointment |
| PUT | `/appointments/:id/status` | Update status |
| GET | `/appointments/slots` | Get available slots |
| POST | `/appointments/:id/notes` | Add session notes |
| GET | `/appointments/:id/notes` | Get session notes |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients` | List patients |
| GET | `/patients/:id` | Get patient details |
| GET | `/patients/:id/records` | Get medical records |
| POST | `/patients/:id/records` | Add medical record |
| GET | `/patients/:id/progress` | Get progress tracking |
| POST | `/patients/:id/risk-assessment` | AI risk assessment |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/mpesa/initiate` | Initiate M-Pesa STK Push |
| POST | `/payments/mpesa/callback` | M-Pesa callback |
| GET | `/payments` | Payment history |
| GET | `/payments/:id` | Payment details |
| GET | `/payments/invoices` | List invoices |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/analytics` | Admin analytics |
| GET | `/dashboard/revenue` | Revenue analytics |
| GET | `/dashboard/patients` | Patient analytics |
| GET | `/dashboard/appointments` | Appointment analytics |
| GET | `/dashboard/forecast` | Growth forecast |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List services |
| GET | `/services/:slug` | Service details |
| GET | `/blog` | List blog posts |
| GET | `/blog/:slug` | Blog post details |

---

## Deployment

### Docker (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Nginx**: http://localhost:80
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Manual Deployment

```bash
# Backend
cd backend
npm install
npx prisma migrate deploy
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
npm start
```

---

## Security

- **Encryption**: AES-256-CBC for sensitive patient data
- **Authentication**: JWT with refresh token rotation
- **2FA**: TOTP-based two-factor authentication
- **Rate Limiting**: General (100/15min) + Auth-specific (5/min)
- **RBAC**: 9 role types with middleware enforcement
- **Audit Logging**: All sensitive operations logged to database
- **Headers**: Helmet.js security headers + CSP
- **CORS**: Configurable origin whitelist
- **Input Validation**: Zod schemas on all endpoints
- **Account Lockout**: 5 failed attempts → 30min lockout
- **Compliance**: Kenya Data Protection Act (KDPA) ready

---

## Project Structure

```
lifelink/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (35+ models)
│   │   └── seed.ts                # Seed data
│   ├── src/
│   │   ├── config/                # App config, DB client, logger
│   │   ├── controllers/           # 11 controllers
│   │   ├── middleware/            # Auth, error handler, audit, validation
│   │   ├── routes/                # API route definitions
│   │   ├── services/              # Business logic (7 services)
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── utils/                 # Errors, encryption, response helpers
│   │   ├── validators/            # Zod validation schemas
│   │   └── server.ts              # Express server + Socket.IO
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   │   ├── about/
│   │   │   ├── ai-disclaimer/
│   │   │   ├── blog/
│   │   │   ├── book/
│   │   │   ├── contact/
│   │   │   ├── corporate/
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/
│   │   │   │   ├── doctor/
│   │   │   │   ├── patient/
│   │   │   │   └── corporate/
│   │   │   ├── emergency/
│   │   │   ├── login/
│   │   │   ├── privacy/
│   │   │   ├── register/
│   │   │   ├── services/
│   │   │   ├── terms/
│   │   │   ├── webinars/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Homepage
│   │   ├── components/
│   │   │   ├── chat/AIChatWidget.tsx
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx
│   │   │       └── Footer.tsx
│   │   ├── lib/
│   │   │   ├── api.ts             # Axios API client
│   │   │   ├── store.ts           # Zustand stores
│   │   │   └── utils.ts           # Utility functions
│   │   └── styles/globals.css
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json                   # Root monorepo config
└── README.md
```

---

## Contact

**LIFELINK Mental Medical Center**
- 📍 Nairobi, Kenya
- 📞 +254 700 LIFELINK
- 📧 info@lifelink.co.ke
- 🌐 www.lifelink.co.ke
- 🆘 Crisis Line: +254 722 178 177

---

*Built with ❤️ for Kenya's mental health ecosystem*

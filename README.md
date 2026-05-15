# G-HUB - Full Stack Web Application

Full-stack monorepo with **Next.js** frontend, **NestJS** backend, **PostgreSQL** database, and **Docker** infrastructure.

## 📦 Project Structure

```
G-HUB/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/         # Next.js App
│       ├── src/
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml    # Container orchestration
├── .env.example          # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- npm/yarn/pnpm

### 1. Clone & Setup Environment

```bash
cp .env.example .env
```

### 2. Run with Docker

```bash
docker-compose up -d
```

The default Docker Compose setup runs in development mode with hot reload:
- Frontend uses `next dev` and watches `apps/frontend`
- Backend uses `nest start --watch` and watches `apps/backend`
- Source folders are mounted into the containers, so code edits appear without rebuilding

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

### 3. Development (Local)

**Backend:**
```bash
cd apps/backend
npm install
npm run start:dev
```

**Frontend:**
```bash
cd apps/frontend
npm install
npm run dev
```

## 🔧 Technology Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, Prisma, JWT |
| Database | PostgreSQL 17 |
| DevOps | Docker, Docker Compose |

## 📝 Available Scripts

### Backend
- `pnpm build` - Build for production
- `pnpm start:dev` - Start in watch mode
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm prisma:migrate` - Create/apply migrations in development
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:seed` - Seed default apps/roles/admin user

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run type-check` - TypeScript check

## 🗄️ Database

PostgreSQL is configured with:
- **Host**: `postgres` (Docker) or `localhost` (local)
- **Port**: `5432`
- **User**: `admin`
- **Password**: `admin`
- **Database**: `g-hub`

## 📚 API Documentation

Base URL: `http://localhost:3001/api`

- `GET /health` - Health check
- `GET /` - Welcome message

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild images
docker-compose up -d --build

# Follow hot-reload logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 🔐 Environment Variables

See `.env.example` for all available options. Key variables:

```
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=g-hub
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://admin:admin@localhost:5432/g-hub
JWT_SECRET=change-this-in-prod
JWT_EXPIRES_IN=3600
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD=admin
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📄 License

MIT

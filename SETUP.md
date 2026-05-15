# G-HUB Installation & Setup Guide

## 📋 Requirements

- **Docker** & **Docker Compose** (for containerized deployment)
- **Node.js 20+** (for local development)
- **npm/yarn/pnpm** (package manager)

## 🚀 Getting Started

### Option 1: Docker (Recommended)

1. **Clone repository**
   ```bash
   cd G-HUB
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Database: localhost:5432

### Option 2: Local Development

#### Backend Setup
```bash
cd apps/backend
npm install
npm run start:dev
```
Backend runs on http://localhost:3001

#### Frontend Setup (new terminal)
```bash
cd apps/frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

#### Database Setup (new terminal)
```bash
# Make sure PostgreSQL is running locally or via Docker
docker-compose up postgres -d
```

## 📁 Project Structure

```
apps/
├── backend/
│   ├── src/
│   │   ├── main.ts              # Entry point
│   │   ├── app.module.ts        # Main module
│   │   ├── app.controller.ts    # Routes
│   │   ├── app.service.ts       # Logic
│   │   └── users/               # Feature module example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        # Root layout
    │   │   ├── page.tsx          # Home page
    │   │   └── globals.css       # Global styles
    │   └── public/
    ├── Dockerfile
    ├── next.config.js
    ├── package.json
    └── tsconfig.json
```

## 🔧 Development Commands

### Using Make
```bash
make help           # Show all commands
make up             # Start Docker services
make down           # Stop Docker services
make logs           # View all logs
make dev-backend    # Start backend dev server
make dev-frontend   # Start frontend dev server
```

### Using npm
```bash
# Backend
cd apps/backend
npm run build       # Production build
npm run start:dev   # Development mode
npm run lint        # ESLint
npm test            # Run tests

# Frontend
cd apps/frontend
npm run build       # Production build
npm run dev         # Development mode
npm run lint        # ESLint
```

## 🗄️ Database

**Default Credentials:**
- Username: `admin`
- Password: `admin`
- Database: `g-hub`
- Port: `5432`

### Connect to Database
```bash
# Using psql
psql -h localhost -U admin -d g-hub

# Or via Docker
docker exec -it g-hub-postgres psql -U admin -d g-hub
```

## 📝 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Available Routes
- `GET /health` - System health check
- `GET /` - Welcome message

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Verify database is running
docker-compose ps

# Restart database
docker-compose restart postgres
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📦 Adding Dependencies

```bash
# Backend
cd apps/backend
npm install <package-name>

# Frontend
cd apps/frontend
npm install <package-name>
```

## 🔐 Environment Variables

See `.env.example` for template. Key variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_USER` | admin | Database user |
| `DB_PASSWORD` | admin | Database password |
| `DB_NAME` | g-hub | Database name |
| `NODE_ENV` | development | Environment |
| `PORT` | 3001 | Backend port |
| `NEXT_PUBLIC_API_URL` | http://localhost:3001 | Frontend API URL |

## 📚 Next Steps

1. Update `.env` with your configuration
2. Run `docker-compose up -d` or start dev servers
3. Access http://localhost:3000
4. Start building features!

## ❓ Need Help?

- Check logs: `docker-compose logs -f`
- Review API docs: http://localhost:3001/api
- Read backend code: `apps/backend/src/`
- Read frontend code: `apps/frontend/src/app/`

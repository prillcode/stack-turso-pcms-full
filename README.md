# Payload CMS + libSQL/Turso Local Development Stack

A local development environment for Payload CMS with libSQL server, mirroring Turso's cloud setup for seamless development-to-production workflows.

> **Development vs Production**: This repo provides **3 local development options**. For production deployment guides (VPS, AWS, Railway, Vercel, etc.), see [PROD_DEPLOYMENT_OPTS.md](./PROD_DEPLOYMENT_OPTS.md).

## Features

- 🐳 **Option 1 & 2: Docker** - Containerized libSQL + Payload CMS for local dev
- 🔐 **Option 1: JWT Auth** - Production-like authentication for testing
- ⚡ **Option 3: Turso CLI** - Quickest local setup, no Docker required
- 🚀 **Production Ready** - Multiple deployment options (VPS, AWS, Railway, Vercel)
- 🔄 **Turso Compatible** - Seamless migration to Turso Cloud
- 📦 **TypeScript** - Full type safety throughout

## Quick Start

### Interactive Setup

```bash
# 1. Make the quick-start script executable
chmod +x quick-start.sh

# 2. Run it and choose your development option
./quick-start.sh
```

The script will:
- Create necessary directories and configuration
- Generate JWT keys (if using Option 1)
- Set up environment variables
- Guide you through Payload app creation
- Start your chosen development environment

### Manual Setup

If you prefer manual setup:

```bash
# 1. Create Payload app
npx create-payload-app@latest payload-app

# 2. Install dependencies
cd payload-app
npm install @payloadcms/db-sqlite

# 3. Choose your development option:

# Option 1: Docker with JWT auth
cd ../opt1-docker-jwt-auth
./setup-jwt-auth.sh
docker-compose up -d

# Option 2: Docker without auth
cd ../opt2-docker-no-auth
docker-compose up -d

# Option 3: Turso CLI (fastest)
cd ../opt3-no-docker
turso dev

# 4. Access Payload
open http://localhost:3000/admin
```

See **[SETUP.md](./SETUP.md)** for detailed instructions.

## Project Structure

```
.
├── opt1-docker-jwt-auth/       # Option 1: Docker with JWT auth
│   ├── docker-compose.yaml
│   ├── .env.example
│   ├── generate-token.js
│   └── setup-jwt-auth.sh
├── opt2-docker-no-auth/        # Option 2: Docker without auth
│   ├── docker-compose.yaml
│   └── .env.example
├── opt3-no-docker/             # Option 3: Turso CLI (no Docker)
│   └── .env.example
├── payload.config.ts           # Payload CMS configuration
├── libsql-client-examples.ts   # libSQL client usage examples
├── Dockerfile                  # Container definition for Payload
├── package.json                # Project dependencies
├── PROD_DEPLOYMENT_OPTS.md     # Production deployment guide
├── quick-start.sh              # Interactive setup script
├── SETUP.md                    # Detailed setup guide
└── README.md                   # This file
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Payload Admin | http://localhost:3000/admin | CMS admin panel |
| Payload API | http://localhost:3000/api | REST & GraphQL API |
| libSQL Server | http://localhost:8080 | Database server (Options 1 & 2) |

## Environment Variables

```env
DATABASE_URI=http://libsql:8080          # libSQL server URL
DATABASE_AUTH_TOKEN=<jwt-token>          # Optional: JWT for auth
PAYLOAD_SECRET=<random-secret>           # Required: Session secret
NODE_ENV=development                     # Environment
```

## Development Workflow

1. **Develop locally** with Docker stack
2. **Test** against local libSQL server
3. **Deploy** to Turso Cloud for production
4. **Zero code changes** needed between environments

```typescript
// Same code works everywhere
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URI,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
```

## Deploying to Production

All three development options can be deployed to production with minimal changes. Choose the platform that fits your needs:

### Quick Migration to Production

**Simplest Path** (Turso Cloud + VPS/Coolify):
```bash
# 1. Create production database
turso db create production-db
turso db show production-db --url
turso db tokens create production-db

# 2. Update environment variables to use Turso Cloud
DATABASE_URI=libsql://production-db.turso.io
DATABASE_AUTH_TOKEN=<your-token>

# 3. Deploy to your chosen platform
```

### Platform Options

- **VPS + Coolify** - Deploy your Docker setup with one-click SSL (Recommended)
- **VPS Manual** - Traditional server deployment with full control
- **Railway/Render** - Simple PaaS with Git-based deployment
- **AWS Serverless** - Auto-scaling Lambda + CloudFront + CDK
- **Vercel/Netlify** - Serverless edge deployment

See **[PROD_DEPLOYMENT_OPTS.md](./PROD_DEPLOYMENT_OPTS.md)** for complete deployment guides for each platform, including:
- Step-by-step deployment instructions
- Cost comparisons
- Migration paths from each development option
- Security checklists
- Platform-specific configurations

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete development setup guide
- **[PROD_DEPLOYMENT_OPTS.md](./PROD_DEPLOYMENT_OPTS.md)** - Production deployment options
- **[OPTIONS_COMPARISON.md](./OPTIONS_COMPARISON.md)** - Compare development options
- **[Payload CMS Docs](https://payloadcms.com/docs)** - Payload documentation
- **[Turso Docs](https://docs.turso.tech)** - Turso/libSQL documentation
- **[libSQL GitHub](https://github.com/tursodatabase/libsql)** - libSQL source code

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Reset database
rm -rf ./data/libsql && docker-compose up -d

# Run Payload migrations
cd payload-app && npm run payload migrate
```

## Tech Stack

- **CMS**: [Payload CMS](https://payloadcms.com) v3+
- **Database**: [libSQL](https://github.com/tursodatabase/libsql) (SQLite fork)
- **Cloud DB**: [Turso](https://turso.tech) for production
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Runtime**: Node.js 20+
- **Local Dev**: Docker & Docker Compose (Options 1 & 2) or Turso CLI (Option 3)

## License

MIT

# Payload CMS + libSQL/Turso Local Development Stack

A Docker-based local development environment for Payload CMS with libSQL server, mirroring Turso's cloud setup for seamless development-to-production workflows.

## Features

- 🐳 **Dockerized Stack** - libSQL server + Payload CMS in containers
- 🔐 **JWT Authentication** - Optional production-like auth setup
- 🚀 **Serverless Ready** - Deploy to AWS Lambda, Vercel, Netlify
- 🔄 **Turso Compatible** - Seamless migration to Turso Cloud
- 📦 **TypeScript & CDK** - Full type safety and IaC support

## Quick Start

```bash
# 1. Make the quick-start script executable
chmod +x quick-start.sh

# 2. Run it and choose your option
./quick-start.sh
```

The script will:
- Create necessary directories and configuration
- Generate JWT keys (if using auth option)
- Set up environment variables
- Guide you through Payload app creation
- Start the Docker stack

### Manual Setup

If you prefer manual setup or need more control:

```bash
# 1. Create Payload app
npx create-payload-app@latest payload-app

# 2. Install dependencies
cd payload-app
npm install @payloadcms/db-sqlite

# 3. Start services (choose one)
docker-compose up -d                      # With JWT auth
docker-compose -f docker-compose-simple.yml up -d  # Simple, no auth

# 4. Access Payload
open http://localhost:3000/admin
```

See **[SETUP.md](./SETUP.md)** for detailed instructions.

## Project Structure

```
.
├── docker-compose.yml          # Full stack with JWT auth
├── docker-compose-simple.yml   # Simple stack without auth
├── payload-app/                # Your Payload CMS application
│   ├── payload.config.ts       # Database configuration
│   ├── Dockerfile              # Container definition
│   └── package.json            # Dependencies
├── config/                     # JWT keys (if using auth)
│   ├── jwt-private-key.pem
│   └── jwt-public-key.pem
├── data/                       # Persistent database storage
│   └── libsql/
├── .env                        # Environment variables
├── SETUP.md                    # Detailed setup guide
└── README.md                   # This file
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Payload Admin | http://localhost:3000/admin | CMS admin panel |
| Payload API | http://localhost:3000/api | REST & GraphQL API |
| libSQL Server | http://localhost:8080 | Database server |

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

When ready for production, migrate to Turso Cloud:

```bash
# Create production database
turso db create production-db

# Get credentials
turso db show production-db --url
turso db tokens create production-db

# Update env vars and deploy
# DATABASE_URI=libsql://production-db.turso.io
# DATABASE_AUTH_TOKEN=<your-token>
```

Your application code remains identical.

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions for both options
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
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Runtime**: Node.js 20+
- **Containers**: Docker & Docker Compose

## License

MIT

# libSQL + Payload CMS Local Development Stack

This guide provides two options for running libSQL server locally with Payload CMS.

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- OpenSSL (for JWT option)

## Option 1: Docker with JWT Authentication (Production-like)

This setup mirrors Turso's cloud authentication using JWT tokens.

### Setup Steps

1. **Initialize your Payload app:**
```bash
npx create-payload-app@latest payload-app
# Choose SQLite when prompted for database
```

2. **Install additional dependencies:**
```bash
cd payload-app
npm install @payloadcms/db-sqlite jsonwebtoken
npm install -D @types/jsonwebtoken
```

3. **Generate JWT keys:**
```bash
cd ..
chmod +x setup-jwt-auth.sh
./setup-jwt-auth.sh
```

4. **Create `.env` file:**
```env
LIBSQL_JWT_TOKEN=<token-from-setup-script>
PAYLOAD_SECRET=<generated-secret>
```

5. **Start the stack:**
```bash
docker-compose up -d
```

6. **Access Payload:**
- Payload Admin: http://localhost:3000/admin
- libSQL Server: http://localhost:8080

### Testing the Connection

```typescript
import { createClient } from "@libsql/client";

const client = createClient({
  url: "http://localhost:8080",
  authToken: process.env.LIBSQL_JWT_TOKEN
});

const result = await client.execute("SELECT 1");
console.log(result);
```

---

## Option 2: Simple Docker Setup (No Authentication)

Simpler setup for local development without authentication.

### Setup Steps

1. **Initialize your Payload app:**
```bash
npx create-payload-app@latest payload-app
# Choose SQLite when prompted for database
```

2. **Install SQLite adapter:**
```bash
cd payload-app
npm install @payloadcms/db-sqlite
```

3. **Update `payload.config.ts`** (see payload.config.ts artifact)

4. **Create `.env` file:**
```env
DATABASE_URI=http://libsql:8080
PAYLOAD_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

5. **Start the stack:**
```bash
docker-compose -f docker-compose-simple.yml up -d
```

6. **Access Payload:**
- Payload Admin: http://localhost:3000/admin
- libSQL Server: http://localhost:8080

---

## Option 3 (Alternative): Using Turso CLI (No Docker)

If you prefer not to use Docker:

1. **Install Turso CLI:**
```bash
# macOS
brew install tursodatabase/tap/turso

# Linux/WSL
curl -sSfL https://get.tur.so/install.sh | bash
```

2. **Start local libSQL server:**
```bash
turso dev --port 8080
```

3. **Update your `.env`:**
```env
DATABASE_URI=http://127.0.0.1:8080
```

4. **Start Payload:**
```bash
cd payload-app
npm run dev
```

---

## Database Persistence

### Docker Volumes
Data is persisted in `./data/libsql` directory. To reset:
```bash
docker-compose down
rm -rf ./data/libsql
docker-compose up -d
```

### Turso CLI
Data is stored in `.turso/` directory by default. Specify a file:
```bash
turso dev --db-file ./local.db
```

---

## Payload Migrations

Run migrations in production:
```bash
cd payload-app
npm run payload migrate
```

Generate new migrations:
```bash
npm run payload migrate:create
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URI` | Yes | libSQL server URL |
| `DATABASE_AUTH_TOKEN` | No | JWT token for authentication |
| `PAYLOAD_SECRET` | Yes | Secret for Payload sessions |
| `NODE_ENV` | No | Environment (development/production) |

---

## Troubleshooting

### Connection refused
- Ensure libSQL container is running: `docker-compose ps`
- Check logs: `docker-compose logs libsql`

### Authentication errors (Option 1)
- Verify JWT token is valid
- Check public key is mounted correctly
- Regenerate token with `node generate-token.js`

### Payload won't start
- Check DATABASE_URI is accessible from container
- Verify `@payloadcms/db-sqlite` is installed
- Check logs: `docker-compose logs payload`

---

## Production Deployment

When deploying to production with Turso Cloud:

1. **Create Turso database:**
```bash
turso db create production-db
```

2. **Get connection details:**
```bash
turso db show production-db --url
turso db tokens create production-db
```

3. **Update environment variables:**
```env
DATABASE_URI=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=<your-token>
NODE_ENV=production
```

4. **Run migrations:**
```bash
npm run payload migrate
```

---

## Additional Resources

- [Payload CMS SQLite Docs](https://payloadcms.com/docs/database/sqlite)
- [Turso Documentation](https://docs.turso.tech)
- [libSQL GitHub](https://github.com/tursodatabase/libsql)

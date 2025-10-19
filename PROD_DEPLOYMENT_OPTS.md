# Production Deployment Options

Guide for deploying your Payload CMS + libSQL/Turso development setup to production.

## Overview

All three development options can be deployed to production with minimal changes. The key decision is choosing your deployment platform based on your requirements.

## Quick Comparison

| Platform | Best For | Complexity | Monthly Cost | Setup Time |
|----------|----------|------------|--------------|------------|
| **VPS + Coolify** | Full control, Docker-based | Low | $5-20 | 30 min |
| **VPS + Manual** | Maximum control | Medium | $5-20 | 1-2 hours |
| **Railway/Render** | Simplicity, Git-based | Very Low | $5-25 | 15 min |
| **AWS Serverless** | Auto-scaling, enterprise | High | $5-200+ | 2-4 hours |
| **Vercel/Netlify** | Serverless, edge | Medium | $0-20 | 30 min |
| **Cloudflare Workers** | Global edge | Medium | $5-20 | 1 hour |

---

## Option A: VPS with Coolify (Recommended)

Deploy your existing Docker setup to production with Coolify's automated management.

### When to Choose This
- ✅ You want full control over your infrastructure
- ✅ Your Docker setup works great locally
- ✅ You prefer traditional server hosting
- ✅ You want predictable costs

### Architecture

```
Internet → Coolify (Reverse Proxy + SSL)
           └─► Docker Containers
               ├─► Payload CMS (your app)
               └─► Turso Cloud (database)
```

### Prerequisites

- VPS (2GB+ RAM recommended)
  - DigitalOcean, Hetzner, Linode, Vultr, etc.
- Domain name
- Coolify installed on VPS

### Deployment Steps

#### 1. Set Up VPS and Install Coolify

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Coolify (one-liner)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Access Coolify at `http://your-vps-ip:8000`

#### 2. Create Turso Production Database

```bash
# On your local machine
turso db create payload-production
turso db show payload-production --url
turso db tokens create payload-production
```

Save these credentials - you'll need them for environment variables.

#### 3. Prepare Your Docker Compose for Production

**From opt1-docker-jwt-auth** (with authentication):

Create `docker-compose.production.yml`:

```yaml
version: "3.8"

services:
  payload:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: payload-cms
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URI=${TURSO_DATABASE_URL}
      - DATABASE_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
      - PAYLOAD_PUBLIC_SERVER_URL=${PAYLOAD_PUBLIC_SERVER_URL}
    restart: unless-stopped
```

**From opt2-docker-no-auth** (simple setup):

Same as above - just point `DATABASE_URI` to Turso Cloud.

#### 4. Configure in Coolify

1. **Add New Resource** → "Docker Compose"
2. **Connect Git Repository** (push your code to GitHub/GitLab)
3. **Set Environment Variables**:
   ```
   TURSO_DATABASE_URL=libsql://payload-production.turso.io
   TURSO_AUTH_TOKEN=eyJhbGc...
   PAYLOAD_SECRET=your-32-char-secret
   PAYLOAD_PUBLIC_SERVER_URL=https://cms.yourdomain.com
   ```
4. **Configure Domain**: `cms.yourdomain.com`
5. **Enable SSL**: Coolify auto-generates Let's Encrypt cert
6. **Deploy**

#### 5. Run Database Migrations

```bash
# SSH into your VPS or use Coolify's terminal
docker exec -it payload-cms npm run payload migrate
```

#### 6. Create Admin User

Visit `https://cms.yourdomain.com/admin` and create your first user.

### Cost Breakdown

- **VPS**: $5-20/month (Hetzner CPX11, DO Basic, etc.)
- **Turso**: $0-25/month (generous free tier)
- **Domain**: $10-15/year
- **Total**: ~$5-20/month

### Pros & Cons

**Pros:**
- ✅ Full control over infrastructure
- ✅ Uses your existing Docker setup
- ✅ Coolify handles SSL, deployments, monitoring
- ✅ Predictable, low costs
- ✅ Easy to scale vertically

**Cons:**
- ❌ Manual server management (even with Coolify)
- ❌ No auto-scaling (need to upgrade VPS)
- ❌ Single point of failure (unless clustered)

---

## Option B: VPS Manual Setup

Deploy Docker manually without Coolify for maximum control.

### When to Choose This
- ✅ You want complete control
- ✅ You're comfortable with server administration
- ✅ You don't need Coolify's features

### Deployment Steps

#### 1. Provision VPS & Install Docker

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y
```

#### 2. Set Up Reverse Proxy (Nginx or Caddy)

**Using Caddy** (simpler, auto-SSL):

```bash
# Install Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

Create `/etc/caddy/Caddyfile`:

```
cms.yourdomain.com {
    reverse_proxy localhost:3000
}
```

```bash
systemctl reload caddy
```

#### 3. Deploy Application

```bash
# Clone your repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo/opt1-docker-jwt-auth  # or opt2

# Create .env file
cat > .env << EOF
TURSO_DATABASE_URL=libsql://payload-production.turso.io
TURSO_AUTH_TOKEN=your-token-here
PAYLOAD_SECRET=your-secret-here
PAYLOAD_PUBLIC_SERVER_URL=https://cms.yourdomain.com
EOF

# Start services
docker compose -f docker-compose.production.yml up -d
```

#### 4. Set Up Auto-Restart

Create systemd service or use Docker's restart policies (already in compose file).

### Pros & Cons

**Pros:**
- ✅ Maximum control
- ✅ No dependencies on third-party tools
- ✅ Learn server administration

**Cons:**
- ❌ More manual work
- ❌ You manage SSL renewals
- ❌ You handle deployments manually

---

## Option C: Railway / Render

Platform-as-a-Service deployment with Git integration.

### When to Choose This
- ✅ You want the simplest possible deployment
- ✅ You prefer Git-based deployments
- ✅ You don't want to manage servers

### Railway Deployment

1. **Push to GitHub/GitLab**
2. **Connect Railway**: railway.app
3. **Create New Project** → Import from Git
4. **Add Environment Variables**:
   ```
   DATABASE_URI=libsql://payload-production.turso.io
   DATABASE_AUTH_TOKEN=your-turso-token
   PAYLOAD_SECRET=your-secret
   ```
5. **Deploy** - Railway auto-detects Dockerfile
6. **Add Custom Domain** (optional)

### Render Deployment

Similar process to Railway:

1. **New Web Service** → Connect Git
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Environment Variables**: Same as above
5. **Deploy**

### Cost

- **Railway**: $5/month minimum
- **Render**: $7/month for web service
- **Turso**: Free tier or $25/month

### Pros & Cons

**Pros:**
- ✅ Simplest deployment
- ✅ Git-based workflow
- ✅ Auto-deployments on push
- ✅ Free SSL

**Cons:**
- ❌ Less control
- ❌ Can be more expensive at scale
- ❌ Platform lock-in

---

## Option D: AWS Serverless

Lambda, API Gateway, CloudFront deployment using CDK.

### When to Choose This
- ✅ You need auto-scaling
- ✅ You want pay-per-use pricing
- ✅ You're in the AWS ecosystem
- ✅ You need global CDN

### Architecture

```
CloudFront (CDN)
└─► API Gateway
    └─► Lambda (Payload)
        └─► Turso Cloud
```

### Prerequisites

- AWS Account
- AWS CLI configured
- CDK CLI: `npm install -g aws-cdk`
- Turso production database

### Quick Deployment

Complete infrastructure code is available - see `opt4-aws-serverless/` directory in the artifacts above for:
- Full CDK stack definition
- Lambda handler
- Build scripts
- Deployment guide

**Note**: This is a more complex setup suitable for teams or enterprise. See the detailed AWS README in the artifacts for complete instructions.

### Cost

- **Low traffic**: $5-10/month
- **Medium traffic**: $25-70/month
- **High traffic**: $100-200+/month

### Pros & Cons

**Pros:**
- ✅ Auto-scaling
- ✅ Global distribution
- ✅ Pay per use
- ✅ Infrastructure as Code

**Cons:**
- ❌ Most complex setup
- ❌ AWS learning curve
- ❌ Costs can increase with traffic

---

## Option E: Vercel / Netlify

Serverless edge deployment.

### When to Choose This
- ✅ You're already using Vercel/Netlify
- ✅ You want edge deployment
- ✅ Simple serverless setup

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# DATABASE_URI, DATABASE_AUTH_TOKEN, PAYLOAD_SECRET
```

### Netlify Deployment

Similar to Vercel - deploy via Git or CLI with environment variables.

### Pros & Cons

**Pros:**
- ✅ Simple serverless
- ✅ Edge network
- ✅ Generous free tier

**Cons:**
- ❌ Function timeout limits
- ❌ Cold starts
- ❌ Not ideal for admin-heavy CMS

---

## Migration from Development to Production

### From opt1-docker-jwt-auth

**Best Production Options:**
1. **VPS + Coolify** (recommended) - Same Docker setup
2. **VPS Manual** - Same Docker setup
3. **AWS Serverless** - For auto-scaling needs

**Migration Steps:**
1. Create Turso production database
2. Update `DATABASE_URI` to point to Turso Cloud
3. Keep existing `DATABASE_AUTH_TOKEN` env var
4. Deploy to chosen platform
5. Run migrations

### From opt2-docker-no-auth

**Best Production Options:**
1. **VPS + Coolify** (recommended)
2. **VPS Manual**
3. **Railway/Render** - Very similar workflow

**Migration Steps:**
1. Create Turso production database
2. Update `DATABASE_URI` to Turso Cloud
3. Add `DATABASE_AUTH_TOKEN` env var
4. Deploy
5. Run migrations

### From opt3-no-docker

**Best Production Options:**
1. **Railway/Render** (recommended) - No Docker needed
2. **Vercel/Netlify** - Serverless
3. **AWS Lambda** - Advanced serverless

**Migration Steps:**
1. Already using Turso for dev - just create production DB
2. Update environment variables
3. Deploy to platform
4. No Docker needed!

---

## Environment Variables Checklist

All production deployments need these variables:

```bash
# Database (Turso Cloud)
DATABASE_URI=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=eyJhbGc...

# Payload
PAYLOAD_SECRET=minimum-32-character-secret-key
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com

# Optional
NODE_ENV=production
PORT=3000
```

---

## Security Checklist

Before going to production:

- [ ] Use Turso Cloud (not local libSQL)
- [ ] Strong `PAYLOAD_SECRET` (32+ characters)
- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured (not in code)
- [ ] Database backups enabled (Turso handles this)
- [ ] CORS configured properly
- [ ] Rate limiting enabled (API Gateway/Cloudflare)
- [ ] Admin panel protected (Payload handles auth)

---

## Recommendation by Use Case

| Use Case | Recommended Platform |
|----------|---------------------|
| **Small project, low traffic** | VPS + Coolify |
| **Maximum control** | VPS Manual |
| **Simplest deployment** | Railway/Render |
| **Need auto-scaling** | AWS Serverless |
| **Already on Vercel** | Vercel/Netlify |
| **Team/enterprise** | AWS Serverless + CDK |
| **Cost-sensitive** | VPS + Coolify ($5/mo) |
| **Global audience** | AWS/Vercel with CDN |

---

## Next Steps

1. Choose your deployment platform
2. Create Turso production database
3. Follow platform-specific guide above
4. Run migrations
5. Create admin user
6. Test thoroughly
7. Monitor and optimize

---

## Support Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Turso Production Guide](https://docs.turso.tech)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk)
- [Payload Deployment Guide](https://payloadcms.com/docs/production/deployment)

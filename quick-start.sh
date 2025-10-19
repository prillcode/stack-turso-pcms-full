#!/bin/bash

set -e

echo "🚀 Payload CMS + libSQL Local Development Setup"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Choose setup option
echo "Choose your setup option:"
echo "1) Simple (No authentication - fastest setup)"
echo "2) JWT Authentication (Production-like)"
read -p "Enter choice [1-2]: " choice

case $choice in
  1)
    COMPOSE_FILE="docker-compose-simple.yml"
    USE_JWT=false
    ;;
  2)
    COMPOSE_FILE="docker-compose.yml"
    USE_JWT=true
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

# Create directories
echo "📁 Creating directories..."
mkdir -p data/libsql config payload-app

# Generate .env if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  PAYLOAD_SECRET=$(openssl rand -base64 32)
  
  if [ "$USE_JWT" = true ]; then
    echo "🔐 Generating JWT keys..."
    mkdir -p config
    openssl genpkey -algorithm Ed25519 -out config/jwt-private-key.pem
    openssl pkey -in config/jwt-private-key.pem -pubout -out config/jwt-public-key.pem
    
    # Create a simple Node script to generate token
    cat > generate-token-temp.js << 'EOF'
const crypto = require('crypto');
const fs = require('fs');

const privateKey = fs.readFileSync('./config/jwt-private-key.pem', 'utf8');
const payload = {
  sub: 'dev-user',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
};

// Simple JWT generation without external deps
const header = { alg: 'EdDSA', typ: 'JWT' };
const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
const message = encodedHeader + '.' + encodedPayload;

const sign = crypto.createSign('EdDSA');
sign.update(message);
const signature = sign.sign({ key: privateKey, format: 'pem' }, 'base64url');

const token = message + '.' + signature;
console.log(token);
EOF
    
    JWT_TOKEN=$(node generate-token-temp.js)
    rm generate-token-temp.js
    
    cat > .env << EOF
LIBSQL_JWT_TOKEN=$JWT_TOKEN
PAYLOAD_SECRET=$PAYLOAD_SECRET
DATABASE_URI=http://libsql:8080
NODE_ENV=development
EOF
  else
    cat > .env << EOF
PAYLOAD_SECRET=$PAYLOAD_SECRET
DATABASE_URI=http://libsql:8080
NODE_ENV=development
EOF
  fi
  
  echo "✅ .env file created"
else
  echo "⚠️  .env file already exists, skipping..."
fi

# Check if payload-app exists
if [ ! -d "payload-app/package.json" ]; then
  echo "📦 Creating Payload app..."
  echo "Please run: npx create-payload-app@latest payload-app"
  echo "Choose SQLite when prompted for database"
  echo ""
  echo "After creating the app, run this script again."
  exit 0
fi

# Start Docker Compose
echo "🐳 Starting Docker containers..."
docker-compose -f $COMPOSE_FILE up -d

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Services:"
echo "   - Payload CMS: http://localhost:3000/admin"
echo "   - libSQL Server: http://localhost:8080"
echo ""
echo "📋 Next steps:"
echo "   1. Wait for services to start (check: docker-compose logs -f)"
echo "   2. Access Payload admin panel"
echo "   3. Create your first admin user"
echo ""
echo "🛠️  Useful commands:"
echo "   - View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   - Stop services: docker-compose -f $COMPOSE_FILE down"
echo "   - Restart: docker-compose -f $COMPOSE_FILE restart"
echo ""

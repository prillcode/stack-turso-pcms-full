#!/bin/bash

# Create directories
mkdir -p config data/libsql

# Generate Ed25519 key pair for JWT authentication
openssl genpkey -algorithm Ed25519 -out config/jwt-private-key.pem
openssl pkey -in config/jwt-private-key.pem -pubout -out config/jwt-public-key.pem

echo "✅ JWT keys generated successfully!"
echo ""
echo "Private key: config/jwt-private-key.pem (keep this secure!)"
echo "Public key: config/jwt-public-key.pem"
echo ""

# Generate a JWT token for development
node generate-token.js

echo ""
echo "⚠️  Add the following to your .env file:"
echo "LIBSQL_JWT_TOKEN=<token from above>"
echo "PAYLOAD_SECRET=$(openssl rand -base64 32)"

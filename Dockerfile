FROM node:20-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Generate Payload types
RUN npm run generate:types || true

# Expose port
EXPOSE 3000

# Start development server (override with docker-compose command)
CMD ["npm", "run", "dev"]

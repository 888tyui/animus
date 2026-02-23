#!/bin/bash
set -e

echo "=== Animus Local Development Setup ==="
echo ""

# 1. Start PostgreSQL
echo "[1/6] Starting PostgreSQL with Docker Compose..."
docker compose up -d postgres
echo "  Waiting for PostgreSQL to be ready..."
sleep 3

# 2. Install frontend dependencies
echo "[2/6] Installing frontend dependencies..."
cd "$(dirname "$0")/.."
npm install

# 3. Install server dependencies
echo "[3/6] Installing server dependencies..."
cd server
npm install

# 4. Generate Prisma client
echo "[4/6] Generating Prisma client..."
npx prisma generate

# 5. Run database migrations
echo "[5/6] Running database migrations..."
npx prisma migrate dev --name init 2>/dev/null || npx prisma migrate deploy

# 6. Create .env files if missing
cd ..
echo "[6/6] Checking environment files..."

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "  Created .env.local (edit NEXT_PUBLIC_API_URL if needed)"
else
  echo "  .env.local already exists, skipping"
fi

if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  # Generate a random JWT_SECRET
  JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | xxd -p | tr -d '\n' | head -c 64)
  if [ -n "$JWT_SECRET" ]; then
    sed -i.bak "s/^JWT_SECRET=$/JWT_SECRET=${JWT_SECRET}/" server/.env && rm -f server/.env.bak
    echo "  Created server/.env with generated JWT_SECRET"
  else
    echo "  Created server/.env (you must set JWT_SECRET manually)"
  fi
  echo "  NOTE: You must set GITHUB_TOKEN in server/.env"
else
  echo "  server/.env already exists, skipping"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Start development:"
echo "  Terminal 1:  cd server && npm run dev"
echo "  Terminal 2:  npm run dev"
echo ""
echo "Open:  http://localhost:3000"
echo ""

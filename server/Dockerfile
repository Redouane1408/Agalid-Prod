FROM node:18
WORKDIR /app
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY . .

RUN rm -f .env .env.* || true

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 4000
# Run migrations before starting
CMD ["sh", "-c", "set -e; set +e; npx prisma migrate deploy; rc=$?; set -e; if [ $rc -ne 0 ]; then npx prisma migrate resolve --rolled-back 20260212225842_fix_quote_schema || true; npx prisma migrate deploy; fi; npm run start"]


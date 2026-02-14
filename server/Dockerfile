FROM node:18
WORKDIR /app
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY . .


# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 4000
# Run migrations before starting
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]


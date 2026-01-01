FROM node:18
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "start:dev"]


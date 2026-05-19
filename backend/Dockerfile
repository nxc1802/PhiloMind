FROM node:18-alpine

WORKDIR /app

# Install openssl for Prisma compatibility
RUN apk add --no-cache openssl curl

# Copy dependencies manifest
COPY package*.json ./

# Install packages
RUN npm ci

# Copy code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build typescript compilation
RUN npm run build

EXPOSE 7860

# Bootstraps API server
CMD ["node", "dist/src/main"]

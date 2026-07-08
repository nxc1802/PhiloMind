FROM node:22-alpine

WORKDIR /app

# Install openssl for Prisma compatibility
RUN apk add --no-cache openssl curl

# Hugging Face Spaces requires the container to run as a non-root user with UID 1000.
# The node:22-alpine image already has a 'node' user with UID 1000.
# We change ownership of the copied files so the node user can access them.

# Copy dependencies manifest
COPY --chown=node:node package*.json ./

# Install packages
RUN npm ci

# Copy code
COPY --chown=node:node . .

# Generate Prisma client
RUN npx prisma generate

# Build typescript compilation
RUN npm run build

# Switch to non-root user
USER node

ENV PORT=7860
EXPOSE 7860

# Bootstraps API server
CMD ["node", "dist/src/main"]

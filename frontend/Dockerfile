FROM node:18-alpine

WORKDIR /app

# Install simple http server for serving static files
RUN npm install -g serve

# Copy package lists
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy code
COPY . .

# Build React app
RUN npm run build

EXPOSE 3000

# Serve static build on port 3000
CMD ["serve", "-s", "build", "-l", "3000"]

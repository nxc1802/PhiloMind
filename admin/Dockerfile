FROM node:22-alpine

WORKDIR /app

# Install simple http server for serving static files
RUN npm install -g serve

# Copy package lists
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy code
COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build Admin app (Vite generates output in 'dist')
RUN npm run build

EXPOSE 3002

# Serve static build on port 3002
CMD ["serve", "-s", "dist", "-l", "3002"]

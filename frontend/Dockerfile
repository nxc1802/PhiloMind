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

ARG REACT_APP_API_URL
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY

# Build React app
RUN npm run build

EXPOSE 3000

# Serve static build on port 3000
CMD ["serve", "-s", "build", "-l", "3000"]

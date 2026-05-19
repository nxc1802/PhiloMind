FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source files
COPY . .

# Set environment variables for production compilation
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Build NextJS production app
RUN npm run build

# Expose port and define runtime command
EXPOSE 7860
ENV PORT=7860
ENV HOST=0.0.0.0

CMD ["npm", "run", "start"]

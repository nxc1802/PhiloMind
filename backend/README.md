---
title: PhiloMind Backend
emoji: 🚀
colorFrom: purple
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# PhiloMind Backend API Server

PhiloMind is an AI-powered philosophy learning platform. This is the NestJS API backend server running in a persistent Hugging Face Spaces Docker container.

## API Documentation
Once running, the Swagger documentation is accessible at `/docs` (or `/api/docs` depending on configuration).

## Health Check
- Root health check: `/`
- Service health check: `/health` (provides timestamped server runtime health logs)

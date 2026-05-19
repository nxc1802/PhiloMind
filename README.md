# PhiloMind - AI Philosophy Learning Sanctuary

PhiloMind is an AI-powered interactive learning sanctuary that transforms linear philosophy textbooks into structured visual roadmaps, zoomable mindmaps, Socratic debate partners, AI-generated podcasts, and spaced repetition flashcards.

This repository is organized as a clean, containerized monorepo.

---

## 🚀 Key Features

- **Interactive Mindmap Canvas**: Converts hierarchical textbook concepts into zoomable, animated nodes (using React Flow & Framer Motion).
- **Conversational AI Podcasts**: Generates dialogue scripts between host and guest philosophers, read out by a free open-source Text-to-Speech engine.
- **Socratic Debate Arena**: Challenge your own philosophical claims against a gentle but critical Socratic AI tutor.
- **SM-2 Spaced Repetition**: Automatically synthesizes and schedules study cards for optimal long-term retention.
- **Zero-Cost Deployments**: Automatically configured to deploy to Hugging Face Spaces using GitHub Actions.

---

## 📁 Repository Structure

```
PhiloMind/
├── .github/workflows/
│   ├── ci.yml            # CI validation (formatting, compilation, linting)
│   └── deploy.yml        # CD deployment pushing to Hugging Face Spaces
├── backend/              # NestJS REST API with Prisma and Supabase connections
├── frontend/             # Next.js web application utilizing React Flow
├── tts_worker/           # FastAPI Text-to-Speech worker (Kokoro-82M ONNX model)
├── docs/                 # Architectural and deployment guides
└── scripts/              # Integration and health test utilities
```

---

## 🛠️ Deployment Configuration (GitHub Actions CD)

This repository includes continuous deployment pipelines that automatically build and deploy your services to Hugging Face Spaces on every push to the `main` branch:

1. **Backend API Server (NestJS)**: Pushed to [Cuong2004/PhiloMind](https://huggingface.co/spaces/Cuong2004/PhiloMind) (runs 24/7 on Hugging Face Docker Space, listening on port 7860).
2. **TTS Worker (FastAPI)**: Pushed to [Cuong2004/PhiloMind_TTSworker](https://huggingface.co/spaces/Cuong2004/PhiloMind_TTSworker) (ONNX speech synthesis microservice).
3. **Frontend Application (Next.js)**: Deployed to **Vercel** (connected directly to the `/frontend` directory of this repo for fast global edge serving and native React/Next rendering).

*To enable deployment, ensure you have added your Hugging Face write token to the GitHub Repository Secrets as `HF_TOKEN`.*

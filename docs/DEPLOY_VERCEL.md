# Deploying PhiloMind to Vercel

This guide outlines the step-by-step process of deploying the **PhiloMind Frontend** (React / Create React App) and optionally the **NestJS Backend** on Vercel. 

---

## 1. Prerequisites
- A Vercel Account linked to your GitHub/GitLab repository.
- A Supabase PostgreSQL database instance (with `pgvector` enabled).
- An OpenRouter API Key for standard OpenAI-compatible completions.
- The URL of your deployed **TTS Worker Service** (e.g., hosted on Hugging Face Spaces or Render).

---

## 2. Deploying the Frontend (React / Create React App)

The frontend is a standard React (Create React App) application located in the `frontend/` directory.

### Steps:
1. Go to your **Vercel Dashboard** and click **Add New** > **Project**.
2. Select your `PhiloMind` monorepo repository.
3. In the project setup panel, configure these settings:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
4. Expand **Environment Variables** and add the following key:
   | Key | Description | Example / Recommended Value |
   | --- | --- | --- |
   | `REACT_APP_API_URL` | The public endpoint of your deployed NestJS backend service. | `https://cuong2004-philomind.hf.space/api` |
5. Click **Deploy**. Vercel will build, optimize, and serve your React-based philosophy learning sandbox immediately.

---

## 3. Deploying the Backend (NestJS Serverless)

Because NestJS is a persistent server, deploying it as serverless functions on Vercel requires configuring a `vercel.json` file in the `backend/` directory to wrap routes into a serverless handler. Alternatively, we highly recommend deploying the backend container to a persistent server service (like **Railway**, **Render**, or **Hugging Face Docker Spaces**), which fully supports background jobs and webhooks without execution timeouts.

### Environment Configuration:
Set the following keys on your backend hosting provider:
```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@db-host:5432/postgres?sslmode=require
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=your-openrouter-api-key
OPENAI_API_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=meta-llama/llama-3-70b-instruct:free
TTS_WORKER_URL=https://your-huggingface-space-tts.hf.space
```

### Vercel Routing Configuration (`vercel.json`)
If you decide to deploy the backend to Vercel as serverless functions, create a [vercel.json](file:///Volumes/WorkSpace/Project/PhiloMind/backend/vercel.json) in `backend/`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/main.ts"
    }
  ]
}
```

Make sure that `main.ts` exports the Express server handler as a serverless module.

---

## 4. Verification
Once deployed, navigate to your Vercel frontend URL. Open your browser console and verify that:
1. Active roadmaps are fetched from the backend.
2. Socratic debate sessions receive replies.
3. Spaced repetition due counts update in real-time.

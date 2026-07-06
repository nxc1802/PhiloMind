---
title: PhiloMind TTS Worker
sdk: docker
app_port: 7860
---

# PhiloMind TTS Worker

FastAPI service that returns WAV audio for backend podcast/TTS preview requests.

## Stack

- FastAPI
- Uvicorn
- Pydantic
- Kokoro ONNX when model assets load
- Synthetic fallback WAV generator when Kokoro assets are unavailable

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Reports health, engine, and model load state. |
| `POST` | `/api/tts/synthesize` | Accepts `{ "text": "...", "voice": "af_bella" }` and streams `audio/wav`. |

Input text is limited to 2000 characters.

## Local Run

```bash
pip install -r requirements.txt
python main.py
```

Default local port: `8000`.

Docker/Hugging Face deployments should set `PORT`; Hugging Face Spaces uses `7860`.

## Backend Integration

The NestJS backend calls this service through `TTS_WORKER_URL`, then uploads or stores the resulting WAV through its storage path. See `../docs/OPERATIONS.md` for deployment and env details.

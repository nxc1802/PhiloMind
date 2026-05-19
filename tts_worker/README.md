---
title: PhiloMind TTS Worker
emoji: 🗣️
colorFrom: blue
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# PhiloMind Text-To-Speech (TTS) Worker

This is the standalone FastAPI backend service running Kokoro-82M for fast, open-source Text-To-Speech generation. It is packaged with Docker and deployed to Hugging Face Spaces.

## Tech Stack
- **Framework**: FastAPI (Python)
- **Model**: Kokoro-82M (Kokoro-ONNX)
- **Audio Output**: WAV via `soundfile`

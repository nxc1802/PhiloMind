# Deploying TTS Worker Service to Hugging Face Spaces

This guide walks through deploying the open-source **Text-to-Speech (TTS) Worker Service** to Hugging Face Spaces using the Docker SDK. This gives you a permanent, high-performance, 100% free speech synthesis server for **PhiloMind** without any local resource overhead.

---

## 1. Why Hugging Face Spaces?
- **Zero Cost**: Runs 24/7 on free CPU basic hardware specs.
- **Docker Native**: Deploys any customized container image seamlessly.
- **Fast ONNX execution**: The Kokoro-82M model compiles and executes within ~200ms on CPU cores, making it extremely suitable for free space layers.

---

## 2. Setting Up the Space
1. Sign in to your [Hugging Face Account](https://huggingface.co/).
2. Navigate to your profile and click **New Space**.
3. Fill in the Space details:
   - **Space Name**: `philomind-tts` (or any custom name)
   - **License**: `mit`
   - **SDK**: **Docker** (CRITICAL: Do NOT select Streamlit, Gradio, or static HTML).
   - **Template**: Choose **Blank** (default).
   - **Space Hardware**: **CPU basic** (Free, 2 vCPUs, 16GB RAM).
   - **Visibility**: Public (for easy API access) or Private (requires passing HF API tokens).
4. Click **Create Space**.

---

## 3. Configuring the Code for Hugging Face
Hugging Face requires all HTTP containers to listen on port **`7860`** by default. Our TTS Worker is already designed to adapt dynamically via the `PORT` environment variable!

### Step 1: Push TTS Worker files to the Space
You can clone the Space repository and copy the files from the `tts_worker/` directory into it:
```bash
# Clone space (replace with your username/space-name)
git clone https://huggingface.co/spaces/YOUR_USERNAME/philomind-tts

# Copy our TTS worker files
cp -r /Volumes/WorkSpace/Project/PhiloMind/tts_worker/* ./philomind-tts/
cd philomind-tts
```

### Step 2: Push changes to trigger automatic deployment
```bash
git add .
git commit -m "Initialize Kokoro-82M TTS Worker for PhiloMind"
git push
```

Hugging Face will automatically pull the dependencies, build the Docker image, download the lightweight Kokoro model weights, and spin up the FastAPI service.

---

## 4. Environment Variables on Hugging Face
Once the build is complete, go to the Space **Settings** and verify or add these environment variables under **Variables and Secrets**:
- `PORT`: `7860` (Forces FastAPI to listen on port 7860 as expected by HF proxy router).
- `MODEL_NAME`: `Kokoro-82M`

---

## 5. Connecting the Backend to Hugging Face
Once your space shows a green **Running** badge, copy its Direct URL.
Format: `https://YOUR_USERNAME-philomind-tts.hf.space`

Go to your **Backend Service** environment variables (e.g., on Vercel or local `.env` files) and update:
```env
TTS_WORKER_URL=https://YOUR_USERNAME-philomind-tts.hf.space
```

The NestJS backend will now forward podcast conversational scripts to Hugging Face, retrieve synthesized speech binaries, and store them directly in your Supabase bucket.

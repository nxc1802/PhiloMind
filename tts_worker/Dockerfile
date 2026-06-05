FROM python:3.10-slim

# Create a non-root user first
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m -s /bin/bash appuser

WORKDIR /app

# Install system dependencies including libsndfile1 (needed by soundfile / kokoro)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app files into container
COPY . /app

# Download Kokoro-82M ONNX model weights and voices definitions during build phase
RUN mkdir -p /app/models && \
    curl -L -o /app/models/kokoro-v0_19.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/v0.1.0/kokoro-v0_19.onnx && \
    curl -L -o /app/models/voices.json https://github.com/thewh1teagle/kokoro-onnx/releases/download/v0.1.0/voices.json && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port (must be 7860 for Hugging Face Spaces deployment)
EXPOSE 7860
ENV PORT=7860

# Optimize for MacOS (Apple Silicon) to prevent audio static noise / ONNX threading issues
ENV OMP_NUM_THREADS=1
ENV OPENBLAS_NUM_THREADS=1
ENV MKL_NUM_THREADS=1

# Run FastAPI using uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]

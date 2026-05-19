FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including libsndfile1 (needed by soundfile / kokoro)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements directly for speed and reproducibility
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    pydantic \
    numpy \
    onnxruntime \
    soundfile \
    kokoro-onnx

# Copy the app files into container
COPY . /app

# Expose port
EXPOSE 8000

# Run FastAPI using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

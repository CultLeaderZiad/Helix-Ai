FROM python:3.12-slim

LABEL org.opencontainers.image.title="Helix-Ai Scrapling Worker" \
      org.opencontainers.image.description="Dedicated Scrapling extraction worker claiming jobs from Helix-Ai Supabase" \
      org.opencontainers.image.licenses="BSD-3-Clause"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && scrapling install

RUN mkdir -p /tmp/helix-leadgen-checkpoints

COPY . /app

ENV PYTHONUNBUFFERED=1 \
    PORT=8080 \
    SCRAPLING_CHECKPOINT_DIR=/tmp/helix-leadgen-checkpoints

EXPOSE 8080

CMD ["python", "main.py"]

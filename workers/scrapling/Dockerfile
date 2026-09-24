FROM ghcr.io/d4vinci/scrapling:latest

LABEL org.opencontainers.image.title="Helix-Ai Scrapling Worker" \
      org.opencontainers.image.description="Dedicated Scrapling extraction worker claiming jobs from Helix-Ai Supabase" \
      org.opencontainers.image.licenses="BSD-3-Clause"

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    scrapling install

# Checkpoints directory
RUN mkdir -p /tmp/helix-leadgen-checkpoints

# Copy worker application and recipe definitions
COPY . /app

EXPOSE 8080

ENV PYTHONUNBUFFERED=1 \
    PORT=8080 \
    SCRAPLING_CHECKPOINT_DIR=/tmp/helix-leadgen-checkpoints

CMD ["python", "main.py"]

# Multi-stage Dockerfile for DevSecOps Flask Application
# Stage 1: Build stage
FROM python:3.9-slim AS builder

# Set working directory
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt .

# Install dependencies in a virtual environment
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Stage 2: Production stage
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy backend application
COPY backend/app.py .

# Copy frontend files
COPY frontend/ ./static/

# Create non-root user for security
RUN groupadd -r appuser && \
    useradd -r -g appuser -u 1001 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    APP_ENV=production \
    PORT=5000

# Expose application port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]

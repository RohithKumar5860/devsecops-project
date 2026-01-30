# Stage 1: Builder
FROM python:3.9-slim AS builder

WORKDIR /app

# Install dependencies in a virtual environment
COPY app/requirements.txt .
RUN python -m venv /opt/venv && \
  /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.9-slim

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY app/ .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000



# Run the application
CMD ["python", "app.py"]

# Secure CI/CD Pipeline for a Cloud-Native Flask Application

A production-ready DevSecOps project demonstrating modern CI/CD automation, shift-left security practices, Docker containerization, and Kubernetes-ready deployment with a clean, professional UI.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Security Strategy](#security-strategy)
- [CI/CD Pipeline](#cicd-pipeline)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [UI Overview](#ui-overview)
- [Testing](#testing)
- [Future Improvements](#future-improvements)

## Overview

This project showcases a complete DevSecOps implementation for a Flask-based web application. It demonstrates industry best practices for secure software development, automated testing, vulnerability scanning, containerization, and orchestration.

The application features a clean separation between backend (Flask REST API) and frontend (vanilla HTML/CSS/JavaScript), emphasizing security-first development and automated deployment workflows.

## Architecture

### Backend + Frontend Separation

The project follows a clear separation of concerns:

- **Backend (`backend/`)**: Pure Flask REST API providing JSON endpoints
  - No HTML rendering
  - Stateless design
  - Environment-based configuration
  - RESTful architecture

- **Frontend (`frontend/`)**: Static web interface
  - Vanilla HTML, CSS, and JavaScript
  - Fetches data from backend APIs
  - Modern, responsive design
  - No framework dependencies

This separation enables:
- Independent scaling of frontend and backend
- Clear API contracts
- Easier testing and maintenance
- Flexibility in deployment strategies

## Project Structure

```
devsecops-project/
├── backend/                    # Flask REST API
│   ├── app.py                 # Main application
│   ├── requirements.txt       # Python dependencies
│   └── test_app.py           # Unit tests
│
├── frontend/                   # Static web interface
│   ├── index.html            # Main HTML page
│   ├── style.css             # Styling and animations
│   └── script.js             # API integration logic
│
├── docker/                     # Container configuration
│   └── Dockerfile            # Multi-stage build
│
├── k8s/                        # Kubernetes manifests
│   ├── deployment.yaml       # Pod deployment
│   ├── service.yaml          # Service exposure
│   ├── configmap.yaml        # Configuration
│   ├── secret.yaml           # Secrets template
│   └── hpa.yaml              # Auto-scaling
│
├── .github/workflows/          # CI/CD automation
│   └── ci-cd.yaml            # GitHub Actions pipeline
│
├── sonar-project.properties   # Code quality config
├── .gitignore                # Git exclusions
└── README.md                 # This file
```

## Technology Stack

### Backend
- **Python 3.9+**: Modern, secure Python runtime
- **Flask 3.0**: Lightweight web framework
- **Pytest**: Unit testing framework

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations
- **Vanilla JavaScript**: No framework dependencies

### DevSecOps Tools
- **Git & GitHub**: Version control
- **GitHub Actions**: CI/CD automation
- **Docker**: Containerization
- **Trivy**: Vulnerability scanning
- **SonarCloud**: Code quality analysis
- **Kubernetes**: Container orchestration

## Features

### Application Features
- RESTful API endpoints for status and health checks
- Environment-based configuration
- Comprehensive error handling
- Health monitoring endpoints
- Clean, modern web interface

### DevSecOps Features
- Automated CI/CD pipeline
- Unit testing with coverage reporting
- Static code analysis
- Container vulnerability scanning
- Multi-stage Docker builds
- Non-root container execution
- Kubernetes-ready deployment
- Horizontal pod autoscaling
- Security context enforcement

## Security Strategy

### Shift-Left Security

Security is integrated throughout the development lifecycle:

1. **Code Quality**: SonarCloud analyzes code for bugs, vulnerabilities, and code smells
2. **Dependency Scanning**: Automated checks for vulnerable dependencies
3. **Container Scanning**: Trivy scans Docker images for CVEs
4. **Secure Defaults**: Non-root users, minimal base images
5. **Secret Management**: Kubernetes secrets for sensitive data
6. **Security Contexts**: Pod and container security policies

### Docker Security

- **Multi-stage builds**: Smaller attack surface
- **Minimal base image**: `python:3.9-slim`
- **Non-root user**: Application runs as UID 1001
- **No hardcoded secrets**: Environment-based configuration
- **Layer optimization**: Efficient caching and minimal layers

### Kubernetes Security

- **Security contexts**: `runAsNonRoot`, `readOnlyRootFilesystem`
- **Resource limits**: CPU and memory constraints
- **Health probes**: Liveness and readiness checks
- **Network policies**: (Future enhancement)
- **RBAC**: (Future enhancement)

## CI/CD Pipeline Execution

### GitHub Actions Setup

The project includes a complete CI/CD pipeline that automates testing, security scanning, Docker builds, and deployment.

#### Step 1: Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: DevSecOps Flask Application"

# Add remote repository
git remote add origin https://github.com/your-username/devsecops-project.git

# Push to GitHub
git push -u origin main
```

#### Step 2: Configure GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

**Required Secrets:**

1. **DOCKERHUB_USERNAME**
   - Your Docker Hub username
   - Example: `johndoe`

2. **DOCKERHUB_TOKEN**
   - Docker Hub access token (not password)
   - Create at: https://hub.docker.com/settings/security
   - Click "New Access Token"

**Optional Secrets (for SonarCloud):**

3. **SONAR_TOKEN**
   - SonarCloud authentication token
   - Create at: https://sonarcloud.io/account/security
   - Only needed if using SonarCloud

4. **GITHUB_TOKEN**
   - Automatically provided by GitHub Actions
   - No manual configuration needed

#### Step 3: Update SonarCloud Configuration (Optional)

If using SonarCloud, update `sonar-project.properties`:

```properties
sonar.projectKey=your-github-username_devsecops-project
sonar.organization=your-sonarcloud-organization
```

Create organization at: https://sonarcloud.io/

#### Step 4: Trigger the Pipeline

The pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Manual trigger:**
```bash
# Make a change
echo "# DevSecOps Project" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger CI/CD pipeline"
git push origin main
```

#### Step 5: Monitor Pipeline Execution

1. Go to your GitHub repository
2. Click on "Actions" tab
3. View the running workflow

**Pipeline Stages:**

```
┌─────────────┐
│   Test      │  ← Run pytest, generate coverage
└──────┬──────┘
       │
┌──────▼──────┐
│ SonarCloud  │  ← Code quality analysis (optional)
└──────┬──────┘
       │
┌──────▼──────┐
│   Build     │  ← Docker build, Trivy scan
└──────┬──────┘
       │
┌──────▼──────┐
│   Deploy    │  ← Push to Docker Hub (main branch only)
└─────────────┘
```

#### Step 6: View Pipeline Results

**Test Results:**
- Click on "Test" job
- View pytest output and coverage report
- Coverage uploaded to Codecov (if configured)

**SonarCloud Results:**
- Visit: https://sonarcloud.io/dashboard?id=your-project-key
- View code quality, security vulnerabilities, code smells

**Trivy Scan Results:**
- Click on "Build and Scan Docker Image" job
- View vulnerability scan results
- Check "Security" tab for SARIF upload

**Docker Hub:**
- Visit: https://hub.docker.com/r/your-username/devsecops-app
- Verify image was pushed successfully

### Local CI/CD Testing

Test pipeline steps locally before pushing:

#### Run Tests Locally

```bash
cd backend
pytest test_app.py -v --cov=app --cov-report=xml
```

#### Build Docker Locally

```bash
docker build -t devsecops-app:latest -f docker/Dockerfile .
```

#### Scan with Trivy Locally

```bash
# Install Trivy
# Windows (using Chocolatey):
choco install trivy

# macOS:
brew install trivy

# Linux:
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Scan image
trivy image devsecops-app:latest
```

#### SonarCloud Scan Locally

```bash
# Install SonarScanner
# Download from: https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/sonarscanner-cli/

# Run scan
sonar-scanner \
  -Dsonar.projectKey=your-project-key \
  -Dsonar.organization=your-org \
  -Dsonar.sources=backend \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=your-token
```

### Pipeline Customization

#### Modify Workflow File

Edit `.github/workflows/ci-cd.yaml` to customize:

**Change trigger branches:**
```yaml
on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main, develop ]
```

**Add environment variables:**
```yaml
env:
  DOCKER_IMAGE: ${{ secrets.DOCKERHUB_USERNAME }}/devsecops-app
  PYTHON_VERSION: '3.9'
  APP_ENV: production
```

**Add deployment to Kubernetes:**
```yaml
- name: Deploy to Kubernetes
  run: |
    kubectl apply -f k8s/
  env:
    KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

### Troubleshooting CI/CD

**Issue: Pipeline fails on test stage**
```bash
# Run tests locally to debug
cd backend
pytest test_app.py -v

# Check for missing dependencies
pip install -r requirements.txt
```

**Issue: Docker build fails**
```bash
# Test build locally
docker build -t devsecops-app:latest -f docker/Dockerfile .

# Check Dockerfile syntax
docker build --no-cache -t devsecops-app:latest -f docker/Dockerfile .
```

**Issue: Trivy scan fails with vulnerabilities**
```bash
# Scan locally to see details
trivy image devsecops-app:latest --severity CRITICAL,HIGH

# Update base image or dependencies
# Edit docker/Dockerfile or backend/requirements.txt
```

**Issue: Docker push fails**
```bash
# Verify secrets are configured
# Check DOCKERHUB_USERNAME and DOCKERHUB_TOKEN in GitHub Secrets

# Test login locally
docker login -u your-username
```

**Issue: SonarCloud fails**
```bash
# Verify SONAR_TOKEN is configured
# Check sonar-project.properties is correct
# Ensure organization exists on SonarCloud
```

## CI/CD Pipeline

### Pipeline Stages

The GitHub Actions workflow implements a comprehensive CI/CD pipeline:

#### 1. Test Stage
- Checkout code
- Set up Python environment
- Install dependencies (with caching)
- Run pytest with coverage
- Upload coverage reports

#### 2. SonarCloud Analysis
- Static code analysis
- Security vulnerability detection
- Code quality metrics
- Technical debt assessment
- Conditional execution (only if secrets configured)

#### 3. Build & Scan Stage
- Docker Buildx setup
- Multi-stage image build
- Trivy vulnerability scan
- Fail on CRITICAL/HIGH vulnerabilities
- Upload security results to GitHub

#### 4. Deploy Stage
- Push image to Docker Hub
- Kubernetes deployment (placeholder)
- Only on main branch

### Pipeline Flow

```
Push/PR → Test → SonarCloud → Build → Trivy Scan → Push Image → Deploy
```

### Security Gates

- Tests must pass
- Trivy scan must not find CRITICAL/HIGH vulnerabilities
- SonarCloud analysis runs (non-blocking)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+**: [Download Python](https://www.python.org/downloads/)
- **Git**: [Download Git](https://git-scm.com/downloads)
- **Docker** (optional): [Download Docker](https://www.docker.com/get-started)
- **kubectl** (optional): [Install kubectl](https://kubernetes.io/docs/tasks/tools/)
- **A code editor**: VS Code, PyCharm, or any text editor

### Quick Start (5 Minutes)

Follow these steps to get the application running locally:

#### Step 1: Clone the Repository

```bash
# Clone the project
git clone <your-repository-url>
cd devsecops-project
```

#### Step 2: Set Up Python Environment

**On Windows:**
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Verify activation (you should see (venv) in your prompt)
```

**On Linux/macOS:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Verify activation (you should see (venv) in your prompt)
```

#### Step 3: Install Dependencies

```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Verify installation
pip list
```

Expected packages:
- Flask==3.0.0
- Werkzeug==3.0.1
- pytest==7.4.3
- pytest-cov==4.1.0

#### Step 4: Run the Application

```bash
# Navigate to backend directory
cd backend

# Start the Flask application
python app.py
```

You should see output like:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

#### Step 5: Access the Application

Open your web browser and navigate to:

- **Frontend Dashboard**: http://localhost:5000/ui
- **API Root**: http://localhost:5000/
- **Health Check**: http://localhost:5000/health
- **API Info**: http://localhost:5000/api/info

**Expected Result:**
- You should see a beautiful dashboard with purple gradient header
- Four cards displaying application info, status, health check, and security features
- Green status indicators showing "Running" and "Healthy"

#### Step 6: Run Tests (Optional)

```bash
# From the backend directory
pytest test_app.py -v

# With coverage report
pytest test_app.py -v --cov=app --cov-report=term

# Generate HTML coverage report
pytest test_app.py --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

Expected output:
```
test_app.py::test_index_endpoint PASSED
test_app.py::test_health_endpoint PASSED
test_app.py::test_api_info_endpoint PASSED
test_app.py::test_404_error PASSED
test_app.py::test_response_content_type PASSED

====== 5 passed in 0.XX s ======
```

### Troubleshooting Local Setup

**Issue: `python` command not found**
- Solution: Use `python3` instead, or add Python to your PATH

**Issue: Port 5000 already in use**
- Solution: Change the port in `backend/app.py` or stop the conflicting service
  ```bash
  # On Windows
  netstat -ano | findstr :5000
  
  # On Linux/macOS
  lsof -i :5000
  ```

**Issue: Module not found errors**
- Solution: Ensure virtual environment is activated and dependencies are installed
  ```bash
  pip install -r backend/requirements.txt
  ```

**Issue: Frontend not loading data**
- Solution: Check browser console (F12) for errors, ensure backend is running

## Docker Deployment

Docker provides a consistent environment for running the application across different systems. Follow these steps to build and run the application in a container.

### Step-by-Step Docker Execution

#### Step 1: Verify Docker Installation

```bash
# Check Docker version
docker --version

# Verify Docker is running
docker ps
```

Expected output: `Docker version 20.x.x` or higher

#### Step 2: Build the Docker Image

```bash
# From the project root directory
docker build -t devsecops-app:latest -f docker/Dockerfile .
```

**What happens during build:**
1. Stage 1 (Builder): Creates virtual environment and installs dependencies
2. Stage 2 (Production): Copies application files and creates non-root user
3. Final image is optimized and secure

**Expected output:**
```
[+] Building 45.2s (12/12) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 1.23kB
 => [internal] load .dockerignore
 => [builder 1/3] FROM docker.io/library/python:3.9-slim
 => [builder 2/3] COPY backend/requirements.txt .
 => [builder 3/3] RUN python -m venv /opt/venv
 => [stage-1 1/5] COPY --from=builder /opt/venv /opt/venv
 => [stage-1 2/5] COPY backend/app.py .
 => [stage-1 3/5] COPY frontend/ ./static/
 => [stage-1 4/5] RUN groupadd -r appuser
 => exporting to image
 => => naming to docker.io/library/devsecops-app:latest
```

#### Step 3: Verify the Image

```bash
# List Docker images
docker images | grep devsecops-app

# Inspect the image
docker inspect devsecops-app:latest
```

Expected: Image size should be around 150-200MB

#### Step 4: Run the Container

```bash
# Run in detached mode
docker run -d \
  -p 5000:5000 \
  -e APP_ENV=production \
  --name devsecops-app \
  devsecops-app:latest

# Verify container is running
docker ps
```

**Alternative: Run in interactive mode (for debugging)**
```bash
docker run -it \
  -p 5000:5000 \
  -e APP_ENV=production \
  --name devsecops-app \
  devsecops-app:latest
```

#### Step 5: Access the Application

- **Frontend Dashboard**: http://localhost:5000/ui
- **Health Check**: http://localhost:5000/health
- **API Info**: http://localhost:5000/api/info

#### Step 6: Monitor the Container

```bash
# View container logs
docker logs devsecops-app

# Follow logs in real-time
docker logs -f devsecops-app

# Check container stats
docker stats devsecops-app

# Execute commands inside container
docker exec -it devsecops-app /bin/sh
```

#### Step 7: Stop and Clean Up

```bash
# Stop the container
docker stop devsecops-app

# Remove the container
docker rm devsecops-app

# Remove the image (if needed)
docker rmi devsecops-app:latest
```

### Docker Compose (Optional)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "5000:5000"
    environment:
      - APP_ENV=production
    container_name: devsecops-app
    restart: unless-stopped
```

Run with Docker Compose:
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Pushing to Docker Hub

#### Step 1: Login to Docker Hub

```bash
# Login to Docker Hub
docker login

# Enter your username and password
```

#### Step 2: Tag the Image

```bash
# Tag with your Docker Hub username
docker tag devsecops-app:latest your-username/devsecops-app:latest
docker tag devsecops-app:latest your-username/devsecops-app:v1.0.0
```

#### Step 3: Push to Docker Hub

```bash
# Push the image
docker push your-username/devsecops-app:latest
docker push your-username/devsecops-app:v1.0.0
```

#### Step 4: Verify on Docker Hub

Visit: https://hub.docker.com/r/your-username/devsecops-app

### Docker Security Scan

```bash
# Scan for vulnerabilities using Docker Scout
docker scout cves devsecops-app:latest

# Or use Trivy
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image devsecops-app:latest
```

### Troubleshooting Docker

**Issue: Build fails with "No such file or directory"**
- Solution: Ensure you're running build from project root
- Check that `backend/` and `frontend/` directories exist

**Issue: Port 5000 already in use**
```bash
# Use a different port
docker run -d -p 8080:5000 --name devsecops-app devsecops-app:latest
# Access at http://localhost:8080/ui
```

**Issue: Container exits immediately**
```bash
# Check logs for errors
docker logs devsecops-app

# Run in interactive mode to debug
docker run -it devsecops-app:latest /bin/sh
```

**Issue: Permission denied errors**
- Solution: This is expected - the container runs as non-root user (UID 1001)
- This is a security feature, not a bug

## Kubernetes Deployment

Kubernetes provides container orchestration, auto-scaling, and high availability. Follow these steps to deploy the application to a Kubernetes cluster.

### Prerequisites

- Kubernetes cluster (minikube, Docker Desktop, EKS, GKE, or AKS)
- kubectl installed and configured
- Docker image pushed to Docker Hub or accessible registry

### Step-by-Step Kubernetes Execution

#### Step 1: Verify Kubernetes Setup

```bash
# Check kubectl version
kubectl version --client

# Verify cluster connection
kubectl cluster-info

# Check nodes
kubectl get nodes
```

Expected output: Cluster information and at least one ready node

#### Step 2: Update Docker Image Reference

Before deploying, update the image reference in `k8s/deployment.yaml`:

```yaml
# Line 23 in k8s/deployment.yaml
image: your-dockerhub-username/devsecops-app:latest
```

Replace `your-dockerhub-username` with your actual Docker Hub username.

#### Step 3: Create Namespace (Optional but Recommended)

```bash
# Create a dedicated namespace
kubectl create namespace devsecops

# Set as default namespace
kubectl config set-context --current --namespace=devsecops

# Verify
kubectl config view --minify | grep namespace:
```

#### Step 4: Deploy ConfigMap

```bash
# Apply ConfigMap
kubectl apply -f k8s/configmap.yaml

# Verify ConfigMap
kubectl get configmap
kubectl describe configmap app-config
```

Expected output:
```
NAME         DATA   AGE
app-config   3      5s
```

#### Step 5: Deploy Secrets

```bash
# Apply Secrets
kubectl apply -f k8s/secret.yaml

# Verify Secrets (values will be hidden)
kubectl get secrets
kubectl describe secret app-secrets
```

**Note:** Update `k8s/secret.yaml` with actual base64-encoded secrets before production use:
```bash
# Encode a secret
echo -n 'your-secret-value' | base64
```

#### Step 6: Deploy the Application

```bash
# Apply Deployment
kubectl apply -f k8s/deployment.yaml

# Watch deployment progress
kubectl rollout status deployment/devsecops-app

# Verify pods are running
kubectl get pods
```

Expected output:
```
NAME                              READY   STATUS    RESTARTS   AGE
devsecops-app-xxxxxxxxxx-xxxxx    1/1     Running   0          30s
devsecops-app-xxxxxxxxxx-xxxxx    1/1     Running   0          30s
devsecops-app-xxxxxxxxxx-xxxxx    1/1     Running   0          30s
```

#### Step 7: Expose the Service

```bash
# Apply Service
kubectl apply -f k8s/service.yaml

# Verify Service
kubectl get svc
kubectl describe svc devsecops-app-service
```

**Get the external IP:**
```bash
# For LoadBalancer (cloud providers)
kubectl get svc devsecops-app-service

# For Minikube
minikube service devsecops-app-service --url

# For Docker Desktop
# Service will be available at http://localhost
```

#### Step 8: Enable Auto-Scaling

```bash
# Apply HPA
kubectl apply -f k8s/hpa.yaml

# Verify HPA
kubectl get hpa
kubectl describe hpa devsecops-app-hpa
```

Expected output:
```
NAME                  REFERENCE                  TARGETS         MINPODS   MAXPODS   REPLICAS
devsecops-app-hpa     Deployment/devsecops-app   <unknown>/70%   2         10        3
```

**Note:** Metrics may show `<unknown>` initially. Install metrics-server if needed:
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### Step 9: Access the Application

**For LoadBalancer (AWS, GCP, Azure):**
```bash
# Get external IP
kubectl get svc devsecops-app-service

# Access at http://<EXTERNAL-IP>/ui
```

**For Minikube:**
```bash
# Get URL
minikube service devsecops-app-service --url

# Access the URL shown
```

**For Port Forwarding (any cluster):**
```bash
# Forward local port to service
kubectl port-forward svc/devsecops-app-service 8080:80

# Access at http://localhost:8080/ui
```

#### Step 10: Verify Deployment

```bash
# Check all resources
kubectl get all

# Check pod logs
kubectl logs -l app=devsecops-app

# Check pod details
kubectl describe pod -l app=devsecops-app

# Test health endpoint
kubectl exec -it <pod-name> -- wget -qO- http://localhost:5000/health
```

### Complete Deployment (All at Once)

```bash
# Deploy everything in order
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# Or deploy entire directory
kubectl apply -f k8s/

# Verify all resources
kubectl get all
```

### Monitoring and Maintenance

#### View Logs

```bash
# Logs from all pods
kubectl logs -l app=devsecops-app --all-containers=true

# Follow logs in real-time
kubectl logs -f -l app=devsecops-app

# Logs from specific pod
kubectl logs <pod-name>
```

#### Scale Manually

```bash
# Scale to 5 replicas
kubectl scale deployment devsecops-app --replicas=5

# Verify scaling
kubectl get pods -w
```

#### Update Deployment

```bash
# Update image to new version
kubectl set image deployment/devsecops-app \
  flask-app=your-username/devsecops-app:v2.0.0

# Check rollout status
kubectl rollout status deployment/devsecops-app

# View rollout history
kubectl rollout history deployment/devsecops-app
```

#### Rollback Deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/devsecops-app

# Rollback to specific revision
kubectl rollout undo deployment/devsecops-app --to-revision=2
```

### Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Or delete individually
kubectl delete deployment devsecops-app
kubectl delete service devsecops-app-service
kubectl delete hpa devsecops-app-hpa
kubectl delete configmap app-config
kubectl delete secret app-secrets

# Delete namespace (if created)
kubectl delete namespace devsecops
```

### Troubleshooting Kubernetes

**Issue: Pods stuck in Pending state**
```bash
# Check pod events
kubectl describe pod <pod-name>

# Common causes:
# - Insufficient cluster resources
# - Image pull errors
# - Node selector issues
```

**Issue: ImagePullBackOff error**
```bash
# Check pod events
kubectl describe pod <pod-name>

# Solutions:
# - Verify image name is correct
# - Ensure image is public or credentials are configured
# - Check Docker Hub repository exists
```

**Issue: CrashLoopBackOff**
```bash
# Check logs
kubectl logs <pod-name>

# Check previous logs
kubectl logs <pod-name> --previous

# Common causes:
# - Application errors
# - Missing environment variables
# - Port conflicts
```

**Issue: Service not accessible**
```bash
# Check service endpoints
kubectl get endpoints devsecops-app-service

# Check if pods are ready
kubectl get pods

# Test from within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -qO- http://devsecops-app-service/health
```

**Issue: HPA not scaling**
```bash
# Check metrics server
kubectl get apiservice v1beta1.metrics.k8s.io -o yaml

# Install metrics server if missing
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Check HPA status
kubectl describe hpa devsecops-app-hpa
```

### Kubernetes Best Practices Applied

- ✅ **Health Probes**: Liveness and readiness probes configured
- ✅ **Resource Limits**: CPU and memory limits set
- ✅ **Security Context**: Non-root user, no privilege escalation
- ✅ **ConfigMap**: Externalized configuration
- ✅ **Secrets**: Sensitive data management
- ✅ **Labels**: Proper labeling for organization
- ✅ **Replicas**: Multiple replicas for high availability
- ✅ **Auto-scaling**: HPA for dynamic scaling

## UI Overview

### Design Philosophy

The frontend demonstrates a clean, modern interface suitable for production applications:

- **Professional Appearance**: Gradient backgrounds, card-based layout
- **Subtle Animations**: Fade-in effects, hover transitions
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: Semantic HTML, proper contrast ratios
- **Performance**: Vanilla JavaScript, no heavy frameworks

### UI Features

- Real-time application status
- Health check monitoring
- Environment information display
- Security features showcase
- Auto-refresh every 30 seconds

### Purpose

The UI serves to:
- Visually verify application deployment
- Monitor service health
- Demonstrate full-stack capabilities
- Provide a professional user interface

## Testing

### Unit Tests

Located in `backend/test_app.py`:
- Test all API endpoints
- Verify response formats
- Test error handling
- Check content types
- Coverage reporting

### Running Tests

```bash
cd backend
pytest test_app.py -v --cov=app --cov-report=html
```

### Coverage

Current test coverage includes:
- All API endpoints (/, /health, /api/info)
- Error handlers (404, 500)
- Response validation
- Content-type verification

## Future Improvements

### Security Enhancements
- Implement rate limiting
- Add API authentication (JWT)
- Enable HTTPS/TLS
- Implement network policies in Kubernetes
- Add RBAC for Kubernetes
- Integrate secrets management (HashiCorp Vault, AWS Secrets Manager)

### Monitoring & Observability
- Prometheus metrics
- Grafana dashboards
- ELK stack for logging
- Distributed tracing (Jaeger, Zipkin)
- Application Performance Monitoring (APM)

### Infrastructure
- Terraform for infrastructure as code
- Multi-environment setup (dev, staging, prod)
- Blue-green deployments
- Canary releases
- Service mesh (Istio, Linkerd)

### CI/CD Enhancements
- Integration tests
- End-to-end tests
- Performance testing
- Load testing
- Automated rollback
- GitOps with ArgoCD or Flux

### Application Features
- Database integration
- Caching layer (Redis)
- Message queue (RabbitMQ, Kafka)
- Microservices architecture
- API versioning
- GraphQL API

---

**Built with DevSecOps best practices in mind**

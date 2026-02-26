# Secure CI/CD Pipeline for a Cloud-Native Flask Application

> **Production-ready DevSecOps project** with multi-environment Kubernetes deployment (dev / staging / prod), shift-left security gates, Docker containerisation, Kustomize overlays, and automated CI/CD promotion via GitHub Actions.

---

## Table of Contents

- [Overview](#overview)
- [🚀 How to Run the Project (Complete Guide)](#-how-to-run-the-project-complete-guide)
- [Multi-Environment Architecture](#multi-environment-architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Security Enforcement](#security-enforcement)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variable Reference](#environment-variable-reference)
- [Testing](#testing)
- [Future Improvements](#future-improvements)

---

## Overview

This project showcases a complete **DevSecOps implementation** for a Flask-based web application. It demonstrates industry best practices for secure software development, automated testing, multi-layer vulnerability scanning, containerisation, and multi-environment Kubernetes orchestration.

The architecture follows a **security-first, shift-left** philosophy: every code change passes through multiple automated security gates before any deployment is allowed to proceed. Deployments are promoted progressively through isolated Kubernetes namespaces — `dev` → `staging` → `prod`.

---

## 🚀 How to Run the Project (Complete Guide)

This section covers **every method** to run the project locally — from a simple Python run to full Kubernetes multi-environment deployment.

---

### ▶ Method 1 — Run with Python (Fastest, No Docker Required)

Use this to get the app running in under 30 seconds.

#### Prerequisites
- Python 3.9 or higher installed — verify with `python --version`
- Git installed — verify with `git --version`

#### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/devsecops-project.git
cd devsecops-project
```

#### Step 2 — Create a Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
venv\Scripts\activate
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

> You should see `(venv)` at the start of your terminal prompt after activation.

#### Step 3 — Install Dependencies

```bash
pip install -r backend/requirements.txt
```

Expected output: Several packages installed including `Flask==3.1.3`, `Werkzeug==3.1.6`.

#### Step 4 — Run the Flask Application

```bash
cd backend
python app.py
```

Expected output:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Running on http://0.0.0.0:5000
```

#### Step 5 — Open in Browser

| URL | What You See |
|-----|-------------|
| `http://localhost:5000/` | Full DevSecOps dashboard (HTML UI) |
| `http://localhost:5000/health` | `{"status": "healthy"}` |
| `http://localhost:5000/api/info` | App version and environment |
| `http://localhost:5000/api/project` | Full project data JSON |
| `http://localhost:5000/api/pipelines` | CI/CD pipeline metadata |

#### Step 6 — Stop the Server

Press `CTRL + C` in the terminal.

---

### ▶ Method 2 — Run Tests and Security Scan

Always run these **before** committing or building Docker.

#### Step 1 — Install Testing and Audit Tools

```bash
pip install -r backend/requirements.txt
pip install pip-audit
```

#### Step 2 — Run Unit Tests

```bash
cd backend
python -m pytest test_app.py -v
```

Expected output:
```
test_app.py::test_index_endpoint         PASSED
test_app.py::test_health_endpoint        PASSED
test_app.py::test_api_info_endpoint      PASSED
test_app.py::test_404_error              PASSED
test_app.py::test_response_content_type  PASSED
test_app.py::test_pipelines_endpoint     PASSED

====== 6 passed in 0.XX s ======
```

#### Step 3 — Run Tests with Coverage Report

```bash
cd backend
python -m pytest test_app.py -v --cov=app --cov-report=term --cov-report=html
```

Open the HTML coverage report:
```bash
# Windows
start htmlcov/index.html

# Linux / macOS
open htmlcov/index.html
```

#### Step 4 — Run Dependency CVE Scan (pip-audit)

```bash
# From project root
pip-audit -r backend/requirements.txt --strict
```

Expected output:
```
No known vulnerabilities found
```

> If CVEs are reported, update the affected packages in `backend/requirements.txt` before proceeding.

---

### ▶ Method 3 — Run with Docker

Use this to test the containerised application exactly as it runs in production.

#### Prerequisites
- Docker Desktop installed and **running** — verify with `docker --version`

#### Step 1 — Build the Docker Image

```bash
# Run from the project root (where docker/ folder is)
docker build -t devsecops-app:latest -f docker/Dockerfile .
```

Expected output: Build completes in ~30–60 seconds with `Successfully built ...`

#### Step 2 — Verify the Image Was Created

```bash
docker images | grep devsecops-app
```

Expected:
```
devsecops-app   latest   abc123def456   30 seconds ago   ~180MB
```

#### Step 3 — Run the Docker Container

```bash
docker run -d \
  -p 5000:5000 \
  -e APP_ENV=production \
  -e DEBUG=False \
  -e LOG_LEVEL=INFO \
  --name devsecops-app \
  devsecops-app:latest
```

**Windows PowerShell (single line):**
```powershell
docker run -d -p 5000:5000 -e APP_ENV=production -e DEBUG=False -e LOG_LEVEL=INFO --name devsecops-app devsecops-app:latest
```

#### Step 4 — Verify Container Is Running

```bash
docker ps
```

Expected:
```
CONTAINER ID  IMAGE                STATUS         PORTS
abc123def456  devsecops-app:latest Up 5 seconds   0.0.0.0:5000->5000/tcp
```

#### Step 5 — Open in Browser

Visit: `http://localhost:5000/`

#### Step 6 — View Live Logs

```bash
docker logs -f devsecops-app
```

Press `CTRL + C` to stop watching logs.

#### Step 7 — Scan the Image for Vulnerabilities (Trivy)

```bash
# Install Trivy on Windows (PowerShell as Admin)
winget install aquasecurity.trivy

# Or using Chocolatey
choco install trivy

# Run the scan
trivy image devsecops-app:latest --severity CRITICAL,HIGH
```

#### Step 8 — Stop and Clean Up

```bash
docker stop devsecops-app
docker rm devsecops-app

# Remove image (optional)
docker rmi devsecops-app:latest
```

---

### ▶ Method 4 — Run with Kubernetes (Multi-Environment)

Deploy to local Kubernetes with all three environments (dev / staging / prod).

#### Prerequisites
- Docker Desktop with **Kubernetes enabled**, OR minikube, OR kind
- `kubectl` installed — verify with `kubectl version --client`
- Kubernetes cluster running — verify with `kubectl cluster-info`

#### Enable Kubernetes in Docker Desktop

1. Open Docker Desktop
2. Click **Settings** (gear icon)
3. Select **Kubernetes** from the left menu
4. Check **Enable Kubernetes**
5. Click **Apply & Restart**
6. Wait for the Kubernetes status indicator to turn **green**

Verify:
```bash
kubectl cluster-info
# Expected: Kubernetes control plane is running at https://127.0.0.1:...

kubectl get nodes
# Expected: docker-desktop   Ready   ...
```

#### Step 1 — Create the Namespaces

```bash
kubectl apply -f k8s/overlays/dev/namespace.yaml
kubectl apply -f k8s/overlays/staging/namespace.yaml
kubectl apply -f k8s/overlays/prod/namespace.yaml
```

Verify all three were created:
```bash
kubectl get namespaces
```

Expected output includes:
```
dev       Active   5s
staging   Active   5s
prod      Active   5s
```

#### Step 2 — Preview What Will Be Deployed (Dry Run)

```bash
# See the full compiled YAML for each environment without applying anything
kubectl kustomize k8s/overlays/dev/
kubectl kustomize k8s/overlays/staging/
kubectl kustomize k8s/overlays/prod/
```

#### Step 3 — Deploy to Dev Environment

```bash
kubectl apply -k k8s/overlays/dev/
```

Expected output:
```
namespace/dev unchanged
configmap/app-config created
secret/app-secrets created
service/devsecops-app-service created
deployment.apps/devsecops-app created
horizontalpodautoscaler.autoscaling/devsecops-app-hpa created
```

Wait for the deployment to be ready:
```bash
kubectl rollout status deployment/devsecops-app -n dev
# Expected: deployment "devsecops-app" successfully rolled out
```

#### Step 4 — Deploy to Staging

```bash
kubectl apply -k k8s/overlays/staging/
kubectl rollout status deployment/devsecops-app -n staging
```

#### Step 5 — Deploy to Production

```bash
kubectl apply -k k8s/overlays/prod/
kubectl rollout status deployment/devsecops-app -n prod
```

#### Step 6 — Verify All Environments Are Running

```bash
# Dev
kubectl get all -n dev

# Staging
kubectl get all -n staging

# Production
kubectl get all -n prod
```

Expected for each:
```
NAME                                 READY   STATUS    RESTARTS
pod/devsecops-app-7d9f8b6c4-xyzab    1/1     Running   0

NAME                            TYPE       CLUSTER-IP     PORT(S)
service/devsecops-app-service   NodePort   10.96.xxx.xxx  80:3xxxx/TCP

NAME                                                  REFERENCE              TARGETS       MINPODS  MAXPODS
horizontalpodautoscaler.autoscaling/devsecops-app-hpa  Deployment/devsecops   <unknown>/70%  1        3
```

#### Step 7 — Verify Environment-Specific Configuration

```bash
# Check ConfigMap values differ per environment
kubectl get configmap app-config -n dev -o yaml
kubectl get configmap app-config -n staging -o yaml
kubectl get configmap app-config -n prod -o yaml
```

Quick comparison check:
```bash
# Should print: DEBUG: "True" LOG_LEVEL: DEBUG
kubectl get configmap app-config -n dev -o jsonpath='{.data}' | python -m json.tool

# Should print: DEBUG: "False" LOG_LEVEL: WARNING
kubectl get configmap app-config -n prod -o jsonpath='{.data}' | python -m json.tool
```

#### Step 8 — Verify HPA Replica Counts Per Environment

```bash
kubectl get hpa -A
```

Expected:
```
NAMESPACE   NAME                  MINPODS  MAXPODS  REPLICAS
dev         devsecops-app-hpa     1        3        1
staging     devsecops-app-hpa     2        5        2
prod        devsecops-app-hpa     2        10       2
```

#### Step 9 — Access the Application (Port Forward)

```bash
# Access dev environment
kubectl port-forward svc/devsecops-app-service 8080:80 -n dev
# Open: http://localhost:8080/

# Access staging (use different port)
kubectl port-forward svc/devsecops-app-service 8081:80 -n staging
# Open: http://localhost:8081/

# Access prod (use different port)
kubectl port-forward svc/devsecops-app-service 8082:80 -n prod
# Open: http://localhost:8082/
```

Press `CTRL + C` to stop port forwarding.

#### Step 10 — View Pod Logs

```bash
# Replace <pod-name> with actual name from kubectl get pods -n dev
kubectl logs -n dev <pod-name>

# Or stream live logs
kubectl logs -f -n dev deployment/devsecops-app
```

#### Step 11 — Tear Down All Environments

```bash
kubectl delete -k k8s/overlays/dev/
kubectl delete -k k8s/overlays/staging/
kubectl delete -k k8s/overlays/prod/
kubectl delete namespace dev staging prod
```

---

### ▶ Method 5 — Push to Docker Hub and Trigger CI/CD

Once you push to GitHub, the CI/CD pipeline runs automatically.

#### Step 1 — Configure GitHub Secrets

In your GitHub repo → **Settings → Secrets and variables → Actions**, add:

| Secret Name | Value |
|------------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (not password) |
| `SONAR_TOKEN` | SonarCloud token (optional) |

#### Step 2 — Push a Feature Branch (→ Deploys to Dev)

```bash
git checkout -b feature/my-change
git add .
git commit -m "feat: my change"
git push origin feature/my-change
```

Pipeline runs: `test → sonar → build → deploy-dev`

#### Step 3 — Merge to Main (→ Deploys to Staging)

```bash
git checkout main
git merge feature/my-change
git push origin main
```

Pipeline runs: `test → sonar → build → deploy-staging`

#### Step 4 — Tag a Release (→ Deploys to Production)

```bash
git tag v1.0.0
git push origin v1.0.0
```

Pipeline runs: `security-gates → build-push → deploy-prod`

---

## Multi-Environment Architecture

### Namespace Isolation

| Namespace | Purpose | Debug | Log Level | HPA Min | HPA Max |
|-----------|---------|-------|-----------|---------|---------|
| `dev`     | Feature branch development | `True` | `DEBUG` | 1 | 3 |
| `staging` | Pre-production validation | `False` | `INFO` | 2 | 5 |
| `prod`    | Live production traffic | `False` | `WARNING` | 2 | 10 |

### Promotion Flow

```
Feature Branch Push
        │
        ▼
┌───────────────────────────────────────────────────┐
│              SECURITY GATES                        │
│  pip-audit → Unit Tests → Docker Build → Trivy     │
│  SonarCloud (SAST, non-blocking)                   │
└────────────────────┬──────────────────────────────┘
                     │  PASS
                     ▼
          ┌──────────────────┐
          │  DEPLOY → dev    │  ← Every feature/hotfix branch
          │  (dev namespace) │
          └──────────────────┘

Merge to main
        │
        ▼
  (same security gates)
        │
        ▼
          ┌──────────────────┐
          │ DEPLOY → staging │  ← Smoke-test, QA sign-off
          │(staging namespace│
          └──────────────────┘

Git Tag  v*.*.*
        │
        ▼
┌───────────────────────────────────────────────────┐
│   RELEASE SECURITY GATES (pip-audit + Trivy)       │
└────────────────────┬──────────────────────────────┘
                     │  PASS
                     ▼
          ┌──────────────────┐
          │  DEPLOY → prod   │  ← Versioned Docker image, HA
          │  (prod namespace)│
          └──────────────────┘
```

> **Security is non-negotiable:** If any gate fails, the pipeline halts immediately.

### Kustomize Overlay Structure

```
k8s/
├── base/                        # Shared resources (no env-specific values)
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
│
└── overlays/
    ├── dev/                     # Dev overrides
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   ├── configmap.yaml       # DEBUG=True, LOG_LEVEL=DEBUG
    │   ├── secret.yaml
    │   ├── deployment-patch.yaml
    │   └── hpa-patch.yaml       # min=1, max=3
    │
    ├── staging/                 # Staging overrides
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   ├── configmap.yaml       # DEBUG=False, LOG_LEVEL=INFO
    │   ├── secret.yaml
    │   ├── deployment-patch.yaml
    │   └── hpa-patch.yaml       # min=2, max=5
    │
    └── prod/                    # Production overrides
        ├── kustomization.yaml
        ├── namespace.yaml
        ├── configmap.yaml       # DEBUG=False, LOG_LEVEL=WARNING
        ├── secret.yaml
        ├── deployment-patch.yaml
        └── hpa-patch.yaml       # min=2, max=10
```

---

## Project Structure

```
devsecops-project/
├── backend/                       # Flask REST API & dashboard
│   ├── app.py                    # Main application
│   ├── requirements.txt          # Python dependencies
│   └── test_app.py               # Unit tests (pytest)
│
├── frontend/                      # Static web interface
│   ├── index.html                # Single-page dashboard
│   ├── style.css                 # Styling & animations
│   └── script.js                 # API integration
│
├── docker/
│   └── Dockerfile                # Multi-stage, non-root build
│
├── k8s/
│   ├── base/                     # Kustomize base manifests
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── prod/
│
├── .github/workflows/
│   ├── ci-cd.yaml                # Main pipeline (all branches → dev/staging)
│   ├── release.yaml              # Tag pipeline (v* → prod)
│   ├── gitleaks.yml              # Secrets scanning (all branches/PRs)
│   ├── pr-check.yaml             # Fast lint + test on PRs
│   └── security-scan.yaml        # Nightly Trivy + SonarCloud
│
├── sonar-project.properties
├── PROJECT_DESCRIPTION.md
└── README.md
```

---

## Technology Stack

| Category | Tool / Technology |
|----------|------------------|
| **Language** | Python 3.9 |
| **Framework** | Flask 3.1.3 |
| **Testing** | pytest, pytest-cov |
| **Containerisation** | Docker (multi-stage, non-root) |
| **Orchestration** | Kubernetes + Kustomize |
| **Autoscaling** | HorizontalPodAutoscaler (CPU + Memory) |
| **CI/CD** | GitHub Actions (5 specialised workflows) |
| **SAST** | SonarCloud |
| **Secrets Scanning** | Gitleaks |
| **Dependency CVE** | pip-audit |
| **Container CVE** | Trivy (Aqua Security) |
| **Coverage** | Codecov |

---

## Security Enforcement

| Tool | Trigger | Blocks Deployment? | What It Detects |
|------|---------|-------------------|----------------|
| **Gitleaks** | Every push & PR | ✅ Yes | Hardcoded secrets, API keys, tokens |
| **pip-audit** | Every push before build | ✅ Yes | Python dependency CVEs (`--strict`) |
| **Trivy** | Every build + nightly | ⚠️ Reported | Container OS & library CVEs |
| **SonarCloud** | Push to main + nightly | ⚠️ Non-blocking | Code smells, SAST hotspots |

### Security Gate Flow

```
  Any Push  ───►  Gitleaks   ── FAIL? ──► Pipeline STOPS ✋
                      │ PASS
                      ▼
                  pip-audit  ── FAIL? ──► Pipeline STOPS ✋
                      │ PASS
                      ▼
                  Unit Tests ── FAIL? ──► Pipeline STOPS ✋
                      │ PASS
                      ▼
                  Docker Build + Trivy ──► SARIF → GitHub Security tab
                      │
                  SonarCloud SAST ──────► Results on sonarcloud.io
                      │ ALL GATES PASSED
                      ▼
                  DEPLOY (dev / staging / prod)
```

---

## CI/CD Pipeline

| Workflow | Trigger | Jobs | Deploys To |
|----------|---------|------|-----------|
| `gitleaks.yml` | All pushes/PRs | Secrets scan | Blocks on secrets |
| `pr-check.yaml` | PRs → main | flake8 + pytest | — |
| `ci-cd.yaml` | Feature branches | test → build → deploy-dev | `dev` |
| `ci-cd.yaml` | Push to `main` | test → build → deploy-staging | `staging` |
| `release.yaml` | Tags `v*.*.*` | security-gates → build-push → deploy-prod | `prod` |
| `security-scan.yaml` | main + nightly | Trivy + SonarCloud | — |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SONAR_TOKEN` | SonarCloud token (optional) |
| `GITHUB_TOKEN` | Auto-provided by Actions |

---

## Environment Variable Reference

| Variable | dev | staging | prod | Source |
|----------|-----|---------|------|--------|
| `APP_ENV` | `development` | `staging` | `production` | ConfigMap |
| `DEBUG` | `True` | `False` | `False` | ConfigMap |
| `LOG_LEVEL` | `DEBUG` | `INFO` | `WARNING` | ConfigMap |
| `PORT` | `5000` | `5000` | `5000` | Deployment |
| `APP_SECRET_KEY` | dev placeholder | staging placeholder | prod placeholder | Secret |

---

## Testing

```bash
# Run all tests
cd backend
python -m pytest test_app.py -v

# With coverage report in terminal
python -m pytest test_app.py -v --cov=app --cov-report=term

# Generate HTML coverage report
python -m pytest test_app.py --cov=app --cov-report=html
# Then open: backend/htmlcov/index.html
```

Test suite (6 tests):
- `test_index_endpoint` — Dashboard returns 200 HTML
- `test_health_endpoint` — `/health` returns 200 JSON
- `test_api_info_endpoint` — `/api/info` returns version info
- `test_404_error` — Unknown routes return 404
- `test_response_content_type` — Correct Content-Type headers
- `test_pipelines_endpoint` — `/api/pipelines` returns pipeline list

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `python: command not found` | Python not in PATH | Use `python3`, or reinstall Python |
| Port 5000 in use | Another app using port | `netstat -ano \| findstr :5000` (Windows), kill the PID |
| Module not found | venv not active | Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` |
| Docker Desktop not running | Docker not started | Open Docker Desktop app, wait for it to fully start |
| `kubectl: command not found` | kubectl not installed | Install via `winget install Kubernetes.kubectl` |
| Kubernetes not ready | Cluster not enabled | Docker Desktop → Settings → Kubernetes → Enable Kubernetes |
| Image pull fails in K8s | Image not pushed | Run `docker push your-username/devsecops-app:latest` first |
| pip-audit reports CVEs | Outdated packages | Update versions in `backend/requirements.txt` |
| Port-forward disconnects | Normal timeout | Re-run the `kubectl port-forward` command |

---

## Future Improvements

- [ ] **Network Policies** — Restrict inter-namespace communication
- [ ] **RBAC** — Role-based access control per namespace
- [ ] **External Secrets Operator** — Vault / AWS Secrets Manager integration for prod
- [ ] **Ingress Controller** — NGINX ingress with TLS termination per environment
- [ ] **Prometheus + Grafana** — Metrics dashboards per namespace
- [ ] **ArgoCD / Flux** — GitOps-based continuous deployment
- [ ] **OPA / Gatekeeper** — Policy-as-code admission control
- [ ] **Multi-arch Docker builds** — ARM64 support for Apple Silicon

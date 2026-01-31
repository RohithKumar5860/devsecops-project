# Secure CI/CD Pipeline for a Cloud-Native Application

![DevSecOps](https://img.shields.io/badge/DevSecOps-Enabled-green)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen)
![Security](https://img.shields.io/badge/Security-Shift%20Left-blue)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=devsecops-project&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=devsecops-project)

## 📌 Project Overview
This project demonstrates a **production-grade DevSecOps pipeline** for a Python Flask application that automates the entire software delivery lifecycle: **Commit → Test → Scan → Build → Deploy**.

**Why this project?**  
To showcase the implementation of secure software supply chain practices using industry-standard open-source tools, demonstrating readiness for DevOps/SRE/Platform Engineering roles.

---

## 🏗 Architecture
The pipeline follows a **"Shift-Left" security** approach:

1. **Developer** commits code to GitHub
2. **GitHub Actions** triggers the CI/CD pipeline automatically
3. **Unit Tests** (pytest) validate application logic
4. **SAST Scan** (SonarCloud) checks for code quality and security vulnerabilities
5. **Docker Build** creates a secure container using multi-stage Dockerfile
6. **Container Scan** (Trivy) checks the image for CVEs (CRITICAL/HIGH severity)
7. **Push** uploads the secure image to Docker Hub
8. **Deploy** Kubernetes manifests ready for deployment

---

## 🧰 Technology Stack

| Component | Tool | Reason for Choice |
|-----------|------|-------------------|
| **Application** | Python 3.9 + Flask | Lightweight, industry-standard for microservices |
| **CI/CD** | GitHub Actions | Native GitHub integration, free for public repos |
| **Containerization** | Docker | Industry standard for packaging applications |
| **SAST** | SonarCloud | Best-in-class code quality & security analysis |
| **Container Security** | Trivy | Fast, comprehensive vulnerability scanner |
| **Orchestration** | Kubernetes | Production-grade container orchestration |
| **Testing** | pytest + pytest-cov | Standard Python testing with coverage |

---

## 📂 Project Structure

```
devsecops-project/
├── app/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── test_app.py         # Unit tests
├── docker/
│   └── Dockerfile          # Multi-stage Docker build
├── k8s/
│   ├── deployment.yaml     # K8s deployment with 3 replicas
│   ├── service.yaml        # ClusterIP service
│   ├── configmap.yaml      # Non-sensitive configuration
│   ├── secret.yaml         # Sensitive data (base64 encoded)
│   └── hpa.yaml            # Horizontal Pod Autoscaler
├── .github/workflows/
│   └── ci-cd.yaml          # GitHub Actions pipeline
├── sonar-project.properties # SonarCloud configuration
├── .gitignore
└── README.md
```

---

## 🔒 Security Strategy

### 1. Static Application Security Testing (SAST) - SonarCloud
- **Goal**: Catch bugs and vulnerabilities in source code before build
- **Integration**: Automated in GitHub Actions pipeline
- **Quality Gate**: Pipeline fails if critical issues detected
- **Coverage**: Tracks code coverage from pytest

### 2. Container Security - Trivy
- **Goal**: Ensure no vulnerable packages are deployed
- **Severity Handling**:
  - **CRITICAL/HIGH**: Pipeline **FAILS** immediately
  - **MEDIUM/LOW**: Logged for review (balance between security and velocity)
- **Scan Target**: Final Docker image before push to registry

### 3. Docker Security Best Practices
- ✅ Multi-stage build (reduces final image size by ~40%)
- ✅ Non-root user (`appuser` with UID 1000)
- ✅ Minimal base image (`python:3.9-slim`)
- ✅ No hardcoded secrets
- ✅ Security context enforced in Kubernetes

---

## ⚙️ Setup & Configuration

### Prerequisites
- GitHub account
- Docker Hub account
- SonarCloud account (free at [sonarcloud.io](https://sonarcloud.io))
- Docker installed locally (for testing)
- Python 3.9+ (for local development)

### Required Configuration

#### 1. SonarCloud Setup
1. Go to [sonarcloud.io](https://sonarcloud.io) and log in with GitHub
2. Import your repository
3. Copy your **Organization Key**
4. Update `sonar-project.properties`:
   ```properties
   sonar.organization=YOUR_ORGANIZATION_KEY  # Replace this!
   ```
5. Generate a token: **My Account → Security → Generate Token**

#### 2. GitHub Secrets
Add these in **Repository Settings → Secrets and variables → Actions**:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `DOCKER_USERNAME` | Docker Hub username | Your Docker Hub account name |
| `DOCKER_PASSWORD` | Docker Hub token | Docker Hub → Account Settings → Security → New Access Token |
| `SONAR_TOKEN` | SonarCloud token | SonarCloud → My Account → Security → Generate Token |

#### 3. Update Deployment Image
Edit `k8s/deployment.yaml` line 19:
```yaml
image: YOUR_DOCKERHUB_USERNAME/devsecops-app:latest
```
Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username.

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/devsecops-project.git
cd devsecops-project
```

### 2. Run Tests
```bash
pip install -r app/requirements.txt
pytest app/test_app.py -v --cov=app
```

### 3. Build & Run Docker Container
```bash
# Build the image
docker build -t devsecops-app -f docker/Dockerfile .

# Run the container
docker run -p 5000:5000 devsecops-app
```

Access the application:
- **Root endpoint**: `http://localhost:5000/`
- **Health check**: `http://localhost:5000/health`

### 4. Test with curl
```bash
curl http://localhost:5000/
curl http://localhost:5000/health
```

---

## ☸️ Kubernetes Deployment

### Deploy to Local Cluster (Minikube/Kind)
```bash
# Apply all manifests
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -l app=devsecops-app
kubectl get svc devsecops-service

# Check logs
kubectl logs -l app=devsecops-app

# Port forward to access locally
kubectl port-forward svc/devsecops-service 8080:80
```

Access at: `http://localhost:8080/health`

### Deploy to Cloud (GKE/EKS/AKS)
```bash
# Connect to your cluster first
# Then apply manifests
kubectl apply -f k8s/

# Get external IP (if LoadBalancer service)
kubectl get svc devsecops-service
```

---

## 🔍 CI/CD Pipeline Details

The GitHub Actions workflow (`.github/workflows/ci-cd.yaml`) runs on every push to `main`:

### Job 1: Test & Scan
1. Checkout code
2. Set up Python 3.9
3. Install dependencies
4. **Run unit tests** with coverage
5. **SonarCloud scan** (SAST)

### Job 2: Build & Push (only on `main` branch)
1. Checkout code
2. Login to Docker Hub
3. **Build Docker image** (tagged with git SHA and `latest`)
4. **Trivy vulnerability scan** (fails on CRITICAL/HIGH)
5. **Push to Docker Hub** (only if scan passes)

---

## 🐛 Troubleshooting

### Pipeline Fails: SonarCloud Scan
**Issue**: `SONAR_TOKEN` not found or invalid organization key  
**Fix**:
- Verify `SONAR_TOKEN` is set in GitHub Secrets
- Check `sonar.organization` in `sonar-project.properties` matches your SonarCloud org

### Pipeline Fails: Trivy Scan
**Issue**: CRITICAL or HIGH vulnerabilities detected  
**Fix**:
- Review Trivy output in GitHub Actions logs
- Update base image or dependencies in `requirements.txt`
- Consider using `python:3.9-slim-bullseye` or newer

### Kubernetes: ImagePullBackOff
**Issue**: Cannot pull image from Docker Hub  
**Fix**:
- Verify image name in `k8s/deployment.yaml` matches your Docker Hub repo
- Check if image was successfully pushed (visit hub.docker.com)
- For private repos, create an image pull secret

### Kubernetes: CrashLoopBackOff
**Issue**: Pod keeps restarting  
**Fix**:
```bash
kubectl logs POD_NAME
kubectl describe pod POD_NAME
```
Common causes:
- Missing environment variables (check ConfigMap/Secret)
- Application error (check logs)

---

## 🎤 Interview Preparation

### Q: Why did you use a multi-stage Dockerfile?
**A:** "To separate the build environment from the runtime environment. Stage 1 installs dependencies in a virtual environment. Stage 2 copies only the venv and application code, leaving behind pip, compilers, and build tools. This reduces the final image size by approximately 40% and improves security by minimizing the attack surface."

### Q: How do you handle secrets in production?
**A:** "In this project, I use Kubernetes Secrets with base64 encoding. In a real production environment, I would integrate with **HashiCorp Vault** or **AWS Secrets Manager** for dynamic secret injection with automatic rotation. I'd also enable encryption at rest for etcd and use RBAC to restrict secret access."

### Q: What happens if Trivy finds a vulnerability in production?
**A:** "The pipeline blocks deployment of new images with CRITICAL/HIGH vulnerabilities. For existing production workloads, I would:
1. Assess the CVE severity and exploit likelihood
2. Check if a patched version exists
3. Apply the fix and rebuild the image
4. Use Kubernetes rolling updates to deploy with zero downtime
5. Monitor with Prometheus/Grafana for anomalies"

### Q: How does this project justify your career gap?
**A:** "During my gap, I upskilled in cloud-native technologies and DevSecOps practices. Rather than just taking courses, I built this production-grade project to simulate real-world challenges—securing CI/CD pipelines, implementing shift-left security, and managing containerized workloads. This hands-on approach prepared me to contribute immediately to modern DevOps teams."

### Q: How would you improve this project for production?
**A:** "I would add:
1. **GitOps** with ArgoCD for declarative deployments
2. **Observability** with Prometheus, Grafana, and EFK stack
3. **Service Mesh** (Istio) for mTLS and traffic management
4. **Infrastructure as Code** with Terraform for cluster provisioning
5. **Policy Enforcement** with OPA (Open Policy Agent)"

---

## 📈 Future Improvements

- [ ] Implement **ArgoCD** for GitOps deployment
- [ ] Add **Prometheus + Grafana** for observability
- [ ] Integrate **EFK Stack** (Elasticsearch, Fluentd, Kibana) for centralized logging
- [ ] Use **Helm Charts** for packaging Kubernetes manifests
- [ ] Add **Istio** service mesh for advanced traffic management
- [ ] Implement **Terraform** for infrastructure provisioning
- [ ] Add **Falco** for runtime threat detection

---

## 📝 License

This project is open-source and available for educational and portfolio purposes.

---

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome! Feel free to open an issue or submit a pull request.

---

## 📧 Contact

For questions or collaboration opportunities, please reach out via GitHub.

# Secure CI/CD Pipeline for a Cloud-Native Application

![DevSecOps](https://img.shields.io/badge/DevSecOps-Enabled-green)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen)
![Security](https://img.shields.io/badge/Security-Shift%20Left-blue)

## 📌 Project Overview
This project demonstrates a production-grade **DevSecOps pipeline** for a Python Flask application. 
It automates the entire lifecycle: **Commit → &rarr; Test &rarr; Scan &rarr; Build &rarr; Deploy**.

**Why this project?**
To showcase the implementation of secure software supply chain practices using industry-standard open-source tools. Ideally suited for demonstrating readiness for DevOps/SRE roles.

---

## 🏗 Architecture
The pipeline follows a "Shift-Left" security approach:

1.  **Developer** commits code to GitHub.
2.  **GitHub Actions** triggers the CI/CD pipeline.
3.  **Unit Tests** (pytest) validate application logic.
4.  **SAST Scan** (SonarQube) checks for code quality and security hotspots.
5.  **Build** creates a Docker container using a multi-stage Dockerfile.
6.  **Container Scan** (Trivy) checks the image for CVEs (CRITICAL/HIGH).
7.  **Push** uploads the secure image to Docker Hub.
8.  **Deploy** (Ready) Manifests provided for Kubernetes deployment.

---

## 🧰 Technology Stack

| Component | Tool | Reason for Choice |
|-----------|------|-------------------|
| **App** | Python/Flask | Lightweight, standard for microservices. |
| **CI/CD** | GitHub Actions | Native integration, free for public repos. |
| **Container** | Docker | Industry standard for packaging apps. |
| **SAST** | SonarQube | Best-in-class for code quality & security gates. |
| **Scanner** | Trivy | Fast, comprehensive container vulnerability scanner. |
| **Orchestrator** | Kubernetes | For scaling and managing containerized apps. |

---

## 🛠️ Infrastructure & Files

### Application
- `app/`: Contains the Flask source code.
- `requirements.txt`: Pinned dependencies for reproducible builds.

### Containerization (`docker/Dockerfile`)
- **Multi-stage build**: Keeps the final image small by removing build tools.
- **Non-root user**: `appuser` (UID 1000) prevents privilege escalation attacks.
- **Distroless/Slim base**: Reduces attack surface.

### Kubernetes (`k8s/`)
- `deployment.yaml`: Defines 3 replicas, liveness/readiness probes, and resource limits.
- `service.yaml`: Exposes the app internally.
- `configmap.yaml` & `secret.yaml`: Decouples config from code. (Secrets should be encrypted in real prod).
- `hpa.yaml`: Scales pods based on CPU usage.

---

## 🔒 Security Strategy

### 1. Static Application Security Testing (SAST) - SonarQube
- **Goal**: Catch bugs and vulnerabilities in source code before build.
- **Config**: Defined in `sonar-project.properties`.
- **Quality Gate**: Fails pipeline if bugs > 0 or security rating < A.

### 2. Container Security - Trivy
- **Goal**: Ensure no vulnerable packages are deployed.
- **Severity Handling**:
    - **CRITICAL/HIGH**: Pipeline FAILS immediately.
    - **MEDIUM/LOW**: Logged for review but allows build (balance betwen security and velocity).

---

## 🚀 How to Run Locally

### Prerequisites
- Docker installed
- Python 3.9+

### Steps
1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/devsecops-project.git
   cd devsecops-project
   ```

2. **Run Tests**
   ```bash
   pip install -r app/requirements.txt
   pytest app/test_app.py
   ```

3. **Build & Run Docker**
   ```bash
   docker build -t devsecops-app -f docker/Dockerfile .
   docker run -p 5000:5000 devsecops-app
   ```
   Access at `http://localhost:5000/`

---

## 🎤 Interview Preparation (Why this project?)

### Q: Why did you use a multi-stage Dockerfile?
**A:** "To separate the build environment from the runtime environment. This reduces the final image size (removing compilers/pip caches) and improves security by minimizing the attack surface."

### Q: How do you handle secrets?
**A:** "In this project, I use Kubernetes Secrets injected as environment variables. In a real production environment, I would integrate with **HashiCorp Vault** or **AWS Secrets Manager** for dynamic secret injection."

### Q: What justifies your career gap?
**A:** "During my gap, I upskilled in cloud-native technologies. I built this project to simulate a real-world environment, focusing on **automation**, **security compliance**, and **infrastructure as code**, which are core responsibilities in modern DevOps roles."

---

## � Future Improvements
- [ ] Implement Argocd for GitOps deployment.
- [ ] Add EFK Stack (Elasticsearch, Fluentd, Kibana) for logging.
- [ ] Use Helm Charts for packaging K8s manifests.

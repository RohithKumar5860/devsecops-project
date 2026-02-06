# Security Policy

## Supported Versions

The following versions of this project receive security updates:

| Version | Supported |
|--------|-----------|
| 1.x (current) | ✅ Yes |
| < 1.0 | ❌ No |

Only the latest stable version is actively maintained and monitored for security vulnerabilities.

---

## Reporting a Vulnerability

We take security seriously and appreciate responsible disclosure.

### How to Report
If you discover a security vulnerability, please report it by:

- Creating a **private security advisory** on GitHub  
  OR  
- Sending a detailed report to the project maintainer via GitHub (preferred)

Please **do not** open a public issue for security vulnerabilities.

---

### What to Include
When reporting a vulnerability, include:

- A clear description of the issue
- Steps to reproduce (if applicable)
- Potential impact
- Affected components (API, Docker, CI/CD, Kubernetes, etc.)
- Any suggested mitigation (optional)

---

### Response Timeline
- **Initial acknowledgment:** within 48 hours  
- **Status update:** within 5 business days  
- **Fix or mitigation:** based on severity and complexity  

---

### Vulnerability Assessment
Reported vulnerabilities are evaluated based on:

- Impact on confidentiality, integrity, or availability
- Exploitability
- Affected deployment environments (local, Docker, Kubernetes)

Accepted vulnerabilities will be patched in the next release where feasible.

---

## Security Measures in This Project

This project follows DevSecOps best practices, including:

- Non-root Docker containers
- Dependency scanning via CI/CD
- Static analysis (SonarCloud – non-blocking)
- Container image scanning (Trivy)
- Kubernetes health probes and resource limits
- Secrets management via environment variables and Kubernetes Secrets

---

## Disclosure Policy

We follow **responsible disclosure** principles:

- Security issues are fixed before public disclosure
- Credit may be given to reporters (if requested)
- No guarantees of bounties or financial rewards

---

## Disclaimer

This project is provided for educational and demonstration purposes.
While security best practices are applied, users are responsible for
reviewing and hardening configurations before production use.

---

Thank you for helping keep this project secure.

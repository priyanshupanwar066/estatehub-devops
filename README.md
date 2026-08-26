# 🏠 EstateHub — DevOps, Kubernetes & AWS EKS Project

<p align="center">
  <b>MERN Stack Real Estate Application with Docker, Kubernetes, Helm & AWS EKS</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS-EKS-FF9900?logo=amazonaws&logoColor=white" />
  <img src="https://img.shields.io/badge/Helm-Deployed-0F1689?logo=helm&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker_Hub-Registry-2496ED?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
</p>

---

## 📌 About the Project

**EstateHub** is a full-stack real estate listing application built with the **MERN stack**.

The primary purpose of this project was to gain **hands-on DevOps and Cloud Engineering experience** by taking a containerized application from local development to a Kubernetes environment running on **Amazon EKS**.

The application itself provides real-estate functionality such as property listings, authentication, search, filtering, favorites and inquiries.

However, the main focus of this project is the **DevOps infrastructure and deployment workflow** surrounding the application.

### The project demonstrates:

- 🐳 Docker containerization
- 🐳 Docker Compose for local testing
- 📦 Docker Hub image registry
- ☸️ Kubernetes workloads
- ⛵ Helm-based deployments
- ☁️ Amazon EKS
- 🖥️ EKS worker nodes
- 🌐 AWS Load Balancer
- 🔄 GitHub Actions CI/CD
- 🔐 AWS IAM + GitHub OIDC
- ❤️ Liveness, Readiness & Startup Probes
- 📈 HPA & VPA
- 🔁 Kubernetes rolling deployments

---

# 🚀 DevOps Workflow

The complete application deployment workflow is:

```text
                    👨‍💻 Developer
                         │
                         │ git push
                         ▼
                    ┌──────────┐
                    │  GitHub  │
                    └────┬─────┘
                         │
                         ▼
                ┌──────────────────┐
                │ GitHub Actions   │
                │     CI / CD      │
                └────────┬─────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
          Docker Build       AWS OIDC
                │                 │
                ▼                 ▼
          ┌───────────┐      ┌─────────┐
          │ Docker Hub│      │ AWS IAM │
          └─────┬─────┘      └────┬────┘
                │                 │
                │                 ▼
                └────────────► Amazon EKS
                                  │
                                Helm
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
             Frontend Deployment        Backend Deployment
                  2 replicas                 2 replicas
                    │                           │
               ┌────┴────┐                 ┌────┴────┐
               ▼         ▼                 ▼         ▼
            Frontend  Frontend          Backend   Backend
              Pod       Pod               Pod       Pod
               │         │                 │         │
               └────┬────┘                 └────┬────┘
                    │                           │
                    ▼                           ▼
            LoadBalancer Service          ClusterIP Service
                    │                           │
                    ▼                           ▼
              AWS Load Balancer            MongoDB Atlas
                    │
                    ▼
                 Internet
                    │
                    ▼
               EstateHub

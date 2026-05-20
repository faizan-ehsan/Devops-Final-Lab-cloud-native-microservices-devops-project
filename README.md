# Cloud-Native Microservices DevOps E-Commerce Platform
### COMSATS University Islamabad, Lahore Campus
**Course:** Lab-DevOps for Cloud Computing (BSCS-01)  
**Supervisor:** M Khizar Hayat  
**Student:** Faizan Ehsan (Roll No: FA23-BCS-183)  
**Repository Role:** Team Lead (Assigned Page: Home Page Dashboard & CI/CD Pipelines)  
**Repository URL:** [faizan-ehsan/Devops-Final-Lab-cloud-native-microservices-devops-project](https://github.com/faizan-ehsan/Devops-Final-Lab-cloud-native-microservices-devops-project)  
**Render Blueprint ID:** `exs-d86fmo3tqb8s73fgh05g`

---

## 💻 Project Overview

**Octane** is an enterprise-grade, production-ready, cloud-native microservices e-commerce platform designed from the ground up to showcase advanced DevOps practices. It features five containerized services running on isolated local networks, orchestrated by Kubernetes, continuously integrated and delivered via dual CI/CD pipelines (Jenkins Declarative Pipeline + Environment-scoped GitHub Actions), and monitored in real-time with Prometheus and Grafana.

```
                  [ USER BROWSER CLIENT ]
                             │ (React.js Frontend UI)
                             ▼
               [ CENTRAL NGINX API GATEWAY ]
                             │ (Port 8080 / K8s Ingress)
     ┌───────────────────────┼───────────────────────┬───────────────────────┐
     ▼                       ▼                       ▼                       ▼
[ USER AUTH ]           [ PRODUCT ]             [ ORDER ]             [ NOTIFICATION ]
Port 5001               Port 5002               Port 5003             Port 5004
MongoDB (Auth)          MongoDB (Products)      MongoDB (Transactions) Historical Log
     │                       │                       │                       ▲
     └─────────┬─────────────┴───────────────────────┤                       │
               ▼                                     ▼ (Event Publish)       │ (Consume)
         [( MONGODB )]                       [ RABBITMQ EVENT BUS ] ─────────┘
         Port 27017                          Port 5672 / 15672
```

---

## 🛠️ Advanced Tech Stack & Port Mappings

### Core Services
*   **Frontend UI:** React.js, Tailwind CSS, Lucide Icons, Vite (Port `3000`)
*   **User Service:** Node.js, Express.js, JWT, Bcrypt Hashing, prom-client (Port `5001`)
*   **Product Service:** Node.js, Express.js, Mongoose, Catalog Seeding (Port `5002`)
*   **Order Service:** Node.js, Express.js, Axios Inter-Service requests, amqplib (Port `5003`)
*   **Notification Service:** Node.js, Express.js, RabbitMQ Listener, HTTP REST Fallback (Port `5004`)

### Infrastructure & Gateways
*   **Database:** MongoDB v6.0 (Port `27017`)
*   **Message Broker:** RabbitMQ v3.11 with Management Dashboard (Ports `5672` / `15672`)
*   **Central Router:** Nginx API Gateway Reverse Proxy (Port `8080`)
*   **Metrics Collector:** Prometheus Server (Port `9090`)
*   **Performance Visualizer:** Grafana Server (Port `3001` local -> `3000` container)

---

## 📁 Repository Folder Structure

```
d:/Projects/Devops Project/
├── .github/workflows/
│   ├── dev-ci.yml             # Development CI Gatekeeper (Lint + Test)
│   ├── dev-cd.yml             # Development Deploy Webhooks (Render.com)
│   ├── staging-ci.yml         # Staging Docker build validation
│   ├── staging-cd.yml         # Staging CD environment release
│   ├── production-ci.yml      # Production test validation
│   └── production-cd.yml      # Production gated CD release
├── k8s/                       # Kubernetes Orchestration manifests
│   ├── namespace.yaml         # Isolated Spaces: ecom-dev, ecom-staging, ecom-prod
│   ├── configmap.yaml         # Injected microservice endpoints
│   ├── secrets.yaml           # Base64 encrypted JWT sign key & Mongo password
│   ├── rbac.yaml              # RBAC ServiceAccount, Roles, and bindings
│   ├── hpa.yaml               # Autoscalers for User & Product Services
│   ├── ingress.yaml           # Dynamic Host Routing & CORS
│   ├── canary-deployment.yaml # Weighted Traffic-Splitting Ingress configuration
│   ├── frontend-deployment.yaml
│   ├── user-deployment.yaml
│   ├── product-deployment.yaml
│   ├── order-deployment.yaml
│   └── notification-deployment.yaml
├── src/                       # Microservice Source Codes
│   ├── gateway/               # Nginx central gateway configuration
│   ├── frontend/              # Glassmorphic React SPA dashboard UI
│   ├── user-service/          # Authentication API & JWT issuer
│   ├── product-service/       # Catalogue DB & inventory controller
│   ├── order-service/         # Transaction manager & RabbitMQ publisher
│   └── notification-service/  # Event subscriber & notification history hub
├── Jenkinsfile                # Jenkins Multi-Stage Gated pipeline (with auto-rollback)
├── docker-compose.yml         # Master Docker cluster stack definitions
├── render.yaml                # Render.com blueprint specification
├── .gitignore                 # Block env logs and node module caches
└── .dockerignore              # Optimize Docker compiler build context
```

---

## 🐳 Running Locally (Docker Compose)

### 1. Build and Run Cluster
Compile all microservices and spin up databases, metrics collectors, and API gateways:
```bash
docker-compose up --build
```

### 2. Verify Services Availability
*   **Unified App Gateway Portal:** `http://localhost:8080` (Direct entry)
*   **React Web Client UI:** `http://localhost:3000`
*   **RabbitMQ Dashboard Console:** `http://localhost:15672` (Credentials: `guest` / `guest`)
*   **Prometheus Graph Viewer:** `http://localhost:9090`
*   **Grafana Dashboard Panel:** `http://localhost:3001` (Credentials: `admin` / `admin`)

---

## 🚢 Orchestration Commands (Kubernetes)

Ensure a local cluster (Minikube or Kind) is active and the Nginx Ingress addon is enabled.

### 1. Bootstrap Base Context, ConfigMaps, and Secrets
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml -n ecom-dev
kubectl apply -f k8s/secrets.yaml -n ecom-dev
kubectl apply -f k8s/rbac.yaml -n ecom-dev
```

### 2. Apply Microservices & Gateway Routing
```bash
kubectl apply -f k8s/user-deployment.yaml -n ecom-dev
kubectl apply -f k8s/product-deployment.yaml -n ecom-dev
kubectl apply -f k8s/order-deployment.yaml -n ecom-dev
kubectl apply -f k8s/notification-deployment.yaml -n ecom-dev
kubectl apply -f k8s/frontend-deployment.yaml -n ecom-dev
kubectl apply -f k8s/ingress.yaml -n ecom-dev
kubectl apply -f k8s/hpa.yaml -n ecom-dev
```

### 3. Check Rollout & Pod States
```bash
kubectl get namespaces
kubectl get pods -n ecom-dev -o wide
kubectl get services -n ecom-dev
kubectl get hpa -n ecom-dev
kubectl describe ingress ecom-ingress -n ecom-dev
```

### 4. Zero-Downtime Rolling Update Demonstration
Update the container image version of the Product Service dynamically:
```bash
kubectl set image deployment/product-service product-service=product-service:v1.1.0 -n ecom-dev
kubectl rollout status deployment/product-service -n ecom-dev
```

### 5. Emergency Rollback on Failure
If a deployment fails the liveness probe, execute an instant, zero-downtime rollback:
```bash
kubectl rollout undo deployment/product-service -n ecom-dev
kubectl rollout history deployment/product-service -n ecom-dev
```

---

## 🤖 CI/CD Implementation

### 1. Jenkins Declarative Pipeline
The `Jenkinsfile` defines a multi-stage gated pipeline that enforces clean code before deployment:
1.  **Checkout:** Downloads the latest repository updates.
2.  **Install:** Automatically pulls packages for all microservices in parallel.
3.  **Lint:** Performs ESLint analysis on source scripts.
4.  **Test:** Executes Jest test suites across the services.
5.  **Build:** Compiles the React UI static bundle.
6.  **Docker Build & Tag:** Compiles multi-stage containers tagged with semantic versions (`v1.0.${BUILD_NUMBER}`).
7.  **Push:** Pushes production images to Docker Hub.
8.  **Deploy:** Dynamically maps branch states to namespaces and applies Kubernetes manifests.
9.  **Verification:** Checks rollout status. If it fails, triggers a `kubectl rollout undo` recovery.

### 2. GitHub Actions workflows
Workflows are completely decoupled based on Git Flow:
*   `develop` Branch -> triggers **Development CI/CD** (tests, lints, and triggers Render Dev hooks).
*   `release/*` Branch -> triggers **Staging CI/CD** (evaluates builds, compiles assets, triggers Render Staging hooks).
*   `main` Branch -> triggers **Production CI/CD** (requires explicit approval in GitHub Environment settings before running production CD deployment).

---

## 🔑 REST API Endpoints Guide

| Service | Method | Endpoint | Description | Payload / Parameters |
|:---|:---|:---|:---|:---|
| **User** | `POST` | `/api/auth/register` | Registers profile (bcrypt hashing) | `{ "name", "email", "password", "role" }` |
| **User** | `POST` | `/api/auth/login` | Returns JWT Auth token | `{ "email", "password" }` |
| **User** | `GET` | `/api/auth/profile` | Fetches verified user info | Requires Bearer Token in Headers |
| **Product**| `GET` | `/api/products` | Fetches products catalog | Query params: `category`, `search` |
| **Product**| `POST` | `/api/products` | Adds product (Admin scoped) | `{ "name", "description", "price", ... }` |
| **Product**| `PUT` | `/api/products/:id` | Updates stock or detail | `{ "stock" }` |
| **Order** | `POST` | `/api/orders` | Process transaction and deducts stock| `{ "userId", "items", "totalAmount" }` |
| **Order** | `GET` | `/api/orders` | Fetches order logs by User | Query param: `userId` |
| **Notification**| `POST` | `/api/notifications` | Direct REST confirmation trigger | `{ "orderId", "totalAmount", "userId" }` |
| **Notification**| `GET`| `/api/notifications/history` | Fetches system logs history | Used by React alert bell |

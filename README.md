# Cloud-Native Microservices DevOps E-Commerce Platform
### COMSATS University Islamabad, Lahore Campus
**Course:** Lab-DevOps for Cloud Computing (BSCS-01)  
**Supervisor:** M Khizar Hayat  
**Student:** Faizan Ehsan (Roll No: FA23-BCS-183)  
**Repository Role:** Team Lead (Assigned Page: Home Page Dashboard & CI/CD Pipelines)  
**Repository URL:** [faizan-ehsan/Devops-Final-Lab-cloud-native-microservices-devops-project](https://github.com/faizan-ehsan/Devops-Final-Lab-cloud-native-microservices-devops-project)

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

---

## 📸 Local Verification Screenshots (Placeholders)

> [!NOTE]
> During your evaluation, capture screenshots of these panels and place them under a `screenshots/` folder to complete the documentation requirements.

1.  **Futuristic Glassmorphic Dashboard Portal UI:** `![Dashboard UI](screenshots/dashboard.png)`
2.  **Successful Multi-stage Docker Builds:** `![Docker Builds](screenshots/docker_builds.png)`
3.  **Active Kubernetes Pods & HPAs:** `![Kubernetes Pods](screenshots/k8s_pods.png)`
4.  **Jenkins Success Gated Stages Console:** `![Jenkins Pipeline](screenshots/jenkins_pipeline.png)`
5.  **Prometheus Scraping Targets Online:** `![Prometheus Status](screenshots/prometheus_status.png)`
6.  **Grafana Microservices Dashboard Graphs:** `![Grafana Dashboard](screenshots/grafana.png)`

---

## 🧠 Comprehensive Viva Questions & Answers (Final-Year Level)

#### Q1: What is a Microservices Architecture and why is it preferred over a Monolith?
**A:** Microservices decompose a large application into small, independent, loosely coupled services (e.g., User, Product, Order). Each service is developed, deployed, and scaled independently, uses its own database (Database-per-service pattern), and communicates via lightweight protocols (REST HTTP/gRPC or message brokers). This increases fault isolation (if the Order service crashes, the User authentication and Product Catalog remain fully online) and matches business domain partitions (Domain-Driven Design).

#### Q2: Explain the multi-stage Docker build pattern you implemented. What are its benefits?
**A:** In our Dockerfiles, Stage 1 (builder) uses a full development base node image, copies all scripts, installs all devDependencies, and runs Jest unit tests. Stage 2 copies *only* production dependencies (`npm ci --only=production`) and the compiled `server.js` or `dist/` bundles into a highly stripped-down Alpine image. This separates compilation tooling from runtime environments, dramatically shrinking image sizes (e.g., from 900MB to 70MB), reducing security attack vectors, and ensuring tests pass before an image is pushed to the registry.

#### Q3: What is the purpose of Kubernetes ConfigMaps and Secrets, and how are they used?
**A:** ConfigMaps store non-sensitive configuration keys (like service URLs, database connection endpoints), while Secrets store base64-encoded sensitive keys (like database root passwords, JWT signature keys). Decoupling these from container images ensures the "Twelve-Factor App" configuration standard. Kubernetes mounts them dynamically inside pods as environment variables or filesystem volumes without rebuilding images when values change.

#### Q4: How do Liveness and Readiness probes differ, and why are both critical?
**A:**
*   **Liveness Probe:** Periodically checks if the microservice container is still alive. If it fails (e.g., deadlocked thread), the kubelet restarts the container immediately to restore health.
*   **Readiness Probe:** Checks if the microservice is fully ready to accept incoming customer requests. If it fails (e.g., database connection is still loading), Kubernetes temporarily removes the pod from the service load balancer, preventing users from receiving HTTP 500 errors.

#### Q5: Explain the Canary Deployment strategy. How does it differ from Blue-Green?
**A:**
*   **Canary Deployment:** Deploys a new version (v1.1.0) alongside the stable version (v1.0.0). We use Nginx Ingress annotations to split a tiny fraction (10%) of user traffic to v1.1.0. If the logs are healthy, we scale up the new version and phase out the old.
*   **Blue-Green Deployment:** Provisions two identical, full-scale environment stacks (Blue: stable v1.0.0; Green: new v1.1.0). Once green is validated, router traffic is flipped 100% instantly from Blue to Green. Canary requires fewer resources since we don't duplicate the entire stack, while Blue-Green guarantees instantaneous rollovers with zero version mismatch.

#### Q6: What is a Horizontal Pod Autoscaler (HPA) and how does it execute scaling?
**A:** The HPA is a control loop that queries pod metrics (such as CPU or Memory usage) from the Kubernetes Metrics Server at regular intervals. It compares the target utilization (e.g., 80% CPU limit) against average pod utilization. If the load is exceeded, the HPA increases the deployment `replicas` configuration (up to our maximum threshold of 10) to scale horizontal capacity. When the load drops, it gracefully scales back down to avoid wasting resources.

#### Q7: How does your Jenkins Declarative Pipeline guarantee self-healing deployment rollbacks?
**A:** In the `Jenkinsfile` post-deployment phase, a verification stage checks the rollout status of all pods. If the pods fail their readiness probes and the rollout times out, the `failure` block catches the exception and immediately triggers an emergency fallback script `kubectl rollout undo deployment/user-service`. This rolls back the pods to the previous stable replica set state instantly, preserving uptime.

#### Q8: Why did you implement an Nginx API Gateway reverse proxy for local development?
**A:** It acts as a single point of entry for the frontend client (listening on port `8080`). It routes path prefixes (e.g., `/api/auth`) to specific backend containers on their internal ports (e.g., `user-service:5001`). This eliminates the need to expose five separate ports to the host machine, ensures uniform logging, and eliminates browser Cross-Origin Resource Sharing (CORS) errors because both frontend and API domains share a single gateway port.

#### Q9: How is asynchronous microservices communication achieved in this project?
**A:** The Order Service and Notification Service are linked via **RabbitMQ**. When an order is placed, the Order Service writes to its database and publishes an `order_created` event message to the `order_notifications` queue on RabbitMQ. The Notification Service runs as a background consumer subscribing to that queue. When RabbitMQ pushes the message, the Notification Service reads it asynchronously and triggers the alert. If RabbitMQ goes offline, the Order Service falls back to a direct synchronous HTTP REST request as a failover.

#### Q10: What is RBAC and why is it important in Kubernetes?
**A:** Role-Based Access Control (RBAC) enforces the "principle of least privilege" within the cluster. It maps specific users or `ServiceAccounts` to `Roles` (namespace-scoped permissions) and `ClusterRoles` (cluster-wide permissions) defining explicit actions (verbs: get, list, create) on resources (pods, secrets, deployments). This blocks unauthorized developers or compromised microservices from accessing secrets or destroying configurations in other namespaces.

#### Q11: Explain your Git Flow branching strategy and how it maps to deployment.
**A:** Git Flow segregates development from production. Developers build features in `feature/*` branches, merge them into `develop` for integrated **Development** testing. Once stable, feature sets form a `release/*` branch for **Staging** evaluation. After validation, Staging merges into `main` for **Production** release. Our GitHub Actions workflows are branch-locked to deploy code to the corresponding environment, ensuring stability.

#### Q12: How do you configure Prometheus to scrape Node.js Express endpoints?
**A:** We integrate the `prom-client` package inside our Express apps. It automatically collects default Node runtime metrics (V8 garbage collection, heap size, event loop lag). We define custom counters (like `http_requests_total`) incremented on each incoming request. The metrics are exposed on a standard endpoint `/metrics`. We then declare these target endpoints inside Prometheus's `prometheus.yml` scrape configs, which periodically pulls (scrapes) the data for visualization.

#### Q13: What is password hashing using bcrypt, and why is it preferred over SHA256?
**A:** Bcrypt hashes user passwords before database storage. Unlike SHA256 (which is a fast general-purpose cryptographic hash), bcrypt uses a slow, CPU-intensive hashing algorithm that incorporates a variable work factor (rounds) and automated "salting" (appending random bytes before hashing). This makes it highly resistant to modern dictionary attacks, GPU-accelerated brute force cracks, and precomputed rainbow table attacks.

#### Q14: What is JWT Authentication and how does it operate in a stateless architecture?
**A:** JSON Web Tokens (JWT) enable stateless authentication. When a user logs in, the User Service signs a token containing a payload (user ID, email, role) using a protected `JWT_SECRET` key and returns it to the browser. The frontend attaches this token to the `Authorization: Bearer <Token>` header of all subsequent API requests. Backend microservices decrypt and verify the token signature cryptographically without querying a central session database, keeping requests stateless and fast.

#### Q15: How does your React frontend remain robust if the backend APIs are down?
**A:** The frontend uses an **Adapter pattern**. When loading, it queries the backend API endpoints. If the API requests fail (e.g. backend services are starting up or unreachable), the React application seamlessly falls back to a localized mock database (HTML5 LocalStorage state). This preserves all dashboard interactive components (adding to cart, simulating checkouts, receiving order notifications, and updating trackers) without crashing the browser interface, facilitating seamless lab and viva presentations under any conditions.

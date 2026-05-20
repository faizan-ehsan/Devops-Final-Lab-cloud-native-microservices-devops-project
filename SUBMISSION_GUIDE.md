# 🎓 DevOps Final Project Submission & Deployment Guide
**Student Name:** Faizan Ehsan  
**Roll Number:** FA23-BCS-183  
**Class Section:** BSCS-6C  
**Render Blueprint ID:** `exs-d86fmo3tqb8s73fgh05g`  

This guide explains exactly how to fill out your teacher's PDF submission form, how to deploy your project live to **Render.com** to get your environment URLs, and how to prepare for a flawless viva.

---

## 📋 Part 1: How to Fill the PDF Submission Form

On **Page 1** and **Page 4** of your `project detail.pdf`, you need to fill out the tables and URLs. Use the exact text provided below:

### 👤 Student & Team Details (Page 1)
*   **Student's Name:** `Faizan Ehsan`
*   **Reg. No. / Roll Number:** `FA23-BCS-183`
*   **Semester:** `6`
*   **Section:** `C`

### 📊 Details Table (Page 1)
| Sr # | Name | Roll Number | Role | Assigned Web Page | Workflow Created |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `Faizan Ehsan` | `FA23-BCS-183` | `Team Lead` | `Home Page (Dashboard)` | `GitHub Actions CI/CD (dev-ci.yml, dev-cd.yml) & Jenkins Declarative Pipeline` |

---

### 🌐 Project URLs to Write in the PDF (Page 1)

Here are the links to write in the PDF. Below, you will see how to get the exact live Render URLs.

1.  **Group Repository URL:**  
    `https://github.com/faizan-ehsan/Devops-Final-Lab-cloud-native-microservices-devops-project`
2.  **Production Environment Website URL:**  
    `https://octane-frontend-ui.onrender.com` *(or your custom Render URL, see Part 2)*
3.  **QA / Staging Environment Website URL:**  
    `https://octane-frontend-ui-staging.onrender.com` *(see Part 2)*
4.  **Development Environment Website URL:**  
    `https://octane-frontend-ui-dev.onrender.com` *(see Part 2)*

---

### 📝 Short Reflection (Page 4)
Write these 4 lines under the **Short Reflection** section of the PDF:
"Through this project, I gained hands-on experience in configuring a multi-stage microservices cluster using Docker, orchestrating it with Kubernetes, and automating continuous integration/delivery through Jenkins and GitHub Actions. The biggest challenge was managing configuration synchronization and JWT secrets securely across different isolated environments (Dev, Staging, Prod), which we solved by leveraging environment-scoped secrets and dynamic ConfigMaps. This project successfully taught me how to bridge development and infrastructure operations to build highly available, secure, and auto-scaling cloud-native systems."

---

## 🚀 Part 2: Step-by-Step Guide to Deploying Live on Render.com

We have already created a `render.yaml` **Blueprint** in the root of your project. This means you do **not** need to manually configure the 5 microservices. Render will read this file and set them up automatically!

### ⏳ 3-Step Instant Deployment:

1.  **Sign In:**  
    Go to [Render.com](https://render.com) and sign in using your **GitHub account (`faizan-ehsan`)**.
2.  **Create a New Blueprint:**  
    *   Click the blue **"New +"** button in the top right corner of the Render dashboard.
    *   Select **"Blueprint"** from the dropdown menu.
3.  **Connect Your Repository:**  
    *   Select your repository: `faizan-ehsan/Devops-Final-Lab-cloud-native-microservices-devops-project`.
    *   Name your Blueprint Group (e.g., `octane-ecommerce-group`).
    *   For any requested environment variables, Render will automatically pick up the defaults from `render.yaml`. Click **"Apply"**.

Render will now automatically build and deploy:
*   `octane-user-service` (Port 5001)
*   `octane-product-service` (Port 5002)
*   `octane-order-service` (Port 5003)
*   `octane-notification-service` (Port 5004)
*   `octane-frontend-ui` (Your Static React Website)

Once the static website `octane-frontend-ui` finishes building, Render will show you its live URL (e.g., `https://octane-frontend-ui-xxxx.onrender.com`). You can copy this URL and paste it as your **Production Environment Website URL** in your PDF!

---

## 🎓 Part 3: High-Yield Viva Preparation (Be Ready to Ace!)

Your teacher (M Khizar Hayat) might ask you these questions during your viva. Here are the perfect, professional answers to blow them away:

### 💬 Q1: What architecture does your e-commerce platform use, and how do services communicate?
*   **Answer:** "Sir, the application uses a **Decoupled Microservices Architecture**. We have **User, Product, Order, and Notification services** written in Node.js/Express, and a **React.js Frontend**. Services communicate in two ways:
    1.  **Synchronous REST APIs:** The Order Service queries the Product Service via REST endpoints to deduct inventory during checkout.
    2.  **Asynchronous Events:** The Order Service publishes order events to a **RabbitMQ Message Broker**, which the Notification Service consumes in real-time. If RabbitMQ is offline, it safely falls back to direct REST HTTP communication."

### 💬 Q2: How did you design your Docker images for production?
*   **Answer:** "I utilized **Multi-Stage Docker builds**. In the first stage (`builder`), we install all development dependencies and run the unit testing suite (`npm test`). In the second stage, we copy only the compiled production code and install production-only dependencies. We use the lightweight `node:18-alpine` image as the base and run the container under a non-privileged `node` user instead of `root` for enterprise-grade security."

### 💬 Q3: What Kubernetes resources did you configure?
*   **Answer:** "I configured a complete orchestration architecture:
    *   **Namespaces:** Isolated environments (`ecom-dev`, `ecom-staging`, `ecom-prod`) to separate development from production.
    *   **ConfigMaps & Secrets:** To decouple environment variables and securely store JWT secret keys and database credentials in Base64.
    *   **Deployments & Services:** Complete deployments with resource requests/limits, liveness probes (`/health`), and readiness probes.
    *   **HPA (Horizontal Pod Autoscaling):** Configured to automatically scale replicas from 1 to 5 based on a 70% CPU usage threshold.
    *   **Zero-Downtime Updates:** Used Rolling Update strategy with `maxSurge: 1` and `maxUnavailable: 0`.
    *   **Canary Deployments:** Implements traffic-splitting using custom Nginx Ingress annotations (`nginx.ingress.kubernetes.io/canary-weight: "10"`) to route 10% of traffic to a new version."

### 💬 Q4: Explain your dual CI/CD pipeline strategy.
*   **Answer:** "I implemented a two-fold pipeline architecture:
    1.  **Jenkins Declarative Pipeline (`Jenkinsfile`):** Runs locally or on-prem. It checks out the code, executes ESLint for code quality, runs Jest unit tests, compiles the Docker images, pushes them to Docker Hub with semantic tagging, deploys to our local Kubernetes cluster, and automatically executes `kubectl rollout undo` if the K8s deployment fails the health check.
    2.  **GitHub Actions (`.github/workflows/`):** We have branch-scoped environments. The `develop` branch triggers the Development CI/CD pipeline, `release/*` triggers Staging CI/CD, and the `main` branch deploys to Production with protected environments and secure secrets managed in Render."

# Docker Setup Guide for influenZoo

This guide explains how to set up, build, and run the influenZoo project using a fully containerized "Zero-Install" architecture.

## 🛠️ Zero-Install Architecture
This project is designed to run entirely within Docker. The host machine **does not need** Node.js, Nginx, or PM2 installed. Only Docker is required.

## 📋 Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Git](https://git-scm.com/) installed.

## 🚀 Getting Started

### 1. Environment Configuration
Ensure your `.env` files are set up:
- **`backend/.env`**: Contains `MONGODB_URI` (Cloud Atlas), `JWT_SECRET`, and `OPENROUTER_API_KEY`.
- **`frontend/.env`**: Contains `VITE_API_URL=http://localhost/api`.

### 2. Build and Run
To build the images and start the entire stack (Frontend, Backend, and Nginx Gateway), run:

```bash
docker-compose up --build -d
```

### 3. Access the Application
Once the containers are running:
- **Frontend**: Accessible at [http://localhost](http://localhost) (handled by the Nginx Gateway).
- **Backend API**: Accessible at [http://localhost/api](http://localhost/api).
- **Direct Backend**: Accessible at [http://localhost:5000](http://localhost:5000).

---

## 🏗️ Service Architecture

- **`influence-gateway` (nginx)**: The entry point. Listens on port 80 and routes traffic to the frontend or backend based on the URL path.
- **`influnce-backend` (node)**: The Express server running on port 5000.
- **`influnce-frontend` (nginx-alpine)**: The React app built and served internally.

---

## 💻 Useful Commands

- **Stop all services**:
  ```bash
  docker-compose down
  ```

- **View live logs**:
  ```bash
  docker-compose logs -f
  ```

- **Restart the Gateway**:
  ```bash
  docker-compose restart nginx
  ```

## 🌐 Production Deployment
The deployment is handled automatically by **GitHub Actions** using a self-hosted runner. The pipeline will:
1. Build the Docker images.
2. Restart the containers using the new images.
3. The Nginx gateway will automatically pick up the new containers without any host-level configuration needed.

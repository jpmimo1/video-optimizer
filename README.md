# 🎬 VideoOptima - Asynchronous Video Processing Platform (MVP)

VideoOptima is a high-performance web tool designed for fast, simple, and real-world video transformations. Users can seamlessly upload videos, apply targeted processing operations, and download optimized outputs under explicit system constraints.

This repository is structured as a **monorepo** managing a decoupled microservices architecture designed to be fully containerized via Docker for reliable cross-environment parity.

---

## 🏗️ System Architecture & Tech Stack

The platform is engineered using an asynchronous **Queue/Worker architecture** to isolate compute-heavy operations from the HTTP lifecycle, protecting the server from bottlenecks.

* **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS)
* **Backend API:** NestJS (HTTP Endpoint Controller, Request Validator, Job Producer)
* **Backend Worker:** NestJS + FFmpeg (Isolated background processor running on Alpine Linux)
* **Message Broker / Queue Management:** Redis + BullMQ
* **Database & ORM:** PostgreSQL + Prisma ORM (v7+)
* **Storage Provider:** Cloudflare R2 (S3-compatible, $0 Egress fees for cost control)

---

## 🎯 Product Specifications & Constraints (MVP)

To mitigate server exploitation, secure cost predictability, and optimize hardware usage, the system enforces strict guardrails at the architectural level:

### Core Processing Operations
1.  **Compression:** Reduce file size while preserving baseline visual fidelity (High Quality, Balanced, High Compression).
2.  **Format Conversion:** Change containers natively between `mp4`, `webm`, and `mov`.
3.  **Thumbnail Generation:** Extract a specific frame at second $X$ and export it as an image (`jpg`/`png`).
4.  **Trimming:** Slice precise video segments based on timestamps (Start $\rightarrow$ End).

### Critical System Limits
* **Max File Size:** 100 MB per file.
* **Max Video Duration:** 5 minutes.
* **Concurrency Limit:** Maximum 1 active processing job per user concurrently.
* **Daily Quotas:** 3 jobs/day for anonymous users, 10 jobs/day for registered users.
* **Processing Timeout:** Heavy tasks are automatically killed after 2 to 5 minutes to prevent hung worker threads.
* **Data Retention Policy:** All source uploads and output files are permanently purged from Cloudflare R2 and PostgreSQL metadata after **24 hours** to prevent storage saturation.

---

## 🛠️ Local Development Flow (DevEx) with Docker & Prisma

Developing an asynchronous system with Prisma and Docker creates an architectural challenge: **The Host machine (your PC) and the Docker Containers live in isolated environments with isolated `node_modules` folders.**

To ensure type safety in your IDE (VS Code) while keeping the running containers updated with the latest database models, follow this development workflow:

### The 4-Step Database Update Cycle

Whenever you modify the database layer, execute these steps in order:

1.  **Modify the Schema:** Update the `backend/prisma/schema.prisma` file directly in your editor.
2.  **Generate Migration Locally:** From your host machine's terminal (inside the `backend/` directory), run:
    ```bash
    npx prisma migrate dev --name your_change_description
    ```
    *This creates the SQL file and updates the physical PostgreSQL database running in Docker via your exposed host port.*
3.  **Generate Local Types:** Run the generation command locally to update your host's `node_modules`:
    ```bash
    npx prisma generate
    ```
    *This gives your local IDE immediate IntelliSense, autocompletion, and TypeScript type checking.*
4.  **Synchronize Docker Containers:** Because the containers use an anonymous volume to shield their own `node_modules` from your host, they won't automatically see the new types. Force them to re-generate their internal Prisma Client by restarting the containers:
    ```bash
    docker-compose restart nestjs-api nestjs-worker
    ```
    *On startup, the container overrides run `npx prisma generate` internally before boot, aligning both worlds seamlessly.*

---

## 🚀 Getting Started

1.  Clone this repository.
2.  Create a `.env` file in the root directory based on the infrastructure needs.
3.  Spin up the entire stack using Docker Compose:
    ```bash
    docker-compose up -d --build
    ```

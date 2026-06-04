# ⚙️ VideoOptima Backend - API & Processing Worker

This directory houses the unified NestJS source code powering both the HTTP API application layer and the asynchronous background processing layer.

---

## 🧩 The Dual-Role Bootstrapping Pattern

To maximize code reusability and simplify maintenance, the API and the Worker share the **exact same codebase, Prisma schemas, and domain logic**.

Instead of maintaining separate repositories, we use Docker to spin up the same image twice under different runtime modes controlled by the `PROCESS_TYPE` environment variable in `main.ts`:

- **`PROCESS_TYPE=API`:** Bootstraps the application using `NestFactory.create()`. It binds to port `4000`, exposes REST endpoints, handles pre-signed URL generation for Cloudflare R2, validates configuration payloads, and pushes jobs into the Redis queue.
- **`PROCESS_TYPE=WORKER`:** Bootstraps using `NestFactory.createApplicationContext()`. This skips the heavy HTTP/web server overhead entirely, spawning a headless microservice that listens directly to BullMQ to process video manipulation tasks via native FFmpeg child processes.

---

## 🗄️ Prisma 7 Database Configuration

This project implements **Prisma 7**, which introduces a significant architectural shift: connection strings are decoupled from the static schema file and migrated to an explicit TypeScript configuration file.

- `prisma/schema.prisma`: Defines your structural database models, indexes, and enums exclusively. It uses `provider = "prisma-client-js"`.
- `prisma.config.ts`: Dynamically bootstraps runtime configurations, securely mapping the database connectivity strings directly from `process.env.DATABASE_URL`.

---

## 🔄 Job Lifecycles & BullMQ States

Tasks pushed to Redis flow through a strict state machine managed by BullMQ processors:

```text
 ┌──────────┐      (Uploads Asset)      ┌───────────────┐
 │  Client  │ ────────────────────────► │ Cloudflare R2 │ ◄──────────────┐
 └────┬─────┘                           └───────────────┘                │
      │                                                                  │
      │ (Sends Config Payload)                                           │
      ▼                                                                  │
 ┌──────────┐         (Pushes Job)      ┌────────────────┐               │
 │ NestJS   │ ────────────────────────► │ Redis (BullMQ) │               │ (Saves Optimized
 │   API    │                           └───────┬────────┘               │      Asset)
 └──────────┘                                   │                        │
                                                │ (Worker Claims         │
                                                ▼   Task)                │
 ┌──────────┐      (Direct Download)    ┌────────────────┐               │
 │  Client  │ ◄──────────────────────── │ NestJS Worker  │ ──────────────┘
 └──────────┘                           │   (+ FFmpeg)   │
                                        └────────────────┘
```

1. **`PENDING`:** The file metadata is recorded in PostgreSQL. The job configuration parameters are stored as a flexible `JsonB` field. The task enters the Redis FIFO sequence.
2. **`PROCESSING`:** An available worker node claims the job from the queue. The container downloads the asset and executes system-level compression/trimming commands leveraging the native **FFmpeg** binaries installed on the underlying Alpine OS.
3. **`COMPLETED`:** FFmpeg exits successfully with a code `0`. The optimized asset is piped into Cloudflare R2 (configured with a `Content-Disposition: attachment` header to force downloads). The job state shifts, saving the public URL.
4. **`FAILED`:** File corruption, invalid codecs, or processing timeouts (automatically killed after 2-5 minutes) triggered a crash. The stack trace is saved into the database's `errorMessage` field for transparent error reporting.

---

## 💻 Local Management Commands

If you need to manage, debug, or scale the backend microservices independently from the root monorepo orchestrator, use the following shortcuts:

- **View API Logs:**

  ```bash
  docker-compose -f ../docker-compose.prod.yml logs -f nestjs-api
  ```

- **View Worker Logs (FFmpeg execution):**

  ```bash
  docker-compose -f ../docker-compose.prod.yml logs -f nestjs-worker
  ```

- **Force Database Migrations Manually:**

  ```bash
  docker-compose -f ../docker-compose.prod.yml exec nestjs-api npx prisma migrate deploy
  ```

- **Scale Workers (If processing queue grows under high traffic):**
  ```bash
  docker-compose -f ../docker-compose.prod.yml up -d --scale nestjs-worker=3
  ```

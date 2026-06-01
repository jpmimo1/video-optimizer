# ⚙️ VideoOptima Backend - API & Processing Worker

This directory houses the unified NestJS source code running both the HTTP API application layer and the asynchronous background processing layer.

---

## 🧩 The Dual-Role Bootstrapping Pattern

To maximize code reusability and simplify maintenance, the API and the Worker share the **exact same codebase, Prisma schemas, and domain logic**. 

Instead of maintaining separate repositories, we use Docker to spin up the same image twice under different runtime modes controlled by the `PROCESS_TYPE` environment variable in `main.ts`:

* **`PROCESS_TYPE=API`:** Bootstraps the application using `NestFactory.create()`. It binds to port `4000`, exposes REST endpoints, parses multi-part file uploads, registers metadata in PostgreSQL, and pushes jobs to the Redis queue.
* **`PROCESS_TYPE=WORKER`:** Bootstraps using `NestFactory.createApplicationContext()`. This skips the heavy HTTP server overhead entirely, spawning a headless microservice that hooks directly into BullMQ to process tasks via FFmpeg.

---

## 🗄️ Prisma 7 Database Configuration

This project implements **Prisma 7**, which introduces a significant architectural shift: connection strings are decoupled from the static schema file and migrated to an explicit TypeScript configuration file.

* `prisma/schema.prisma`: Defines your structural database models, indexes, and enums exclusively. It uses `provider = "prisma-client-js"`.
* `prisma.config.ts`: Dynamically bootstraps runtime configurations, securely mapping the database connectivity strings directly from `process.env.DATABASE_URL`.

---

## 🔄 Job Lifecycles & BullMQ States

Tasks pushed to Redis flow through an strict state machine managed by BullMQ processors:

1.  **`PENDING`:** The file upload succeeded. Job parameters are recorded as a flexible `JsonB` field in the database. The task is waiting in the Redis FIFO sequence.
2.  **`PROCESSING`:** A worker thread claims the job. The container executes system-level commands leveraging the native **FFmpeg** binaries installed on the underlying Alpine OS.
3.  **`COMPLETED`:** FFmpeg exits successfully. The optimized asset is piped into Cloudflare R2, the output URL is saved, and state flags shift.
4.  **`FAILED`:** File corruption, bad codecs, or timeouts triggered a crash. The stack trace is saved to `errorMessage` for transparent failure reporting.

# 🎨 VideoOptima Frontend - Next.js User Interface

This directory contains the Next.js application powering the web interface. It focuses on a clean, responsive, and intuitive user experience (UX) for asynchronous video uploading, configuration, and tracking.

---

## 🌐 Docker Networking & Dual API Endpoints

When containerizing a Next.js application running **Hybrid Rendering (Server-Side Rendering / Server Components + Client-Side Interactivity)**, the frontend must communicate with the API across two distinct network perspectives:

### 1. External/Public Endpoint (`NEXT_PUBLIC_API_URL`)

- **Target:** Browser Environment (The Client).
- **Value:** `http://localhost:4000` (or your production domain).
- **Context:** Used inside `'use client'` hooks. When a user's browser triggers an action (e.g., polling the server via SSE/Axios to check a video's status), it talks directly to the public-facing port exposed on the host machine.
- **⚠️ Build-Time Note:** Variables prefixed with `NEXT_PUBLIC_` are baked into the JavaScript bundle during `npm run build`. In production Docker setups, these must be passed as `ARG` in the build stage.

### 2. Internal/Private Endpoint (`INTERNAL_API_URL`)

- **Target:** Node.js Container Environment (The Server).
- **Value:** `http://nestjs-api:4000`
- **Context:** Used exclusively within Server Components or during ISR/SSR cycles. When Next.js fetches data server-side, it bypasses the public internet. Instead, it leverages Docker's internal DNS bridge network (`video_network_prod`) to communicate directly with the `nestjs-api` container, eliminating network latency and maximizing backend security.

---

## 🧭 UX Workflow Steps

The UI behaves like a finite state machine, updating dynamically based on the asynchronous state managed globally via **Zustand**:

1. **`StepUpload` (Upload Stage):** Features a drag-and-drop boundary with immediate client-side validation. Files exceeding $100\text{MB}$ or possessing unapproved extensions are blocked instantly before initiating any network upload.
2. **`StepConfig` (Configuration Stage):** Displays context-aware parameter choices. Selecting operations like _Trim_ or _Thumbnail_ dynamically expands precise timestamp inputs while hiding irrelevant controls to reduce cognitive load.
3. **`StepProcessing` (Processing Stage):** Connects to the backend via Server-Sent Events (SSE). It translates raw database states into human-readable feedback (e.g., converting `PENDING` to _"Waiting in queue..."_ and `PROCESSING` to _"FFmpeg optimizing your asset..."_).
4. **`StepResult` (Result Stage):** Visualizes performance metrics comparing the original vs. the newly optimized asset (calculating precise savings percentages). Includes an absolute download button configured with `Content-Disposition` metadata to force instant file downloads directly from Cloudflare R2.

---

## 💻 Local Management Commands

If you need to manage or debug the frontend container independently from the root monorepo orchestrator, use the following shortcuts:

- **View Logs in Real-Time:**
  ```bash
  docker-compose -f ../docker-compose.prod.yml logs -f nextjs-frontend
  ```
- **View Logs in Real-Time:**
  ```bash
  docker-compose -f ../docker-compose.prod.yml up -d --build nextjs-frontend
    ```

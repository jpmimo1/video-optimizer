# 🎨 VideoOptima Frontend - Next.js User Interface

This directory contains the Next.js application powering the web panel, focusing on simple, fast user experiences and visual feedback during video transfers.

---

## 🌐 Docker Networking & Dual API Endpoints

When containerizing a Next.js application running **Hybrid Rendering (Server-Side Rendering / Server Components + Client-Side Interactivity)**, the frontend must communicate with the API across two distinct network perspectives:

### 1. External/Public Endpoint (`NEXT_PUBLIC_API_URL`)
* **Target:** Browser Environment (The Client)
* **Value:** `http://localhost:4000/api/v1`
* **Context:** Used inside `'use client'` hooks. When a user's browser performs short-polling requests to check a video's status, it talks directly through the port exposed on your physical computer (`localhost:4000`).

### 2. Internal/Private Endpoint (`INTERNAL_API_URL`)
* **Target:** Node.js Container Environment (The Server)
* **Value:** `http://nestjs-api:4000/api/v1`
* **Context:** Used exclusively within Server Components. When Next.js renders a dashboard server-side, it skips routing out to the public internet. Instead, it leverages Docker's internal DNS bridge network (`video_network`) to communicate directly with the `nestjs-api` container, eliminating latency and maximizing security.

---

## 🧭 UX Workflow States

The UI updates dynamically based on the asynchronous state returned by the API polling mechanisms:
* **Upload Stage:** Drag-and-drop boundary with immediate client-side validation for video files ($>100\text{MB}$ or unapproved extensions are blocked immediately before upload).
* **Configuration Stage:** Context-aware parameter options (e.g., Selecting *Trim* collapses quality buttons and projects precise time duration fields).
* **Processing Stage:** Interactive loader tracking states. Translates `PENDING` to "Waiting in Queue..." and `PROCESSING` to "FFmpeg optimizing asset...".
* **Result Stage:** Metrics visualization showing original vs. newly compressed metrics alongside download links fetched directly from Cloudflare R2.

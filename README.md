This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# API & Hooks Documentation

This document explains the API architecture used in our project and provides detailed guidelines on how and when to use our custom React Hooks (`useFetch`, `useApi`) and core HTTP engines (`client.ts`, `server.ts`).

---

## 1. React Hooks: `useFetch` vs `useApi`

These hooks are strictly for the frontend and should **only** be used inside **Client Components** (files with `"use client"`).

### 🟢 `useFetch` (Automatic Data Fetching)

**When to use:**
Use this hook when you need to fetch data from the database and display it on the screen (typically `GET` requests). It automatically fetches data as soon as the component mounts.

**Key Features:**

- Executes automatically on mount or when dependencies change.
- Provides an `isLoading` state to easily show loaders/spinners.
- Supports **polling** (automatically refetching data at specified intervals).
- Serves as an alternative to `useQuery` from React Query or `SWR`.

**How to use:**

```tsx
"use client";
import { useFetch } from "@/hooks/api/useFetch";
import { getProducts } from "@/services/product/product.service";

export default function ProductList() {
  // Automatically fetches data when the component loads
  const { data, isLoading, refetch } = useFetch(getProducts);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={refetch}>Refresh Data</button>
      {data?.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### 🔴 `useApi` (Manual Actions / Mutations)

**When to use:**
Use this hook when you need to send, save, update, or delete data based on a user action, like clicking a button or submitting a form (typically `POST` / `PUT` / `DELETE` requests).

**Key Features:**

- Does **not** execute automatically.
- Only fires when you manually call the `execute()` function.
- Serves as an alternative to `useMutation` from React Query.

**How to use:**

```tsx
"use client";
import { useApi } from "@/hooks/api/useApi";
import { createProduct } from "@/services/product/product.service";

export default function AddProductForm() {
  const { execute, isLoading } = useApi(createProduct);

  const handleSubmit = async () => {
    // This function code only runs when the button is clicked
    const success = await execute({ name: "New Product" });
    if (success) {
      alert("Product successfully created!");
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? "Saving..." : "Save Product"}
    </button>
  );
}
```

---

## 2. Core API Engines: `client.ts` vs `server.ts`

These are **not** React Hooks. They are the core engines responsible for directly communicating with the backend server.

### 🌐 `client.ts` (Client-side HTTP Engine)

- **Where is it used?** Whenever an API request originates from the browser.
- **Description:** All of our custom hooks (`useFetch`, `useApi`) and Client Components use `client.ts` under the hood to fetch data. It automatically attaches the browser's authorization tokens to outgoing requests.

### 🖥️ `server.ts` (Server-side HTTP Engine)

- **Where is it used?** Inside Next.js **Server Components** and **Server Actions**.
- **Why is it important?** To ensure excellent SEO (Search Engine Optimization) and fast initial page loads, we use Next.js Server-Side Rendering (SSR). During SSR, data is fetched directly on the server using `server.ts`. **React Hooks cannot be used here.**

**Example (Using `server.ts` in a Server Component):**

```tsx
// app/blog/page.tsx (No "use client" directive)
import { getPosts } from "@/services/blog/blog.service"; // This service uses server.ts internally

export default async function BlogPage() {
  // Data is fetched directly on the server and sent to the browser as ready HTML (Best for SEO)
  const posts = await getPosts();

  return (
    <div>
      {posts.map((post) => (
        <h2 key={post.id}>{post.title}</h2>
      ))}
    </div>
  );
}
```

## Use skeleton

<!-- <Suspense fallback={<TableSkeleton rows={5} />}>
  <UsersTable />
</Suspense> -->
---

## 🎯 Summary: What goes where?





# 🚀 CI/CD Zero to Hero
### Next.js + Docker + VPS + GitHub Actions
#### (Node 22 | Cloud Panel | SSH Deploy)

---

## 📌 What We're Building

```
Your Machine  →  GitHub Push  →  GitHub Actions  →  VPS (Docker + Next.js Live)
```

**Full Flow:**
```
git push
    ↓
GitHub Actions triggers
    ↓
[CI]  Install → Build → Test
    ↓
[CD]  SSH into VPS → Pull Image → Docker Restart
    ↓
Your Next.js app is LIVE ✅
```

---

## 🗺️ Table of Contents

1. [SSH Key Generation](#1-ssh-key-generation)
2. [Add SSH Key to VPS](#2-add-ssh-key-to-vps)
3. [Add Secrets to GitHub](#3-add-secrets-to-github)
4. [Prepare Your VPS](#4-prepare-your-vps)
5. [Docker Setup on VPS](#5-docker-setup-on-vps)
6. [Dockerfile for Next.js](#6-dockerfile-for-nextjs)
7. [docker-compose.yml](#7-docker-composeyml)
8. [GitHub Actions Workflow](#8-github-actions-workflow)
9. [First Deployment](#9-first-deployment)
10. [Verify Everything Works](#10-verify-everything-works)
11. [Full Reference Cheatsheet](#11-full-reference-cheatsheet)

---

## 1. SSH Key Generation

> SSH keys let GitHub Actions log into your VPS **without a password**.
> We generate a **dedicated key pair** only for CI/CD — never reuse your personal SSH key.

### On Your Local Machine (or anywhere — you only do this once):

```bash
# Generate a new ED25519 key pair specifically for CI/CD
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# When prompted:
# Enter passphrase: (just press Enter — leave it EMPTY)
# Enter same passphrase again: (press Enter again)
```

This creates two files:

| File | Type | Purpose |
|------|------|---------|
| `~/.ssh/github_actions_deploy` | **Private Key** | Goes into GitHub Secrets (never share this) |
| `~/.ssh/github_actions_deploy.pub` | **Public Key** | Goes onto your VPS |

### View your keys:

```bash
# View the PUBLIC key (this goes to your VPS)
cat ~/.ssh/github_actions_deploy.pub

# View the PRIVATE key (this goes to GitHub Secrets)
cat ~/.ssh/github_actions_deploy
```

> ⚠️ **Rule:** Public key → VPS. Private key → GitHub Secrets. Never swap them.

---

## 2. Add SSH Key to VPS

> Now we tell the VPS: "Trust connections that use this key."

### Step 2.1 — Log into your VPS

```bash
# Log in using your current method (password or existing key)
ssh root@YOUR_VPS_IP

# OR if you have a non-root user:
ssh youruser@YOUR_VPS_IP
```

### Step 2.2 — Create the deploy user (recommended)

```bash
# Create a dedicated deploy user (best practice — don't use root for deploys)
adduser deployer

# Give it sudo access
usermod -aG sudo deployer

# Also add to docker group (needed to run docker commands)
usermod -aG docker deployer

# Switch to the new user
su - deployer
```

### Step 2.3 — Add the public key to the VPS

```bash
# Still logged in as deployer on your VPS:

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Create/open the authorized_keys file
nano ~/.ssh/authorized_keys
```

Now paste your **PUBLIC key** (the content of `github_actions_deploy.pub`) into this file.

It will look like this:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx github-actions-deploy
```

Save and exit (`Ctrl+X` → `Y` → `Enter`), then:

```bash
# Set correct permissions
chmod 600 ~/.ssh/authorized_keys

# Verify it's there
cat ~/.ssh/authorized_keys
```

### Step 2.4 — Test the SSH connection from your local machine

```bash
# Back on your LOCAL machine — test the connection
ssh -i ~/.ssh/github_actions_deploy deployer@YOUR_VPS_IP

# If it logs in without asking for a password = SUCCESS ✅
# Type 'exit' to come back
exit
```

---

## 3. Add Secrets to GitHub

> GitHub Secrets store sensitive info. The Actions workflow reads them at runtime.
> **Never hardcode passwords, IPs, or keys directly in workflow files.**

### Go to: `Your Repo → Settings → Secrets and variables → Actions → New repository secret`

Add these secrets one by one:

---

### Secret 1: `SSH_PRIVATE_KEY`

**Value:** The entire content of your **private key** file.

```bash
# On your local machine, copy this output:
cat ~/.ssh/github_actions_deploy
```

The value looks like this — copy **everything** including the header and footer lines:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-----END OPENSSH PRIVATE KEY-----
```

---

### Secret 2: `VPS_HOST`

**Value:** Your VPS IP address
```
123.456.789.000
```

---

### Secret 3: `VPS_USER`

**Value:** The user you created (or root if you skipped that step)
```
deployer
```

---

### Secret 4: `VPS_PORT`

**Value:** SSH port (default is 22, but some cloud panels change this)
```
22
```
> Check your Cloud Panel's SSH settings if you're unsure.

---

### Secret 5: `DOCKER_HUB_USERNAME`

**Value:** Your Docker Hub username
```
yourdockerhubusername
```
> Create a free account at [hub.docker.com](https://hub.docker.com) if you don't have one.

---

### Secret 6: `DOCKER_HUB_TOKEN`

> Use an Access Token, NOT your Docker Hub password.

1. Go to [hub.docker.com](https://hub.docker.com) → Account Settings → Security
2. Click **"New Access Token"**
3. Name it: `github-actions`
4. Permission: `Read, Write, Delete`
5. Copy the token → paste as the secret value

---

### Secret 7: `APP_NAME`

**Value:** Your app/image name (lowercase, no spaces)
```
my-nextjs-app
```

---

### All secrets summary:

| Secret Name | Example Value | What it's for |
|-------------|---------------|---------------|
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH...` | SSH into VPS |
| `VPS_HOST` | `123.456.789.000` | Your VPS IP |
| `VPS_USER` | `deployer` | SSH username |
| `VPS_PORT` | `22` | SSH port |
| `DOCKER_HUB_USERNAME` | `johndoe` | Push Docker image |
| `DOCKER_HUB_TOKEN` | `dckr_pat_xxx...` | Docker Hub auth |
| `APP_NAME` | `my-nextjs-app` | Image/container name |

---

## 4. Prepare Your VPS

> Log into your VPS as root or sudo user and run these commands.

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano ufw

# Check if Node is needed on VPS
# (With Docker, you DON'T need Node on the VPS — Docker handles it)
# But if you ever need it:
# curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
# sudo apt install -y nodejs
```

### Firewall setup:

```bash
# Allow SSH (IMPORTANT — do this before enabling firewall or you'll lock yourself out)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow your app's port (e.g., 3000 for Next.js)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

> ⚠️ If your Cloud Panel uses a different SSH port (e.g., 2222), allow that port instead of 22.

### Create the app directory:

```bash
# Create a directory where your app will live
mkdir -p /var/www/my-nextjs-app

# Give ownership to deployer user
chown -R deployer:deployer /var/www/my-nextjs-app
```

---

## 5. Docker Setup on VPS

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose (v2)
sudo apt install -y docker-compose-plugin

# Add your user to docker group (so you don't need sudo every time)
sudo usermod -aG docker $USER
sudo usermod -aG docker deployer

# IMPORTANT: Log out and back in for group change to take effect
exit
# SSH back in
ssh deployer@YOUR_VPS_IP

# Verify Docker works
docker --version
docker compose version
docker run hello-world
```

Expected output:
```
Docker version 27.x.x, build xxxxx
Docker Compose version v2.x.x
Hello from Docker! ✅
```

---

## 6. Dockerfile for Next.js

> Put this file in the **root of your Next.js project** (same level as `package.json`).

```dockerfile
# Dockerfile

# ─────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────
FROM node:22-alpine AS deps

# Install libc compatibility for Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts \
  && npm cache clean --force


# ─────────────────────────────────────────
# Stage 2: Build the Next.js app
# ─────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all project files
COPY . .

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build


# ─────────────────────────────────────────
# Stage 3: Production runner (smallest image)
# ─────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy only what's needed to run the app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port Next.js runs on
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the app
CMD ["node", "server.js"]
```

### Required next.config.js setting:

> ⚠️ The Dockerfile above uses `standalone` output mode. You **must** enable this in your Next.js config.

```javascript
// next.config.js  (or next.config.mjs)

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',   // ← This is required for the Docker setup above
};

export default nextConfig;
```

### .dockerignore (create this too):

```
# .dockerignore
node_modules
.next
.git
.gitignore
*.md
.env
.env.local
.env*.local
npm-debug.log*
Dockerfile*
docker-compose*
.dockerignore
README.md
```

---

## 7. docker-compose.yml

> Put this on your **VPS** at `/var/www/my-nextjs-app/docker-compose.yml`.
> This defines how Docker runs your container on the server.

```yaml
# /var/www/my-nextjs-app/docker-compose.yml

version: '3.9'

services:
  app:
    image: YOUR_DOCKERHUB_USERNAME/my-nextjs-app:latest  # ← Change this
    container_name: my-nextjs-app
    restart: unless-stopped          # Auto-restart if it crashes
    ports:
      - "3000:3000"                  # host:container
    environment:
      - NODE_ENV=production
      # Add your app's environment variables here:
      # - DATABASE_URL=${DATABASE_URL}
      # - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      # - NEXTAUTH_URL=${NEXTAUTH_URL}
    env_file:
      - .env.production              # Load env vars from this file (optional)
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  app-network:
    driver: bridge
```

### Create the .env.production on your VPS:

```bash
# On your VPS, in the app directory
nano /var/www/my-nextjs-app/.env.production
```

Add your production environment variables:
```env
# /var/www/my-nextjs-app/.env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
# DATABASE_URL=postgresql://...
# NEXTAUTH_SECRET=your-secret-here
```

---

## 8. GitHub Actions Workflow

> Create this file in your project: `.github/workflows/deploy.yml`

```yaml
# .github/workflows/deploy.yml

name: 🚀 CI/CD — Build, Push & Deploy

on:
  push:
    branches:
      - main          # Triggers on push to main branch

  workflow_dispatch:  # Allows manual trigger from GitHub UI

# Cancel previous runs if a new push comes in
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  IMAGE_NAME: ${{ secrets.DOCKER_HUB_USERNAME }}/${{ secrets.APP_NAME }}

jobs:

  # ══════════════════════════════════════════════
  # JOB 1 ── CI: Build & Test
  # ══════════════════════════════════════════════
  ci:
    name: 🔨 Build & Test
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout your code
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      # 2. Setup Node.js 22
      - name: ⚙️ Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      # 3. Install dependencies
      - name: 📦 Install dependencies
        run: npm ci

      # 4. Run linter (if you have one configured)
      - name: 🔍 Run lint
        run: npm run lint
        continue-on-error: false  # Fail the pipeline if lint fails

      # 5. Run tests (if you have tests)
      - name: 🧪 Run tests
        run: npm test --if-present  # Won't fail if no test script exists

      # 6. Build Next.js (verify the build works)
      - name: 🏗️ Test build
        run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

  # ══════════════════════════════════════════════
  # JOB 2 ── Build Docker Image & Push to Hub
  # ══════════════════════════════════════════════
  docker-build-push:
    name: 🐳 Build & Push Docker Image
    runs-on: ubuntu-latest
    needs: ci           # Only runs if ci job passes

    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}

    steps:
      # 1. Checkout code
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      # 2. Set up QEMU (needed for multi-platform builds)
      - name: 🔧 Set up QEMU
        uses: docker/setup-qemu-action@v3

      # 3. Set up Docker Buildx (advanced build features)
      - name: 🔧 Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # 4. Log in to Docker Hub
      - name: 🔐 Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      # 5. Generate image tags and labels
      - name: 🏷️ Extract metadata (tags & labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest
            type=sha,prefix=sha-,format=short

      # 6. Build and push the Docker image
      - name: 🐳 Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          platforms: linux/amd64   # Use linux/amd64,linux/arm64 for multi-arch
          cache-from: type=gha     # Use GitHub Actions cache (faster builds)
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=production

  # ══════════════════════════════════════════════
  # JOB 3 ── Deploy to VPS via SSH
  # ══════════════════════════════════════════════
  deploy:
    name: 🚀 Deploy to VPS
    runs-on: ubuntu-latest
    needs: docker-build-push   # Only runs if docker job passes

    environment:
      name: production
      url: http://${{ secrets.VPS_HOST }}:3000

    steps:
      # 1. Deploy via SSH
      - name: 🚀 SSH Deploy to VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            echo "═══════════════════════════════════════"
            echo "  🚀 Starting Deployment"
            echo "  📅 Time: $(date)"
            echo "  🌿 Commit: ${{ github.sha }}"
            echo "═══════════════════════════════════════"

            # Go to app directory
            cd /var/www/my-nextjs-app

            # Pull the latest Docker image
            echo "📥 Pulling latest image..."
            docker pull ${{ secrets.DOCKER_HUB_USERNAME }}/${{ secrets.APP_NAME }}:latest

            # Stop and remove old container
            echo "🛑 Stopping old container..."
            docker compose down --remove-orphans || true

            # Start the new container
            echo "▶️  Starting new container..."
            docker compose up -d

            # Wait for container to be healthy
            echo "⏳ Waiting for app to be ready..."
            sleep 10

            # Check if container is running
            if docker ps | grep -q "${{ secrets.APP_NAME }}"; then
              echo "✅ Container is running!"
            else
              echo "❌ Container failed to start!"
              docker compose logs --tail=50
              exit 1
            fi

            # Clean up old unused Docker images (saves disk space)
            echo "🧹 Cleaning up old images..."
            docker image prune -f

            echo "═══════════════════════════════════════"
            echo "  ✅ DEPLOYMENT SUCCESSFUL!"
            echo "═══════════════════════════════════════"

      # 2. Post deployment summary
      - name: 📋 Deployment Summary
        run: |
          echo "## 🚀 Deployment Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Field | Value |" >> $GITHUB_STEP_SUMMARY
          echo "|-------|-------|" >> $GITHUB_STEP_SUMMARY
          echo "| ✅ Status | Success |" >> $GITHUB_STEP_SUMMARY
          echo "| 🌿 Branch | \`${{ github.ref_name }}\` |" >> $GITHUB_STEP_SUMMARY
          echo "| 📦 Commit | \`${{ github.sha }}\` |" >> $GITHUB_STEP_SUMMARY
          echo "| 👤 Triggered by | ${{ github.actor }} |" >> $GITHUB_STEP_SUMMARY
          echo "| 🐳 Image | \`${{ env.IMAGE_NAME }}:latest\` |" >> $GITHUB_STEP_SUMMARY
          echo "| ⏰ Time | $(date) |" >> $GITHUB_STEP_SUMMARY
```

---

## 9. First Deployment

### Step 9.1 — Initial manual setup on VPS (one-time only)

```bash
# SSH into your VPS
ssh deployer@YOUR_VPS_IP

# Log in to Docker Hub on the VPS (one-time, to pull private images)
docker login
# Enter your Docker Hub username and token

# Create app directory and add docker-compose.yml
mkdir -p /var/www/my-nextjs-app
cd /var/www/my-nextjs-app

# Create the docker-compose.yml (paste the content from Step 7)
nano docker-compose.yml

# Create your .env.production
nano .env.production
```

### Step 9.2 — Push your code to trigger the pipeline

```bash
# On your local machine, in your project root
# Make sure all files are there:
# - Dockerfile
# - .dockerignore
# - .github/workflows/deploy.yml
# - next.config.js (with output: 'standalone')

git add .
git commit -m "ci: add Docker and GitHub Actions CI/CD pipeline"
git push origin main
```

### Step 9.3 — Watch it run

1. Go to your GitHub repo
2. Click the **"Actions"** tab
3. You'll see your workflow running

```
🟡 CI/CD — Build, Push & Deploy   (running...)
   ├── 🟡 Build & Test
   ├── ⏸️  Build & Push Docker Image  (waiting for CI)
   └── ⏸️  Deploy to VPS             (waiting for Docker)
```

After a few minutes:
```
✅ CI/CD — Build, Push & Deploy
   ├── ✅ Build & Test
   ├── ✅ Build & Push Docker Image
   └── ✅ Deploy to VPS
```

---

## 10. Verify Everything Works

### Check on your VPS:

```bash
# SSH into VPS
ssh deployer@YOUR_VPS_IP

# Check running containers
docker ps

# Expected output:
# CONTAINER ID   IMAGE                          STATUS         PORTS
# abc123def456   yourusername/my-nextjs-app     Up 2 minutes   0.0.0.0:3000->3000/tcp

# Check container logs
docker logs my-nextjs-app

# Check container logs (live/follow mode)
docker logs -f my-nextjs-app

# Check app is responding
curl http://localhost:3000

# Check from outside (replace with your VPS IP)
curl http://YOUR_VPS_IP:3000
```

### Useful Docker commands to know:

```bash
# See all running containers
docker ps

# See all containers (including stopped)
docker ps -a

# Stop the app
docker compose -f /var/www/my-nextjs-app/docker-compose.yml down

# Start the app
docker compose -f /var/www/my-nextjs-app/docker-compose.yml up -d

# Restart the app
docker compose -f /var/www/my-nextjs-app/docker-compose.yml restart

# View logs
docker compose -f /var/www/my-nextjs-app/docker-compose.yml logs -f

# Check disk usage
docker system df

# Clean everything unused
docker system prune -f
```

---

## 11. Full Reference Cheatsheet

### File Structure in Your Project:

```
your-nextjs-project/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions CI/CD pipeline
│
├── src/ (or app/, pages/)      ← Your Next.js code
├── public/
│
├── Dockerfile                  ← Docker build instructions
├── .dockerignore               ← Files to exclude from Docker build
├── next.config.js              ← Must have output: 'standalone'
├── package.json
└── .gitignore                  ← Make sure .env files are here
```

### File Structure on Your VPS:

```
/var/www/my-nextjs-app/
├── docker-compose.yml          ← How Docker runs your container
└── .env.production             ← Production environment variables
```

---

### SSH Key Quick Reference:

```bash
# Generate new key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# View public key (→ goes to VPS authorized_keys)
cat ~/.ssh/github_actions_deploy.pub

# View private key (→ goes to GitHub Secret: SSH_PRIVATE_KEY)
cat ~/.ssh/github_actions_deploy

# Test SSH connection
ssh -i ~/.ssh/github_actions_deploy deployer@YOUR_VPS_IP

# Copy public key to VPS in one command (alternative to manual method)
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub deployer@YOUR_VPS_IP
```

---

### GitHub Secrets Quick Reference:

| Secret | Where to get it |
|--------|----------------|
| `SSH_PRIVATE_KEY` | `cat ~/.ssh/github_actions_deploy` |
| `VPS_HOST` | Your VPS dashboard / provider |
| `VPS_USER` | The user you created (`deployer`) |
| `VPS_PORT` | Check Cloud Panel SSH settings (usually `22`) |
| `DOCKER_HUB_USERNAME` | Your Docker Hub username |
| `DOCKER_HUB_TOKEN` | Docker Hub → Account Settings → Security → New Token |
| `APP_NAME` | Whatever you named your app (lowercase) |

---

### Pipeline Trigger Reference:

```yaml
# Trigger on push to main only
on:
  push:
    branches: [main]

# Trigger on push to multiple branches
on:
  push:
    branches: [main, develop, staging]

# Trigger on pull request (CI only — don't deploy on PR)
on:
  pull_request:
    branches: [main]

# Manual trigger (button in GitHub UI)
on:
  workflow_dispatch:

# Scheduled (every day at midnight UTC)
on:
  schedule:
    - cron: '0 0 * * *'
```

---

### Common Errors & Fixes:

```
❌ Error: ssh: handshake failed
Fix: Check SSH_PRIVATE_KEY secret — make sure you copied the FULL private key
     including "-----BEGIN" and "-----END" lines

❌ Error: Permission denied (publickey)
Fix: Verify the public key is in /home/deployer/.ssh/authorized_keys on VPS
     Run: cat ~/.ssh/authorized_keys (on VPS to confirm)

❌ Error: docker: Got permission denied
Fix: Run: sudo usermod -aG docker deployer
     Then log out and log back in to the VPS

❌ Error: Cannot connect to Docker daemon
Fix: sudo systemctl start docker
     sudo systemctl enable docker

❌ Error: next.config standalone not found
Fix: Add output: 'standalone' to your next.config.js

❌ Error: Image not found on Docker Hub
Fix: Make sure docker-build-push job ran successfully before deploy job
     Check DOCKER_HUB_USERNAME and APP_NAME secrets match your docker-compose.yml

❌ Error: Port already in use
Fix: docker ps     ← find what's using port 3000
     docker stop CONTAINER_ID
     Then re-run docker compose up -d
```

---

### The Full Journey — One Line Summary Per Step:

```
Step 1  → Generate SSH key pair on your machine
Step 2  → Put public key on VPS (authorized_keys)
Step 3  → Put private key + other secrets in GitHub
Step 4  → Prepare VPS (firewall, users, directories)
Step 5  → Install Docker on VPS
Step 6  → Add Dockerfile to your Next.js project
Step 7  → Add docker-compose.yml to your VPS
Step 8  → Add .github/workflows/deploy.yml to your project
Step 9  → git push → watch the magic happen
Step 10 → Verify the container is running on VPS
```

---

> 💡 **Every time you push to `main`:**
> GitHub Actions will automatically build → dockerize → deploy your app to your VPS.
> Zero manual steps after this setup. That's CI/CD.

---

*Stack: Next.js · Node 22 · Docker · GitHub Actions · VPS*
*Last Updated: April 2026*

1. **Server Components (For SEO/Fast Load):** Do **not** use hooks. Fetch data directly inside the Server Component using services backed by `server.ts`.
2. **Client Components (Automatic Display):** Use **`useFetch`** to automatically read data and display it.
3. **Client Components (User Actions/Forms):** Use **`useApi`** to manually send, update, or delete data upon user triggers (e.g., button clicks).


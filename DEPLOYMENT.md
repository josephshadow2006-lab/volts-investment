# VOLTS Deployment Guide

This project is now configured for stable production deployment using Docker and container platforms.

## Recommended production setup

### 1. Build the production client

From the repository root:

```powershell
npm --workspace client install
npm --workspace client run build
```

### 2. Run the production server locally

From the `server` folder:

```powershell
npm install
node index.js
```

Then open:

- `http://localhost:4000`

### 3. Use Docker for stable hosting

The root `Dockerfile` is configured to build the React app and serve it from the Express backend.

From the repository root:

```powershell
docker build -t volts-app .
docker run -p 4000:4000 -e JWT_SECRET=supersecretjwtkey volts-app
```

The app will be available on:

- `http://localhost:4000`

### 4. Use Docker Compose

The root `docker-compose.yml` spins up the production server with a persistent SQLite file mount.

```powershell
docker compose up --build
```

### 5. Deploy to a cloud container platform

Use any provider that supports Docker:
- Render
- Railway
- Fly.io
- DigitalOcean App Platform
- AWS ECS / Fargate

Deploy using the root `Dockerfile` and set environment variables:

- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `EMAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### 6. Access from anywhere

When hosted in the cloud, the app will be reachable from any smartphone or laptop on any network.

## Deploying on Render

Render can build and host this app using the root `Dockerfile`.

1. Create a new Web Service in Render.
2. Connect your GitHub repo and select the `main` branch.
3. Choose `Docker` as the environment.
4. Set `DockerfilePath` to `./Dockerfile`.
5. Add the following environment variables in Render:
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (e.g. `7d`)
   - `EMAIL_FROM`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `DB_PATH` = `/data/volts.db`
6. Add a persistent disk in Render:
   - Size: `1 GB`
   - Mount path: `/data`

Render will build the Docker image and run the app from port `4000`.

## Notes

- The local public tunnel was temporary. This Docker-based setup is stable and repeatable.
- For production, use a cloud host and secure `JWT_SECRET` + SMTP credentials.
- If you want, I can generate a ready-to-deploy Render or Railway config next.

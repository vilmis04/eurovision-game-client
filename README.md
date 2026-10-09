# Vote For The Winners | Eurovision guessing game

## Deployment
- The image is a multi-stage build: Node builds `dist/`, `nginxinc/nginx-unprivileged` serves it (no Node at runtime). Requires BuildKit.
- Build and push (replace x.x.x with version): `docker build -t vsud/ev-game:client-x.x.x . && docker push vsud/ev-game:client-x.x.x`
- The container listens on **8080** (set the exposed port to 8080 in Coolify). Health check: `/healthz`.
- The API URL defaults to the relative path `/api`, so one image works on any domain when `/api` is routed to the backend. Optional build args (mark as "build variable" in Coolify): `VITE_BASE_URL`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`. See `.env.example`.
- Compression is gzip only; the nginx-unprivileged image has no brotli module. Put brotli in front (CDN/proxy) if needed.
- ssh into the server, update docker compose with the new image version tag: vi ~/PROJECTS/docker-compose.yaml
- run docker compose up -d to start the service with the changes

## Time setting
Time is set in the DB with UTC timezone. So LT time is 3 hours ahead.

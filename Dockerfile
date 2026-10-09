# syntax=docker/dockerfile:1.7

FROM node:22.22.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
# VITE_* values are baked in at build time; mark them "build variable" in Coolify.
# All optional: the API URL defaults to the relative path /api.
ARG VITE_BASE_URL
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.inc /etc/nginx/conf.d/security-headers.inc
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

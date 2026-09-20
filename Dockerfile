# syntax=docker/dockerfile:1.7
# Ethora admin panel / web app as a prebuilt image. One bundle serves every
# install: values that used to be baked in at build time are read from
# /config.js at runtime (src/config/env.ts), which the entrypoint renders
# from the container's VITE_* environment. See docker/entrypoint.sh.
#
#   docker build -t ethora-frontend .
#   docker run --env-file .env -p 8080:8080 ethora-frontend            # serve
#   docker run --env-file .env -v /srv/www:/out ethora-frontend export # for host nginx
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_BUILD_VERSION=""
ARG VITE_BUILD_COMMIT=""
ARG VITE_BUILD_BRANCH=""
# VITE_RUNTIME_CONFIG makes the CSP plugin emit a placeholder instead of
# build-time origins; no other VITE_* value is set here on purpose.
ENV VITE_RUNTIME_CONFIG=true \
    VITE_BUILD_VERSION=${VITE_BUILD_VERSION} \
    VITE_BUILD_COMMIT=${VITE_BUILD_COMMIT} \
    VITE_BUILD_BRANCH=${VITE_BUILD_BRANCH}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
ARG VITE_BUILD_VERSION=""
ARG VITE_BUILD_COMMIT=""
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/50x.html
COPY docker/entrypoint.sh /usr/local/bin/ethora-frontend
RUN chmod +x /usr/local/bin/ethora-frontend
LABEL org.opencontainers.image.title="ethora-frontend" \
      org.opencontainers.image.vendor="Dappros Ltd" \
      org.opencontainers.image.revision=${VITE_BUILD_COMMIT} \
      org.opencontainers.image.version=${VITE_BUILD_VERSION}
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz > /dev/null || exit 1
ENTRYPOINT ["/usr/local/bin/ethora-frontend"]
CMD ["serve"]

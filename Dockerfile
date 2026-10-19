# syntax=docker/dockerfile:1.7
# Ethora admin panel / web app as a prebuilt image. One bundle serves every
# install: values that used to be baked in at build time are read from
# /config.js at runtime (src/config/env.ts), which the entrypoint renders
# from the container's VITE_* environment. See docker/entrypoint.sh.
#
#   docker build -t ethora-frontend .
#   docker run --env-file .env -p 8080:8080 ethora-frontend            # serve
#   docker run --env-file .env -v /srv/www:/out ethora-frontend export # for host nginx
#
# Optional: build against a local @ethora/chat-component checkout instead of
# the npm release pinned in package.json (the monoserver release workflow
# passes its pinned submodule this way):
#   docker buildx build --build-context chat-component-src=../ethora-chat-component .
ARG NODE_VERSION=24

# Empty by default; --build-context chat-component-src=<dir> replaces it.
FROM scratch AS chat-component-src

FROM node:${NODE_VERSION}-bookworm-slim AS chat-component
WORKDIR /src
COPY --from=chat-component-src / ./
RUN mkdir -p /pack && if [ -f package.json ]; then \
      npm ci --no-audit --no-fund --ignore-scripts \
      && npm run build:lib \
      && npm pack --pack-destination /pack; \
    fi

FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
# Overlay the locally built chat-component, if one was supplied.
COPY --from=chat-component /pack /pack
RUN if ls /pack/*.tgz >/dev/null 2>&1; then \
      npm install --no-save --no-audit --no-fund /pack/*.tgz; \
    fi
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
# Pick up base-image security fixes (the scan blocks fixable CRITICALs in openssl etc.).
RUN apk upgrade --no-cache
ARG VITE_BUILD_VERSION=""
ARG VITE_BUILD_COMMIT=""
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/50x.html
COPY docker/entrypoint.sh /usr/local/bin/ethora-frontend
# Licence text (full text staged by the release workflow; placeholder locally).
COPY licenses/ /licenses/
RUN chmod +x /usr/local/bin/ethora-frontend
LABEL org.opencontainers.image.title="ethora-frontend" \
      org.opencontainers.image.vendor="Dappros Ltd" \
      org.opencontainers.image.licenses="LicenseRef-Ethora-Core-1.0" \
      com.ethora.license.url="https://ethora.com/legal/ethora-core-license" \
      org.opencontainers.image.revision=${VITE_BUILD_COMMIT} \
      org.opencontainers.image.version=${VITE_BUILD_VERSION}
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz > /dev/null || exit 1
ENTRYPOINT ["/usr/local/bin/ethora-frontend"]
CMD ["serve"]

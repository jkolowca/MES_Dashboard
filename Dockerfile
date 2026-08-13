# Stage 1: Build Vue Custom Element Web Component
FROM node:20-alpine AS vue-builder
WORKDIR /app/vue-app
COPY vue-app/package*.json ./
RUN npm ci
COPY vue-app/ ./
RUN npm run build

# Stage 2: Build Angular Dashboard Application
FROM node:20-alpine AS angular-builder
WORKDIR /app
COPY dashboard/package*.json ./dashboard/
WORKDIR /app/dashboard
RUN npm ci

# Copy Vue build output so Angular can reference it during compilation
WORKDIR /app
COPY --from=vue-builder /app/vue-app/dist ./vue-app/dist
COPY dashboard/ ./dashboard/

# Generate environment.ts from template using build-time env variable
# On Render.com: set PRIMEUI_LICENSE in Environment → the platform passes it as --build-arg automatically
# Locally: docker build --build-arg PRIMEUI_LICENSE=<value> .
ARG PRIMEUI_LICENSE=""
RUN apk add --no-cache gettext && \
    envsubst < /app/dashboard/src/environments/environment.template.ts \
              > /app/dashboard/src/environments/environment.ts

WORKDIR /app/dashboard
RUN npm run build

# Stage 3: Serve Application with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=angular-builder /app/dashboard/dist/dashboard/browser /usr/share/nginx/html
RUN mv /usr/share/nginx/html/en-US /usr/share/nginx/html/en
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

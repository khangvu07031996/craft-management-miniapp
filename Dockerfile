# --- Frontend production Dockerfile ---
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Set API base URL for production
# Use API subdomain when deployed to production
ENV VITE_API_BASE_URL=https://api.thucongmyngheviet.com
RUN npm run build

# Nginx stage to serve static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Basic caching and SPA fallback
RUN rm /etc/nginx/conf.d/default.conf
COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
  location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }
}
NGINX
EXPOSE 80


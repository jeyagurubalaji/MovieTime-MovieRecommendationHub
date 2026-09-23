# Stage 1: Build static React assets
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency definitions and install packages
COPY package*.json ./
RUN npm ci

# Copy application source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve application via Nginx
FROM nginx:alpine

# Copy built assets from build stage to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if present, otherwise default to port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
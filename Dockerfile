# 🏗️ Stage 1: Sestavení React aplikace pomocí Vite
FROM node:18-alpine AS build
WORKDIR /app

ARG VITE_TMDB_API_KEY
ARG VITE_APPWRITE_PROJECT_ID
ARG VITE_APPWRITE_DATABASE_ID
ARG VITE_APPWRITE_TABLE_NAME
ARG VITE_APPWRITE_ENDPOINT

ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY
ENV VITE_APPWRITE_PROJECT_ID=$VITE_APPWRITE_PROJECT_ID
ENV VITE_APPWRITE_DATABASE_ID=$VITE_APPWRITE_DATABASE_ID
ENV VITE_APPWRITE_TABLE_NAME=$VITE_APPWRITE_TABLE_NAME
ENV VITE_APPWRITE_ENDPOINT=$VITE_APPWRITE_ENDPOINT

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 🌐 Stage 2: Spuštění lehkého webového serveru (Nginx)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Vlastní Nginx konfigurace
COPY nginx.conf /etc/nginx/nginx.conf

# Zkopírovat sestavený frontend
COPY --from=build /app/dist .

EXPOSE 80
#Prepis ENTRYPOINT, aby se spustil Nginx
ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]
# ====================================================
# Stage 1: Basis & Abhängigkeiten
# ====================================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Abhängigkeiten kopieren und installieren (nutzt Docker-Layer-Caching)
COPY package.json package-lock.json ./
RUN npm ci

# ====================================================
# Optionale Stage: Development-Server (Vite Dev)
# Aufrufbar mit: docker build --target dev -t frontend-dev .
# ====================================================
FROM dependencies AS dev

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ====================================================
# Stage 2: Build für Produktion
# ====================================================
FROM dependencies AS build

COPY . .

# Build-Argumente
ARG BASE_PATH=/
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Produktions-Build erstellen
RUN npm run build -- --base=${BASE_PATH}

# ====================================================
# Stage 3: Webserver (serve) für Produktion auf Port 5173
# ====================================================
FROM node:22-alpine AS prod

# Leichtgewichtigen Static-File-Server installieren
RUN npm install -g serve

# Kompiliertes Frontend aus Build-Stage kopieren
COPY --from=build /app/dist /app/dist

WORKDIR /app

# Port 5173 freigeben (Standard für Frontend & CORS)
EXPOSE 5173

# serve im SPA-Modus starten (-s = Single Page Application, leitet alle Routen auf index.html)
CMD ["serve", "-s", "dist", "-l", "5173"]
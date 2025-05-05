# ---- Étape 1 : build Node sur base Debian ----
FROM debian:bookworm-slim AS build

# Variables (change la version Node si besoin)
ENV NODE_VERSION=20.x \
    # dossier de travail
    APP_HOME=/app

# Dépendances système minimales
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg && \
    # dépôt officiel NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR ${APP_HOME}

# Copie uniquement ce qui est nécessaire pour résoudre les dépendances
COPY package.json package-lock.json* ./

# Installation « production » stricte des dépendances
RUN npm ci --legacy-peer-deps

# Copie du reste du code et build
COPY . .
RUN npm run build          # => génère /app/build

# ---- Étape 2 : image finale encore plus légère ----
FROM debian:bookworm-slim

# On réutilise simplement nginx-light pour servir les fichiers statiques
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx-light && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copie des fichiers compilés
COPY --from=build /app/build /var/www/html

# Configuration Nginx minimale
RUN printf 'server { \
    listen 80; \
    root /var/www/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
}\n' > /etc/nginx/sites-available/default

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

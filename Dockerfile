# ============================================================================
# Dockerfile — Palhas Douradas Frontend (build estático + Nginx)
# ============================================================================
# Multi-stage: a etapa de build usa Node só para gerar os arquivos estáticos
# (dist/); a imagem final é só Nginx servindo HTML/JS/CSS — nenhum runtime
# Node fica na imagem de produção, mantendo-a pequena e sem superfície de
# ataque desnecessária.

# ---- Etapa 1: build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# ---- Etapa 2: runtime (Nginx servindo estático) ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080

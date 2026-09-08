#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# deploy.sh — Build & Deploy do Frontend Palhas Douradas no Cloud Run
# ============================================================================
# Reaproveita o mesmo projeto GCP da Sales Platform API para não duplicar
# custo fixo. Padrão de baixo custo: Cloud Run scale-to-zero, sem Load
# Balancer/IAP (site público por natureza — é uma vitrine, não precisa de
# autenticação de borda).
#
# NOTA DE CUSTO: para um frontend 100% estático como este, Cloud Storage +
# Cloud CDN (ou Firebase Hosting) tende a ser mais barato e mais simples do
# que manter um container Cloud Run rodando — vale considerar migrar para lá
# se o tráfego crescer e o custo de Cloud Run deixar de ser irrelevante.
# Por ora, Cloud Run mantém o mesmo padrão de deploy já usado no backend.
#
# Pré-requisitos: rodar via Cloud Shell (mesma conta gcloud do backend).
# ============================================================================

PROJECT_ID="${PROJECT_ID:-gen-lang-client-0375194901}"
REGION="southamerica-east1"
SERVICE_NAME="palhas-douradas-frontend"

echo "==> Configurando projeto ${PROJECT_ID}..."
gcloud config set project "${PROJECT_ID}"

echo "==> Habilitando APIs necessárias..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

echo "==> Build da imagem via Cloud Build..."
gcloud builds submit --tag "gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest" .

echo "==> Deploy no Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --min-instances=0 \
  --max-instances=2 \
  --memory=256Mi \
  --cpu=1 \
  --timeout=60

URL=$(gcloud run services describe "${SERVICE_NAME}" --region="${REGION}" --format="value(status.url)")
echo ""
echo "==> Deploy concluído."
echo "    URL do site: ${URL}"
echo ""
echo "    LEMBRETE: volte no backend (Sales Platform API) e atualize"
echo "    ALLOWED_ORIGINS de '*' para '${URL}' — deixar '*' em produção"
echo "    depois que o frontend tem domínio fixo é desnecessariamente aberto."

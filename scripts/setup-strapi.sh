#!/usr/bin/env bash
set -e

# Corré esto una sola vez, desde la raíz del repo, con la base de datos
# ya levantada (docker compose up -d). Genera la carpeta cms/ con Strapi
# ya configurado para usar el mismo Postgres que usa el backend.

npx create-strapi-app@latest cms \
  --quickstart \
  --no-run \
  --dbclient=postgres \
  --dbhost=localhost \
  --dbport=5432 \
  --dbname=tp2_db \
  --dbusername=tp2 \
  --dbpassword=tp2pass

echo ""
echo "Strapi generado en ./cms"
echo "Para iniciarlo: cd cms && npm run develop"

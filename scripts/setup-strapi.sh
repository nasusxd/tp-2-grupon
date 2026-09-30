#!/usr/bin/env bash
set -e



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

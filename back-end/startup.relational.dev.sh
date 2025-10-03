#!/usr/bin/env bash
set -euo pipefail

# Default env fallbacks for local docker
: "${DATABASE_HOST:=postgres}"
: "${DATABASE_PORT:=5432}"
: "${MAIL_HOST:=maildev}"
: "${MAIL_PORT:=1025}"
: "${APP_PORT:=3000}"

/opt/wait-for-it.sh "${DATABASE_HOST}:${DATABASE_PORT}" -t 120
/opt/wait-for-it.sh "${MAIL_HOST}:${MAIL_PORT}" -t 120 || true

# Copy env-example if .env missing (Dockerfile tries too, but ensure here at runtime)
if [ ! -f .env ] && [ -f env-example-relational ]; then
  cp env-example-relational .env
fi

echo "Running migrations..."
npm run migration:run || true

echo "Starting NestJS in watch mode on ${APP_PORT}..."
npm run start:dev

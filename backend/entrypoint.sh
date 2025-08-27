#!/usr/bin/env bash
set -euo pipefail

echo "[backend] Waiting for database ${DATABASE_HOST:-postgres}:${DATABASE_PORT:-5432}..."
until nc -z "${DATABASE_HOST:-postgres}" "${DATABASE_PORT:-5432}"; do
  sleep 1
done
echo "[backend] Database is up."

python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "[backend] Starting Daphne ASGI server..."
exec daphne -b 0.0.0.0 -p "${PORT:-8000}" daycare_project.asgi:application

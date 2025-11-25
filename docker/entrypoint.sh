#!/usr/bin/env bash
set -e

cd /var/www/html

# If no .env, bootstrap from example
if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
fi

# Apply APP_KEY from environment if provided
if [ -n "${APP_KEY}" ]; then
    if grep -q "^APP_KEY=" .env; then
        sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|" .env
    else
        echo "APP_KEY=${APP_KEY}" >> .env
    fi
fi

# Ensure key exists
if ! grep -q "^APP_KEY=" .env || [ -z "$(grep '^APP_KEY=' .env | cut -d= -f2)" ]; then
    php artisan key:generate --force
fi

# Ensure writable dirs and sqlite file
mkdir -p storage bootstrap/cache \
    storage/framework/cache/data storage/framework/sessions storage/framework/testing storage/framework/views storage/logs \
    database
touch database/database.sqlite

# Default session driver to file if not provided
if ! grep -q "^SESSION_DRIVER=" .env; then
    echo "SESSION_DRIVER=file" >> .env
fi

# Default APP_ENV/DEBUG to production/off if not set
if ! grep -q "^APP_ENV=" .env; then
    echo "APP_ENV=production" >> .env
fi
if ! grep -q "^APP_DEBUG=" .env; then
    echo "APP_DEBUG=false" >> .env
fi

# Run migrations to ensure sessions table exists when using sqlite
php artisan migrate --force || true

# Optimize caches
php artisan config:clear || true
php artisan optimize || true

exec "$@"

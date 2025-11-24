# ---------- Node build for assets ----------
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY vite.config.js ./
COPY resources resources
RUN npm run build

# ---------- Composer build for PHP deps ----------
FROM composer:2 AS composer-builder
WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --no-suggest --no-scripts
RUN composer dump-autoload --optimize --no-dev

# ---------- Runtime ----------
FROM php:8.3-cli
WORKDIR /var/www/html

# Install system deps if needed (currently only git/zip for completeness)
RUN apt-get update && apt-get install -y git zip unzip && rm -rf /var/lib/apt/lists/*

COPY --from=composer-builder /app ./
COPY --from=node-builder /app/public/build ./public/build
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
    && mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV PORT=8000
EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]

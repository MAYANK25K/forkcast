FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    unzip libpq-dev libzip-dev \
    && docker-php-ext-install pdo_pgsql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader

# ❌ REMOVE THIS LINE: RUN cp .env.example .env

CMD php artisan key:generate --force && php artisan migrate:fresh --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=$PORT

FROM php:8.3-cli

WORKDIR /app

# Installer les extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip git curl \
    && docker-php-ext-install pdo_mysql mbstring bcmath tokenizer xml ctype fileinfo curl

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . /app

RUN composer install --no-dev --optimize-autoloader
RUN php artisan config:cache

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]

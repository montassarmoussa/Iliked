FROM php:8.2-fpm

WORKDIR /app

# Installer les paquets nécessaires et extensions PHP
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip git curl libcurl4-openssl-dev pkg-config \
    && docker-php-ext-install pdo_mysql mbstring bcmath xml ctype fileinfo curl

# Copier le backend Laravel
COPY ./backend /app

# Installer Composer
RUN curl -sS https://getcomposer.org/installer | php
RUN mv composer.phar /usr/local/bin/composer

# Installer les dépendances Laravel
RUN composer install --no-dev --optimize-autoloader

# Cacher la configuration Laravel
ENV APP_KEY=base64:GQxQ6pbrwjwctnkclZa5CnKfhXLxVcUzs5yq+cCTyY0=
RUN php artisan config:cache

EXPOSE 9000

CMD ["php-fpm"]

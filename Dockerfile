FROM php:8.2-fpm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip git curl \
    && docker-php-ext-install pdo_mysql mbstring bcmath xml ctype fileinfo curl

COPY ./backend /app

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --optimize-autoloader \
    && php artisan config:cache

EXPOSE 9000

CMD ["php-fpm"]

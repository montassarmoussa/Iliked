# ==========================
# Dockerfile Laravel (Render)
# ==========================
FROM php:8.2-fpm

# Définir le dossier de travail
WORKDIR /app

# Installer les dépendances système pour PHP et Composer
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    libcurl4-openssl-dev \
    pkg-config \
    && docker-php-ext-install pdo_mysql mbstring bcmath xml ctype fileinfo curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copier le backend Laravel dans le container
COPY ./backend /app

# Installer Composer
RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer


# Installer les dépendances Laravel
RUN composer install --no-dev --optimize-autoloader

# Cacher la configuration Laravel
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Exposer le port pour Render
EXPOSE 9000

# Commande pour démarrer PHP-FPM
CMD ["php-fpm"]FROM php:8.2-fpm

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

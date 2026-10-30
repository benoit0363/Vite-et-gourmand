FROM php:8.2-apache

# Installation des extensions nécessaires (par exemple pdo_mysql pour la base de données)
RUN docker-php-ext-install pdo_mysql mysqli

# Activation du module de réécriture d'URL pour Apache (utile pour les API)
RUN a2enmod rewrite

# Copie des fichiers du projet dans le dossier web d'Apache
COPY . /var/www/html/

# Attribution des bonnes permissions
RUN chown -R www-data:www-data /var/www/html
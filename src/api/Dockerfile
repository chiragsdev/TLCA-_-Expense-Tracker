    # Use the official PHP 8.2 image
FROM php:8.2-apache

# Copy all your backend files into the container
COPY . /var/www/html/

# Expose Render’s expected port
EXPOSE 10000

# Tell Apache to listen on Render's port
RUN sed -i 's/80/10000/' /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf

# Start Apache server
CMD ["apache2-foreground"]

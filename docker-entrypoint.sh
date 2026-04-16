#!/bin/bash
set -e

# Clear Laravel caches on startup to ensure fresh config
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

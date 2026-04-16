#!/bin/bash
set -e

# Clear Laravel caches on startup to ensure fresh config
# Run non-critical commands without stopping on failure
php artisan config:clear || true
php artisan route:clear || true  
php artisan view:clear || true
# Skip cache:clear as it requires database connection

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

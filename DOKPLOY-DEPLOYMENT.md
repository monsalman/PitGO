# PitGO Deployment dengan Dokploy

## 📋 Persiapan

Sebelum deploy, pastikan:
1. ✅ Dokploy sudah terinstall dan running di port 3000
2. ✅ Domain `pitgo.sudoman.my.id` sudah dikonfigurasi
3. ✅ Git repository siap (semua files sudah committed)
4. ✅ Environment variables sudah dikonfigurasi di `.env`

## 🚀 Langkah-Langkah Deploy

### 1. Login ke Dokploy Dashboard
- Akses http://localhost:3000 atau tunnel URL Dokploy Anda
- Login dengan credentials Anda

### 2. Buat Project Baru
- Klik "Create New Project"
- Nama: `PitGO`
- Deskripsi: `PitGO - Modern Laravel + React Application`

### 3. Tambah Application
- Klik "Add Application"
- Pilih "Docker" sebagai deployment method
- Application Name: `pitgo-app`
- Source: Pilih Git repository atau taruh kode di server

### 4. Konfigurasi Docker
- **Dockerfile**: `Dockerfile.production`
- **Build Context**: Root directory (`.`)
- **Ports**:
  - 8000 (Laravel API)
  - 6001 (WebSocket Reverb)

### 5. Konfigurasi Environment Variables
Tambahkan semua variables dari `.env`:

```
APP_NAME=PitGO
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_URL=https://pitgo.sudoman.my.id

DB_CONNECTION=pgsql
DB_HOST=postgresql
DB_PORT=5432
DB_DATABASE=pitgo_db
DB_USERNAME=pitgo_user
DB_PASSWORD=your_secure_password

REDIS_HOST=redis
REDIS_PASSWORD=your_redis_password
REDIS_PORT=6379

QUEUE_CONNECTION=redis
SESSION_DRIVER=cookie
CACHE_DRIVER=redis
BROADCAST_CONNECTION=reverb
```

### 6. Konfigurasi Domain dan SSL
- **Domain**: `pitgo.sudoman.my.id`
- **SSL/HTTPS**: Enable (auto-generated via Let's Encrypt)
- **Force HTTPS**: Enable

### 7. Konfigurasi Services (jika menggunakan Docker Compose)
Setup PostgreSQL dan Redis services di Dokploy, atau gunakan external services

#### PostgreSQL
```yaml
image: postgres:15-alpine
environment:
  POSTGRES_DB: pitgo_db
  POSTGRES_USER: pitgo_user
  POSTGRES_PASSWORD: your_secure_password
volumes:
  - postgres-data:/var/lib/postgresql/data
```

#### Redis
```yaml
image: redis:7-alpine
command: redis-server --requirepass your_redis_password
volumes:
  - redis-data:/data
```

### 8. Deployment
- Review semua configuration
- Klik "Deploy" atau "Redeploy"
- Monitor logs untuk memastikan deployment berhasil

### 9. Post-Deployment Setup
Setelah deployment berhasil, jalankan commands di container:

```bash
# Run migrations
php artisan migrate --force

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate storage link
php artisan storage:link
```

## 📊 Monitoring

### Logs
- Web UI Dokploy menampilkan realtime logs
- Akses container logs untuk debugging

### Health Check
- Endpoint: `https://pitgo.sudoman.my.id/health`
- Status harus return HTTP 200 jika aplikasi healthy

### Metrics
- Monitor CPU, Memory, Disk usage di Dokploy dashboard
- Set alerts untuk sumber daya yang mencurigakan

## 🔄 Continuous Deployment

Jika menggunakan Git integration di Dokploy:
1. Setup webhook di GitHub/GitLab
2. Setiap push ke branch default akan trigger automatic deployment
3. Dokploy akan rebuild image dan update services

## 🔧 Konfigurasi Advanced

### Auto-scaling (jika supported)
```yaml
resources:
  cpus: "2"
  memory: 1024M
```

### Backup Database
- Setup automated backups di Dokploy untuk PostgreSQL
- Retention: 7-30 hari

### SSL Certificate Management
- Dokploy handle Let's Encrypt automatic renewal
- Renewal happens sebelum expiry

## 🆘 Troubleshooting

### Build Failed
- Check Dockerfile syntax
- Verify all assets di repository
- Check disk space: `df -h`

### Application Not Starting
```bash
# Check logs
docker logs [container-id]

# Check environment variables
docker exec [container-id] php artisan env

# Test database connection
docker exec [container-id] php artisan tinker
# Pastikan database reachable
```

### Port Conflict
- Ensure ports 8000, 6001 tidak digunakan service lain
- Edit nginx.conf jika perlu ubah port

### WebSocket Connection Issues
- Verify port 6001 exposed correctly
- Check Reverb configuration di config/broadcasting.php
- Pastikan domain sudah SSL/HTTPS

## 📝 Maintenance

### Regular Updates
1. Pull latest code dari Git
2. Dokploy akan rebuild image otomatis
3. Database migrations run otomatis

### Database Backup
```bash
# Manual backup
docker exec [postgres-container] pg_dump -U pitgo_user pitgo_db > backup.sql

# Restore dari backup
cat backup.sql | docker exec -i [postgres-container] psql -U pitgo_user pitgo_db
```

## 📞 Support
Jika ada issues, cek:
1. Dokploy logs dan application logs
2. Docker container status
3. Database connectivity
4. Environment variables configuration
5. SSL certificate status

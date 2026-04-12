# PitGO Deployment Guide

## 📋 Overview

Project PitGO adalah aplikasi Laravel 12 dengan fitur:
- Laravel Reverb (WebSocket server)
- Queue Worker
- React Frontend (Vite)
- Cloudflare Tunnel untuk akses publik

Domain: **pitgo.sudoman.my.id**

## 🚀 Quick Start

### 1. Start All Services

```bash
# Start Laravel services (PHP, Queue, Reverb)
./pitgo.sh start

# Setup Cloudflare Tunnel (first time only)
./pitgo.sh setup-tunnel

# Start Cloudflare Tunnel
./pitgo.sh start-tunnel
```

### 2. Check Status

```bash
./pitgo.sh status
```

Expected output:
```
📊 PitGO Laravel Services Status:

  ✅ PHP Server - Running (PID: xxxxx) :8000
  ✅ Queue Worker - Running (PID: xxxxx)
  ✅ Reverb WebSocket - Running (PID: xxxxx) :6001

📊 Cloudflare Tunnel Status:

  ✅ Tunnel - Running (PID: xxxxx)
```

### 3. Stop All Services

```bash
# Stop Laravel services
./pitgo.sh stop

# Stop Cloudflare Tunnel
./pitgo.sh stop-tunnel
```

## 🔧 First Time Setup

### Step 1: Environment Setup

```bash
# .env file sudah dibuat dan dikonfigurasi
# APP_KEY sudah di-generate
# Database migrations sudah dijalankan
```

### Step 2: Install Dependencies

```bash
# Composer (production)
composer install --no-dev --optimize-autoloader

# NPM
npm install --legacy-peer-deps

# Build frontend
npm run build
```

### Step 3: Setup Cloudflare Tunnel (First Time)

```bash
./pitgo.sh setup-tunnel
```

Script ini akan:
1. Meminta autentikasi Cloudflare (browser akan terbuka)
2. Membuat tunnel dengan nama "pitgo"
3. Mengkonfigurasi DNS routing untuk `pitgo.sudoman.my.id`
4. Membuat config file di `~/.cloudflared/config.yml`

**Penting:** Saat autentikasi, pastikan Anda:
- Login ke Cloudflare account yang memiliki zone `sudoman.my.id`
- Pilih zone: `sudoman.my.id`
- Ikuti instruksi di browser

### Step 4: Start Services

```bash
# Start Laravel services
./pitgo.sh start

# Start Cloudflare Tunnel
./pitgo.sh start-tunnel
```

## 📖 Available Commands

| Command | Description |
|---------|-------------|
| `./pitgo.sh start` | Start all Laravel services |
| `./pitgo.sh stop` | Stop all Laravel services |
| `./pitgo.sh restart` | Restart all Laravel services |
| `./pitgo.sh status` | Show status of all services |
| `./pitgo.sh logs` | Show Laravel logs (tail -f) |
| `./pitgo.sh setup-tunnel` | Setup Cloudflare Tunnel |
| `./pitgo.sh start-tunnel` | Start Cloudflare Tunnel |
| `./pitgo.sh stop-tunnel` | Stop Cloudflare Tunnel |
| `./pitgo.sh tunnel-logs` | Show Cloudflare Tunnel logs |

## 🏗️ Architecture

```
Internet
  ↓
https://pitgo.sudoman.my.id
  ↓
Cloudflare Tunnel (cloudflared)
  ↓
http://127.0.0.1:8000 (PHP Server)
  ↓
Laravel Application
  ├─ Queue Worker (background jobs)
  └─ Reverb WebSocket (port 6001)
```

## 🔍 Troubleshooting

### Services Not Starting

```bash
# Check logs
./pitgo.sh logs

# Check individual PHP server logs
tail -f storage/logs/php.log
tail -f storage/logs/queue.log
tail -f storage/logs/reverb.log
```

### Tunnel Not Connecting

```bash
# Check tunnel logs
./pitgo.sh tunnel-logs

# Verify config
cat ~/.cloudflared/config.yml

# Check if tunnel exists
cloudflared tunnel list
```

### Database Issues

```bash
# Run migrations
php artisan migrate --force

# Clear cache
php artisan config:clear
php artisan cache:clear
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill and restart
./pitgo.sh stop
./pitgo.sh start
```

## 🔐 Production Configuration

File `.env` sudah dikonfigurasi untuk production:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://pitgo.sudoman.my.id`
- `BROADCAST_CONNECTION=reverb`

## 📝 Notes

- Semua service berjalan di background menggunakan `setsid`
- PID files disimpan di `.pids/` directory
- Logs tersedia di `storage/logs/`
- Cloudflare tunnel config di `~/.cloudflared/config.yml`

## 🆘 Manual Commands

If the scripts don't work, here are the manual commands:

```bash
# PHP Server
cd /home/mannn/PitGO
php artisan serve --host=127.0.0.1 --port=8000

# Queue Worker
php artisan queue:work --tries=3 --timeout=90

# Reverb WebSocket
php artisan reverb:start --host=127.0.0.1 --port=6001

# Cloudflare Tunnel
cloudflared tunnel --config ~/.cloudflared/config.yml run
```

Run each in a separate terminal, or append `&` to run in background.

# PitGO Quick Reference Card

## ✅ What's Already Done

- [x] Environment configured (.env with APP_KEY)
- [x] Dependencies installed (composer & npm)
- [x] Frontend built (Vite production build)
- [x] Database migrated
- [x] Background service manager created
- [x] Cloudflare Tunnel config ready

## 🚀 To Get Started RIGHT NOW

### 1. Start Laravel Services
```bash
./pitgo.sh start
```

### 2. Setup Cloudflare Tunnel (One-time, requires browser)
```bash
./pitgo.sh setup-tunnel
```
⚠️ **This will open your browser** - login to Cloudflare and select zone `sudoman.my.id`

### 3. Start Cloudflare Tunnel
```bash
./pitgo.sh start-tunnel
```

### 4. Access Your App
- Local: http://127.0.0.1:8000
- Public: https://pitgo.sudoman.my.id

## 📋 Daily Use Commands

```bash
# Start everything
./pitgo.sh start
./pitgo.sh start-tunnel

# Check status
./pitgo.sh status

# Stop everything  
./pitgo.sh stop
./pitgo.sh stop-tunnel

# View logs
./pitgo.sh logs          # Laravel logs
./pitgo.sh tunnel-logs   # Cloudflare tunnel logs
```

## 🎯 What Each Service Does

| Service | Port | Purpose |
|---------|------|---------|
| PHP Server | 8000 | Main Laravel app |
| Queue Worker | - | Background jobs |
| Reverb | 6001 | WebSocket real-time features |
| Cloudflare Tunnel | - | Exposes app to internet |

## 📁 Files Created

```
pitgo.sh              - Main service manager (USE THIS!)
setup-services.sh     - Systemd services (backup method)
start-background.sh   - Background processes (backup method)
setup-tunnel.sh       - Cloudflare tunnel setup
DEPLOYMENT.md         - Full deployment guide
.pids/                - PID files for running services
storage/logs/         - Application logs
```

## 🔧 If Something Goes Wrong

```bash
# Restart everything
./pitgo.sh restart
./pitgo.sh stop-tunnel
./pitgo.sh start-tunnel

# Clear Laravel cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Check if ports are free
lsof -i :8000
lsof -i :6001
```

## 🌐 Cloudflare Tunnel Manual Setup

If `./pitgo.sh setup-tunnel` doesn't work:

1. **Login to Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```

2. **Create tunnel:**
   ```bash
   cloudflared tunnel create pitgo
   ```

3. **Create config** at `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: pitgo
   credentials-file: /home/mannn/.cloudflared/pitgo.json
   
   ingress:
     - hostname: pitgo.sudoman.my.id
       service: http://127.0.0.1:8000
     - service: http_status:404
   ```

4. **Route DNS:**
   ```bash
   cloudflared tunnel route dns pitgo pitgo.sudoman.my.id
   ```

5. **Run tunnel:**
   ```bash
   cloudflared tunnel --config ~/.cloudflared/config.yml run
   ```

Or simply: `./pitgo.sh start-tunnel`

## 💡 Pro Tips

- Keep terminal open while services are running
- Use `./pitgo.sh status` to check what's running
- Logs are in `storage/logs/*.log`
- Tunnel logs are in `~/.cloudflared/tunnel.log`
- Always stop services cleanly with `./pitgo.sh stop`

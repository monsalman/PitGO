#!/bin/bash

# PitGO Complete Service Manager
# Manages Laravel app, queue, reverb, and Cloudflare Tunnel

PROJECT_DIR="/home/mannn/PitGO"
PID_DIR="$PROJECT_DIR/.pids"
LOG_DIR="$PROJECT_DIR/storage/logs"
CF_CONFIG_DIR="$HOME/.cloudflared"
CF_CONFIG_FILE="$CF_CONFIG_DIR/config.yml"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    echo -e "${BLUE}🚀 PitGO Complete Service Manager${NC}"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs|setup-tunnel|start-tunnel|stop-tunnel}"
    echo ""
    echo "Commands:"
    echo "  start          - Start all Laravel services"
    echo "  stop           - Stop all Laravel services"
    echo "  restart        - Restart all Laravel services"
    echo "  status         - Show status of all services"
    echo "  logs           - Show Laravel logs"
    echo "  setup-tunnel   - Setup Cloudflare Tunnel"
    echo "  start-tunnel   - Start Cloudflare Tunnel"
    echo "  stop-tunnel    - Stop Cloudflare Tunnel"
    echo "  tunnel-logs    - Show Cloudflare Tunnel logs"
    echo ""
    exit 1
}

# ========== LARAVEL SERVICES ==========

start_php_server() {
    if [ -f "$PID_DIR/php.pid" ] && kill -0 $(cat "$PID_DIR/php.pid") 2>/dev/null; then
        echo -e "  ${YELLOW}⏭️  PHP Server already running (PID: $(cat "$PID_DIR/php.pid"))${NC}"
        return
    fi
    
    echo -e "  ${GREEN}🚀 Starting PHP Server...${NC}"
    cd "$PROJECT_DIR"
    setsid /usr/bin/php artisan serve --host=127.0.0.1 --port=8000 > "$LOG_DIR/php.log" 2>&1 &
    sleep 2
    php_pid=$(pgrep -f "artisan serve.*8000" | head -1)
    if [ -n "$php_pid" ]; then
        echo "$php_pid" > "$PID_DIR/php.pid"
        echo -e "  ${GREEN}✅ PHP Server started (PID: $php_pid)${NC}"
    else
        echo -e "  ${RED}❌ PHP Server failed to start${NC}"
    fi
}

start_queue_worker() {
    if [ -f "$PID_DIR/queue.pid" ] && kill -0 $(cat "$PID_DIR/queue.pid") 2>/dev/null; then
        echo -e "  ${YELLOW}⏭️  Queue Worker already running (PID: $(cat "$PID_DIR/queue.pid"))${NC}"
        return
    fi
    
    echo -e "  ${GREEN}🚀 Starting Queue Worker...${NC}"
    cd "$PROJECT_DIR"
    setsid /usr/bin/php artisan queue:work --tries=3 --timeout=90 > "$LOG_DIR/queue.log" 2>&1 &
    sleep 2
    queue_pid=$(pgrep -f "artisan queue:work" | head -1)
    if [ -n "$queue_pid" ]; then
        echo "$queue_pid" > "$PID_DIR/queue.pid"
        echo -e "  ${GREEN}✅ Queue Worker started (PID: $queue_pid)${NC}"
    else
        echo -e "  ${RED}❌ Queue Worker failed to start${NC}"
    fi
}

start_reverb() {
    if [ -f "$PID_DIR/reverb.pid" ] && kill -0 $(cat "$PID_DIR/reverb.pid") 2>/dev/null; then
        echo -e "  ${YELLOW}⏭️  Reverb WebSocket already running (PID: $(cat "$PID_DIR/reverb.pid"))${NC}"
        return
    fi
    
    echo -e "  ${GREEN}🚀 Starting Reverb WebSocket...${NC}"
    cd "$PROJECT_DIR"
    setsid /usr/bin/php artisan reverb:start --host=127.0.0.1 --port=6001 > "$LOG_DIR/reverb.log" 2>&1 &
    sleep 2
    reverb_pid=$(pgrep -f "artisan reverb:start" | head -1)
    if [ -n "$reverb_pid" ]; then
        echo "$reverb_pid" > "$PID_DIR/reverb.pid"
        echo -e "  ${GREEN}✅ Reverb WebSocket started (PID: $reverb_pid)${NC}"
    else
        echo -e "  ${RED}❌ Reverb WebSocket failed to start${NC}"
    fi
}

start_laravel() {
    echo -e "${BLUE}🚀 Starting PitGO Laravel Services...${NC}"
    echo ""
    mkdir -p "$PID_DIR" "$LOG_DIR"
    start_php_server
    start_queue_worker
    start_reverb
    echo ""
    echo -e "${GREEN}✅ All Laravel services started!${NC}"
}

stop_process() {
    local name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  ${YELLOW}🛑 Stopping $name (PID: $pid)...${NC}"
            kill "$pid"
            sleep 1
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid"
            fi
            echo -e "  ${GREEN}✅ $name stopped${NC}"
        else
            echo -e "  ${YELLOW}⚠️  $name not running (stale PID: $pid)${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "  ${YELLOW}⏭️  $name not running (no PID file)${NC}"
    fi
}

stop_laravel() {
    echo -e "${YELLOW}🛑 Stopping PitGO Laravel Services...${NC}"
    echo ""
    stop_process "Reverb WebSocket" "$PID_DIR/reverb.pid"
    stop_process "Queue Worker" "$PID_DIR/queue.pid"
    stop_process "PHP Server" "$PID_DIR/php.pid"
    echo ""
    echo -e "${GREEN}✅ All Laravel services stopped!${NC}"
}

restart_laravel() {
    stop_laravel
    sleep 2
    start_laravel
}

status_laravel() {
    echo -e "${BLUE}📊 PitGO Laravel Services Status:${NC}"
    echo ""
    
    check_process "PHP Server" "$PID_DIR/php.pid" "8000"
    check_process "Queue Worker" "$PID_DIR/queue.pid"
    check_process "Reverb WebSocket" "$PID_DIR/reverb.pid" "6001"
}

check_process() {
    local name=$1
    local pid_file=$2
    local port=${3:-}
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            local port_info=""
            if [ -n "$port" ]; then
                port_info=" :$port"
            fi
            echo -e "  ${GREEN}✅ $name - Running (PID: $pid)$port_info${NC}"
        else
            echo -e "  ${RED}❌ $name - Dead (stale PID: $pid)${NC}"
        fi
    else
        echo -e "  ${RED}❌ $name - Not running${NC}"
    fi
}

show_laravel_logs() {
    echo -e "${BLUE}📋 Showing Laravel logs (Ctrl+C to exit)...${NC}"
    echo ""
    tail -f "$LOG_DIR"/*.log
}

# ========== CLOUDFLARE TUNNEL ==========

setup_tunnel() {
    echo -e "${BLUE}🌐 Setting up Cloudflare Tunnel for pitgo.sudoman.my.id${NC}"
    echo ""
    
    mkdir -p "$CF_CONFIG_DIR"
    
    TUNNEL_NAME="pitgo"
    DOMAIN="pitgo.sudoman.my.id"
    CREDENTIALS_FILE="$CF_CONFIG_DIR/$TUNNEL_NAME.json"
    
    if [ -f "$CREDENTIALS_FILE" ]; then
        echo -e "${YELLOW}⚠️  Tunnel credentials already exist.${NC}"
        echo "   Location: $CREDENTIALS_FILE"
        echo ""
        echo "   If you want to create a new tunnel, delete this file first."
        echo ""
        read -p "Do you want to run tunnel setup wizard again? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 0
        fi
    fi
    
    echo "Step 1: Creating/Verifying tunnel..."
    echo "   A browser will open for Cloudflare authentication."
    echo "   Please follow the prompts and select zone: sudoman.my.id"
    echo ""
    read -p "Press Enter to continue..."
    
    cloudflared tunnel create "$TUNNEL_NAME" 2>&1
    
    echo ""
    echo "Step 2: Creating config..."
    
    cat > "$CF_CONFIG_FILE" << EOF
tunnel: $TUNNEL_NAME
credentials-file: $CREDENTIALS_FILE

ingress:
  - hostname: $DOMAIN
    service: http://127.0.0.1:8000
  - service: http_status:404
EOF
    
    echo -e "${GREEN}✅ Config created at: $CF_CONFIG_FILE${NC}"
    echo ""
    echo "Step 3: Routing DNS..."
    cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"
    
    echo ""
    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo "   Your app should be accessible at: https://$DOMAIN"
    echo ""
    echo "To start the tunnel, run: $0 start-tunnel"
}

start_tunnel() {
    echo -e "${GREEN}🚀 Starting Cloudflare Tunnel...${NC}"
    
    if [ ! -f "$CF_CONFIG_FILE" ]; then
        echo -e "${RED}❌ Config file not found at: $CF_CONFIG_FILE${NC}"
        echo "   Please run setup first: $0 setup-tunnel"
        exit 1
    fi
    
    if pgrep -f "cloudflared tunnel.*run" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Tunnel is already running${NC}"
        local pid=$(pgrep -f "cloudflared tunnel.*run" | head -1)
        echo "   PID: $pid"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
    setsid cloudflared tunnel --config "$CF_CONFIG_FILE" run > "$CF_CONFIG_DIR/tunnel.log" 2>&1 &
    sleep 3
    
    tunnel_pid=$(pgrep -f "cloudflared tunnel.*run" | head -1)
    if [ -n "$tunnel_pid" ]; then
        echo "$tunnel_pid" > "$CF_CONFIG_DIR/tunnel.pid"
        echo -e "${GREEN}✅ Tunnel started (PID: $tunnel_pid)${NC}"
        echo "   Logs: $CF_CONFIG_DIR/tunnel.log"
    else
        echo -e "${RED}❌ Tunnel failed to start${NC}"
        echo "   Check logs: $CF_CONFIG_DIR/tunnel.log"
        exit 1
    fi
}

stop_tunnel() {
    echo -e "${YELLOW}🛑 Stopping Cloudflare Tunnel...${NC}"
    
    if pgrep -f "cloudflared tunnel.*run" > /dev/null 2>&1; then
        pkill -f "cloudflared tunnel.*run"
        echo -e "${GREEN}✅ Tunnel stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Tunnel not running${NC}"
    fi
    
    rm -f "$CF_CONFIG_DIR/tunnel.pid"
}

status_tunnel() {
    echo -e "${BLUE}📊 Cloudflare Tunnel Status:${NC}"
    echo ""
    
    if pgrep -f "cloudflared tunnel.*run" > /dev/null 2>&1; then
        local pid=$(pgrep -f "cloudflared tunnel.*run" | head -1)
        echo -e "  ${GREEN}✅ Tunnel - Running (PID: $pid)${NC}"
    else
        echo -e "  ${RED}❌ Tunnel - Not running${NC}"
    fi
    
    echo ""
    echo "Configuration:"
    echo "  Domain: pitgo.sudoman.my.id"
    echo "  Local URL: http://127.0.0.1:8000"
    echo "  Config: $CF_CONFIG_FILE"
}

show_tunnel_logs() {
    echo -e "${BLUE}📋 Showing Cloudflare Tunnel logs (Ctrl+C to exit)...${NC}"
    echo ""
    tail -f "$CF_CONFIG_DIR/tunnel.log"
}

# ========== MAIN ==========

case "${1:-}" in
    start)
        start_laravel
        ;;
    stop)
        stop_laravel
        ;;
    restart)
        restart_laravel
        ;;
    status)
        status_laravel
        echo ""
        status_tunnel
        ;;
    logs)
        show_laravel_logs
        ;;
    setup-tunnel)
        setup_tunnel
        ;;
    start-tunnel)
        start_tunnel
        ;;
    stop-tunnel)
        stop_tunnel
        ;;
    tunnel-logs)
        show_tunnel_logs
        ;;
    *)
        usage
        ;;
esac

#!/bin/bash

# PitGO Cloudflare Tunnel Setup Script
# This script sets up Cloudflare Tunnel for pitgo.sudoman.my.id

TUNNEL_NAME="pitgo"
DOMAIN="pitgo.sudoman.my.id"
LOCAL_URL="http://127.0.0.1:8000"
CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"
CREDENTIALS_FILE="$CONFIG_DIR/$TUNNEL_NAME.json"

usage() {
    echo "🌐 PitGO Cloudflare Tunnel Setup"
    echo ""
    echo "Usage: $0 {install|run|stop|status}"
    echo ""
    echo "Commands:"
    echo "  install  - Create and configure Cloudflare Tunnel"
    echo "  run      - Run the tunnel (foreground)"
    echo "  run-bg   - Run the tunnel in background"
    echo "  stop     - Stop the tunnel"
    echo "  status   - Show tunnel status"
    exit 1
}

install_tunnel() {
    echo "🔧 Setting up Cloudflare Tunnel for $DOMAIN"
    echo ""
    
    # Create config directory
    mkdir -p "$CONFIG_DIR"
    
    # Check if tunnel already exists
    if [ -f "$CREDENTIALS_FILE" ]; then
        echo "⚠️  Tunnel credentials already exist at: $CREDENTIALS_FILE"
        echo "   If you want to create a new tunnel, delete this file first."
        echo ""
        read -p "Do you want to continue with existing credentials? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 1
        fi
    else
        echo "Step 1: Creating tunnel..."
        echo "   A browser window will open for Cloudflare authentication."
        echo "   Please select your zone: sudoman.my.id"
        echo ""
        read -p "Press Enter to continue..."
        
        # Create tunnel
        TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1)
        echo "$TUNNEL_OUTPUT"
        
        if [ $? -ne 0 ]; then
            echo "❌ Failed to create tunnel"
            exit 1
        fi
        
        echo ""
        echo "✅ Tunnel created successfully!"
    fi
    
    echo ""
    echo "Step 2: Creating config file..."
    
    # Create config file
    cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_NAME
credentials-file: $CREDENTIALS_FILE

ingress:
  - hostname: $DOMAIN
    service: $LOCAL_URL
  - service: http_status:404
EOF
    
    echo "✅ Config created at: $CONFIG_FILE"
    echo ""
    echo "Step 3: Routing DNS..."
    echo "   Running: cloudflared tunnel route dns $TUNNEL_NAME $DOMAIN"
    cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ DNS routed successfully!"
        echo ""
        echo "🎉 Cloudflare Tunnel setup complete!"
        echo "   Your application is now accessible at: https://$DOMAIN"
        echo ""
        echo "To start the tunnel, run: $0 run-bg"
    else
        echo ""
        echo "⚠️  DNS routing command finished."
        echo "   Please verify in Cloudflare Zero Trust dashboard that the DNS route is set up."
        echo "   Go to: https://one.dash.cloudflare.com/"
        echo "   - Navigate to Networks > Tunnels"
        echo "   - Find tunnel: $TUNNEL_NAME"
        echo "   - Add a public hostname: $DOMAIN"
        echo "   - Set service to: $LOCAL_URL"
    fi
}

run_tunnel() {
    echo "🚀 Starting Cloudflare Tunnel..."
    echo "   Tunneling $DOMAIN -> $LOCAL_URL"
    echo "   Press Ctrl+C to stop"
    echo ""
    cloudflared tunnel --config "$CONFIG_FILE" run
}

run_tunnel_bg() {
    echo "🚀 Starting Cloudflare Tunnel in background..."
    
    # Check if already running
    if pgrep -f "cloudflared tunnel.*run" > /dev/null 2>&1; then
        echo "⚠️  Tunnel is already running"
        exit 1
    fi
    
    nohup cloudflared tunnel --config "$CONFIG_FILE" run > "$CONFIG_DIR/tunnel.log" 2>&1 &
    TUNNEL_PID=$!
    echo "$TUNNEL_PID" > "$CONFIG_DIR/tunnel.pid"
    
    sleep 3
    
    if kill -0 "$TUNNEL_PID" 2>/dev/null; then
        echo "✅ Tunnel started (PID: $TUNNEL_PID)"
        echo "   Logs: $CONFIG_DIR/tunnel.log"
    else
        echo "❌ Tunnel failed to start"
        echo "   Check logs: $CONFIG_DIR/tunnel.log"
        exit 1
    fi
}

stop_tunnel() {
    echo "🛑 Stopping Cloudflare Tunnel..."
    
    if [ -f "$CONFIG_DIR/tunnel.pid" ]; then
        TUNNEL_PID=$(cat "$CONFIG_DIR/tunnel.pid")
        if kill -0 "$TUNNEL_PID" 2>/dev/null; then
            kill "$TUNNEL_PID"
            echo "✅ Tunnel stopped (PID: $TUNNEL_PID)"
        else
            echo "⚠️  Tunnel not running (stale PID: $TUNNEL_PID)"
        fi
        rm -f "$CONFIG_DIR/tunnel.pid"
    else
        # Try to find and kill any cloudflared process
        if pkill -f "cloudflared tunnel" 2>/dev/null; then
            echo "✅ Tunnel process stopped"
        else
            echo "⚠️  No tunnel process found"
        fi
    fi
}

status_tunnel() {
    echo "📊 Cloudflare Tunnel Status:"
    echo ""
    
    if pgrep -f "cloudflared tunnel.*run" > /dev/null 2>&1; then
        local pid=$(pgrep -f "cloudflared tunnel.*run" | head -1)
        echo "  ✅ Tunnel - Running (PID: $pid)"
    else
        echo "  ❌ Tunnel - Not running"
    fi
    
    echo ""
    echo "Configuration:"
    echo "  Domain: $DOMAIN"
    echo "  Local URL: $LOCAL_URL"
    echo "  Config: $CONFIG_FILE"
}

# Main script logic
case "${1:-}" in
    install)
        install_tunnel
        ;;
    run)
        run_tunnel
        ;;
    run-bg)
        run_tunnel_bg
        ;;
    stop)
        stop_tunnel
        ;;
    status)
        status_tunnel
        ;;
    *)
        usage
        ;;
esac

#!/bin/bash

# PitGO Systemd Services Setup Script
# This script installs and manages PitGO systemd services

SERVICES=("pitgo-php.service" "pitgo-queue.service" "pitgo-reverb.service" "pitgo-vite.service")
SYSTEMD_DIR="/home/mannn/.config/systemd/user"
PROJECT_DIR="/home/mannn/PitGO"

usage() {
    echo "Usage: $0 {install|uninstall|start|stop|restart|status|logs}"
    echo ""
    echo "Commands:"
    echo "  install   - Install systemd services"
    echo "  uninstall - Uninstall systemd services"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show status of all services"
    echo "  logs      - Show logs from all services"
    exit 1
}

install_services() {
    echo "🔧 Installing PitGO systemd services..."
    
    # Create user systemd directory
    mkdir -p "$SYSTEMD_DIR"
    
    # Copy service files
    for service in "${SERVICES[@]}"; do
        if [ -f "$PROJECT_DIR/$service" ]; then
            cp "$PROJECT_DIR/$service" "$SYSTEMD_DIR/"
            echo "  ✓ Copied $service"
        else
            echo "  ✗ Service file $service not found"
        fi
    done
    
    # Reload systemd daemon
    systemctl --user daemon-reload
    echo ""
    echo "✅ Services installed successfully!"
    echo "   You can now start them with: $0 start"
}

uninstall_services() {
    echo "🗑️  Uninstalling PitGO systemd services..."
    
    for service in "${SERVICES[@]}"; do
        systemctl --user stop "$service" 2>/dev/null
        systemctl --user disable "$service" 2>/dev/null
        rm -f "$SYSTEMD_DIR/$service"
        echo "  ✓ Removed $service"
    done
    
    systemctl --user daemon-reload
    echo ""
    echo "✅ Services uninstalled successfully!"
}

start_services() {
    echo "🚀 Starting PitGO services..."
    
    for service in "${SERVICES[@]}"; do
        echo "  Starting $service..."
        systemctl --user start "$service"
        sleep 1
    done
    
    echo ""
    echo "✅ All services started!"
    status_services
}

stop_services() {
    echo "🛑 Stopping PitGO services..."
    
    for service in "${SERVICES[@]}"; do
        echo "  Stopping $service..."
        systemctl --user stop "$service"
    done
    
    echo ""
    echo "✅ All services stopped!"
}

restart_services() {
    stop_services
    sleep 2
    start_services
}

status_services() {
    echo "📊 PitGO Services Status:"
    echo ""
    
    for service in "${SERVICES[@]}"; do
        status=$(systemctl --user is-active "$service" 2>/dev/null)
        if [ "$status" = "active" ]; then
            echo "  ✅ $service - Running"
        else
            echo "  ❌ $service - $status"
        fi
    done
}

logs_services() {
    echo "📋 Showing recent logs (Ctrl+C to exit)..."
    journalctl --user -u "pitgo-*" -f --no-pager
}

# Main script logic
case "${1:-}" in
    install)
        install_services
        ;;
    uninstall)
        uninstall_services
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        status_services
        ;;
    logs)
        logs_services
        ;;
    *)
        usage
        ;;
esac

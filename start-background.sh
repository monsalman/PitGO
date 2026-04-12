#!/bin/bash

# PitGO Background Services Manager
# This script manages PitGO background processes using nohup

PROJECT_DIR="/home/mannn/PitGO"
PID_DIR="$PROJECT_DIR/.pids"
LOG_DIR="$PROJECT_DIR/storage/logs"

# Create directories
mkdir -p "$PID_DIR" "$LOG_DIR"

usage() {
    echo "🚀 PitGO Background Services Manager"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show status of all services"
    echo "  logs      - Show logs (tail -f)"
    exit 1
}

start_php_server() {
    if [ -f "$PID_DIR/php.pid" ] && kill -0 $(cat "$PID_DIR/php.pid") 2>/dev/null; then
        echo "  ⏭️  PHP Server already running (PID: $(cat "$PID_DIR/php.pid"))"
        return
    fi
    
    echo "  🚀 Starting PHP Server..."
    setsid /usr/bin/php artisan serve --host=127.0.0.1 --port=8000 > "$LOG_DIR/php.log" 2>&1 &
    local pid=$!
    sleep 2
    # Find the actual PHP process
    php_pid=$(pgrep -f "artisan serve.*8000" | head -1)
    if [ -n "$php_pid" ]; then
        echo "$php_pid" > "$PID_DIR/php.pid"
        echo "  ✅ PHP Server started (PID: $php_pid)"
    else
        echo "  ❌ PHP Server failed to start"
    fi
}

start_queue_worker() {
    if [ -f "$PID_DIR/queue.pid" ] && kill -0 $(cat "$PID_DIR/queue.pid") 2>/dev/null; then
        echo "  ⏭️  Queue Worker already running (PID: $(cat "$PID_DIR/queue.pid"))"
        return
    fi
    
    echo "  🚀 Starting Queue Worker..."
    setsid /usr/bin/php artisan queue:work --tries=3 --timeout=90 > "$LOG_DIR/queue.log" 2>&1 &
    sleep 2
    queue_pid=$(pgrep -f "artisan queue:work" | head -1)
    if [ -n "$queue_pid" ]; then
        echo "$queue_pid" > "$PID_DIR/queue.pid"
        echo "  ✅ Queue Worker started (PID: $queue_pid)"
    else
        echo "  ❌ Queue Worker failed to start"
    fi
}

start_reverb() {
    if [ -f "$PID_DIR/reverb.pid" ] && kill -0 $(cat "$PID_DIR/reverb.pid") 2>/dev/null; then
        echo "  ⏭️  Reverb WebSocket already running (PID: $(cat "$PID_DIR/reverb.pid"))"
        return
    fi
    
    echo "  🚀 Starting Reverb WebSocket..."
    setsid /usr/bin/php artisan reverb:start --host=127.0.0.1 --port=6001 > "$LOG_DIR/reverb.log" 2>&1 &
    sleep 2
    reverb_pid=$(pgrep -f "artisan reverb:start" | head -1)
    if [ -n "$reverb_pid" ]; then
        echo "$reverb_pid" > "$PID_DIR/reverb.pid"
        echo "  ✅ Reverb WebSocket started (PID: $reverb_pid)"
    else
        echo "  ❌ Reverb WebSocket failed to start"
    fi
}

start_all() {
    echo "🚀 Starting PitGO services..."
    echo ""
    start_php_server
    start_queue_worker
    start_reverb
    echo ""
    echo "✅ All services started!"
    echo "   Logs available in: $LOG_DIR/"
}

stop_process() {
    local name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "  🛑 Stopping $name (PID: $pid)..."
            kill "$pid"
            sleep 1
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid"
            fi
            echo "  ✅ $name stopped"
        else
            echo "  ⚠️  $name not running (stale PID: $pid)"
        fi
        rm -f "$pid_file"
    else
        echo "  ⏭️  $name not running (no PID file)"
    fi
}

stop_all() {
    echo "🛑 Stopping PitGO services..."
    echo ""
    stop_process "Reverb WebSocket" "$PID_DIR/reverb.pid"
    stop_process "Queue Worker" "$PID_DIR/queue.pid"
    stop_process "PHP Server" "$PID_DIR/php.pid"
    echo ""
    echo "✅ All services stopped!"
}

restart_all() {
    stop_all
    sleep 2
    start_all
}

status_all() {
    echo "📊 PitGO Services Status:"
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
            echo "  ✅ $name - Running (PID: $pid)$port_info"
        else
            echo "  ❌ $name - Dead (stale PID: $pid)"
        fi
    else
        echo "  ❌ $name - Not running"
    fi
}

show_logs() {
    echo "📋 Showing recent logs (Ctrl+C to exit)..."
    echo ""
    tail -f "$LOG_DIR"/*.log
}

# Main script logic
case "${1:-}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        status_all
        ;;
    logs)
        show_logs
        ;;
    *)
        usage
        ;;
esac

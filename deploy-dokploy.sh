#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the project directory
if [ ! -f "composer.json" ]; then
    log_error "Not in PitGO project directory. Please run from project root."
    exit 1
fi

# Get the command
COMMAND=${1:-help}

case $COMMAND in
    "build")
        log_info "Building Docker image for production..."
        docker build -f Dockerfile.production -t pitgo:latest .
        log_success "Docker image built successfully!"
        ;;

    "push")
        log_info "Pushing Docker image to registry..."
        if [ -z "$2" ]; then
            log_error "Please provide registry URL. Usage: ./deploy-dokploy.sh push <registry-url>"
            exit 1
        fi
        
        REGISTRY=$2
        docker tag pitgo:latest $REGISTRY/pitgo:latest
        docker push $REGISTRY/pitgo:latest
        log_success "Docker image pushed successfully!"
        ;;

    "test-build")
        log_info "Testing Docker build locally..."
        log_warning "Make sure docker daemon is running"
        docker build -f Dockerfile.production -t pitgo:test .
        log_success "Build test successful!"
        log_info "Testing image..."
        docker run --rm pitgo:test php -v
        log_success "Image test passed!"
        ;;

    "validate-env")
        log_info "Validating environment configuration..."
        
        required_vars=("APP_KEY" "DB_CONNECTION" "DB_DATABASE" "DB_USERNAME" "DB_PASSWORD")
        
        for var in "${required_vars[@]}"; do
            if ! grep -q "^${var}=" .env; then
                log_error "Missing required variable: $var"
                exit 1
            fi
        done
        
        log_success "Environment variables validated!"
        ;;

    "logs")
        log_info "Checking deployment requirements..."
        log_info "Docker version:"
        docker --version
        log_info "Docker Compose version:"
        docker-compose --version || log_warning "Docker Compose not found (optional)"
        ;;

    "init-dokploy")
        log_info "Initializing Dokploy deployment..."
        
        log_info "Creating necessary configuration files..."
        
        if [ ! -f "dokploy.yaml" ]; then
            log_warning "dokploy.yaml not found, creating from template..."
        fi
        
        if [ ! -f "Dockerfile.production" ]; then
            log_error "Dockerfile.production not found!"
            exit 1
        fi
        
        if [ ! -f "supervisord.conf" ]; then
            log_error "supervisord.conf not found!"
            exit 1
        fi
        
        if [ ! -f "nginx.conf" ]; then
            log_error "nginx.conf not found!"
            exit 1
        fi
        
        log_success "All configuration files are in place!"
        log_info ""
        log_info "Next steps:"
        log_info "1. Commit all files to Git:"
        echo "   git add dokploy.yaml Dockerfile.production supervisord.conf nginx.conf"
        echo "   git commit -m 'Add Dokploy deployment configuration'"
        log_info ""
        log_info "2. Push to your Git repository"
        log_info ""
        log_info "3. Configure in Dokploy Dashboard:"
        echo "   - Create new project: 'PitGO'"
        echo "   - Add application with Docker source"
        echo "   - Set Dockerfile to: Dockerfile.production"
        echo "   - Configure environment variables from .env"
        echo "   - Add domain: pitgo.sudoman.my.id"
        log_info ""
        log_info "4. Deploy!"
        ;;

    "help"|*)
        echo "PitGO Dokploy Deployment Helper"
        echo ""
        echo "Usage: ./deploy-dokploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build              Build Docker image locally"
        echo "  push <registry>    Push image to registry (e.g., docker.io/username)"
        echo "  test-build         Test Docker build locally"
        echo "  validate-env       Validate .env configuration"
        echo "  logs               Show system information"
        echo "  init-dokploy       Initialize Dokploy deployment setup"
        echo "  help               Show this help message"
        echo ""
        echo "Example workflow:"
        echo "  1. ./deploy-dokploy.sh validate-env"
        echo "  2. ./deploy-dokploy.sh test-build"
        echo "  3. ./deploy-dokploy.sh init-dokploy"
        echo "  4. Commit and push to Git"
        echo "  5. Deploy via Dokploy Dashboard"
        echo ""
        ;;
esac

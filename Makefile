.PHONY: all build server daemon api clean run build-web help

# Default target
all: build

# Build all binaries
build: server daemon api
	@echo "✓ All binaries built successfully"

# Build the all-in-one server (daemon + API + web)
server:
	@echo "Building bocrate-server..."
	@go build -o bocrate-server ./cmd/bocrate-server

# Build daemon only
daemon:
	@echo "Building bocrate-daemon..."
	@go build -o bocrate-daemon ./cmd/bocrate-daemon

# Build API server only
api:
	@echo "Building bocrate-api..."
	@go build -o bocrate-api ./cmd/bocrate-api

# Build web frontend
build-web:
	@echo "Building web frontend..."
	@cd bocrate-web && pnpm build

# Run the all-in-one server (recommended)
run:
	@echo "Starting BOC Exchange Rate Service..."
	@./start.sh

# Clean built binaries
clean:
	@echo "Cleaning build artifacts..."
	@rm -f bocrate-server bocrate-daemon bocrate-api
	@rm -f bocrate.db
	@echo "✓ Cleaned"

# Help
help:
	@echo "BOC Exchange Rate Service - Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make build      - Build all binaries"
	@echo "  make server     - Build all-in-one server (daemon + API + web)"
	@echo "  make daemon     - Build daemon only"
	@echo "  make api        - Build API server only"
	@echo "  make build-web  - Build web frontend"
	@echo "  make run        - Run the all-in-one server"
	@echo "  make clean      - Remove built binaries and database"
	@echo "  make help       - Show this help message"
	@echo ""
	@echo "Quick start:"
	@echo "  make build && ./bocrate-server"
	@echo "  or simply: ./start.sh"

# Stage 1: Build Frontend
FROM node:20-alpine AS web-builder
WORKDIR /app/web
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY bocrate-web/package.json bocrate-web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY bocrate-web/ .
RUN pnpm build

# Stage 2: Build Backend
FROM golang:1.23-alpine AS go-builder
WORKDIR /app/server
RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 go build -ldflags="-s -w" -o bocrate-server ./cmd/bocrate-server

# Stage 3: Final Image
FROM alpine:latest
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata sqlite

# Copy binary
COPY --from=go-builder /app/server/bocrate-server .

# Copy static files
COPY --from=web-builder /app/web/out ./static

# Create data directory
RUN mkdir -p /data

# Expose port
EXPOSE 8080

# Run the server
CMD ["./bocrate-server", "-db", "/data/bocrate.db", "-static", "./static", "-addr", ":8080"]

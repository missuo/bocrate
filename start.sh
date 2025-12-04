#!/bin/bash

# BOC Exchange Rate Service Startup Script
# This script starts both the scheduler (daemon) and API server

cd "$(dirname "$0")"
exec go run ./cmd/bocrate-server/main.go -static ./bocrate-web/out "$@"

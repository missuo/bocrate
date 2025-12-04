# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**bocrate** is a Go library for scraping Bank of China (BOC) exchange rates. It provides a simple API for fetching current exchange rates for 27 major currencies.

## Technology Stack

- **Language**: Go (Golang)
- **Dependencies**:
  - `golang.org/x/net/html` - HTML parsing
  - `github.com/mattn/go-sqlite3` - SQLite database driver
  - `github.com/robfig/cron/v3` - Cron scheduler for automated tasks
  - `github.com/gin-gonic/gin` - HTTP web framework for REST API
  - Standard library for HTTP requests and concurrency

## Project Structure

```
bocrate/
├── scraper.go              # Core scraping logic and public APIs
├── database.go             # SQLite database operations
├── scheduler.go            # Cron scheduler for automated fetching
├── api.go                  # REST API server with Gin
├── cmd/
│   ├── bocrate-daemon/
│   │   └── main.go        # Daemon process for automated fetching
│   └── bocrate-api/
│       └── main.go        # API server executable
├── example/
│   └── main.go            # Usage examples
├── go.mod                 # Go module definition
├── go.sum                 # Dependency checksums
├── README.md              # User documentation
└── CLAUDE.md              # This file
```

## Key Files

- **scraper.go**: Core scraping functionality
  - `CurrencyDict`: Map of currency codes to Chinese names
  - `ExchangeRateData`: Data structure for exchange rate information
  - `GetExchangeRate(currencyCode string)`: Fetch rates for a specific currency
  - `GetAllExchangeRates()`: Fetch rates for all currencies concurrently
  - `getPageData()`: Internal function to scrape a single page

- **database.go**: SQLite database operations
  - `Database`: Database connection wrapper
  - `NewDatabase(dbPath string)`: Create new database connection
  - `SaveExchangeRates()`: Save multiple rate records
  - `GetLatestRates()`: Query latest rates for a currency
  - `GetAllLatestRates()`: Get most recent rate for all currencies
  - `GetRatesByDateRange()`: Query rates within a date range

- **scheduler.go**: Automated task scheduling
  - `Scheduler`: Cron job manager
  - `Start()`: Start hourly rate fetching
  - `Stop()`: Stop the scheduler
  - `RunOnce()`: Fetch and save rates one time

- **api.go**: REST API server
  - `APIServer`: API server struct with Gin router
  - `NewAPIServer()`: Create new API server instance
  - `SetupRoutes()`: Configure API routes and static file serving
  - API endpoints: `/api/latest`, `/api/latest/:currency`, `/api/rates/:currency`, `/api/currencies`
  - Root path `/` reserved for static files

- **cmd/bocrate-daemon/main.go**: Daemon executable
  - Command-line flags: `-db` (database path), `-once` (run once mode)
  - Handles graceful shutdown on SIGTERM/SIGINT

- **cmd/bocrate-api/main.go**: API server executable
  - Command-line flags: `-db` (database path), `-addr` (listen address), `-static` (static files directory)
  - Serves REST API and optionally static files

## Development Commands

### Install Dependencies
```bash
go mod tidy
```

### Run Scraper Example
```bash
cd example
go run main.go
```

### Build and Run Daemon
```bash
# Build the daemon
go build -o bocrate-daemon ./cmd/bocrate-daemon

# Run daemon (starts cron scheduler)
./bocrate-daemon

# Run once without scheduler (for testing)
./bocrate-daemon -once

# Use custom database path
./bocrate-daemon -db /path/to/custom.db
```

### Build and Run API Server
```bash
# Build the API server
go build -o bocrate-api ./cmd/bocrate-api

# Run API server (default: :8080, bocrate.db)
./bocrate-api

# Custom port and database
./bocrate-api -addr :3000 -db /path/to/bocrate.db

# Serve static files from root
./bocrate-api -static /path/to/public
```

### Test the Library
```bash
go test -v
```

### Format Code
```bash
go fmt ./...
```

## Architecture

### Data Flow

1. **User calls API** → `GetExchangeRate()` or `GetAllExchangeRates()`
2. **HTTP requests** → Fetch 5 pages from BOC website (index.html and index_1.html through index_4.html)
3. **HTML parsing** → Extract table rows using `golang.org/x/net/html`
4. **Data extraction** → Parse 7 columns per row (currency name, rates, release time)
5. **Return results** → Structured as `[]ExchangeRateData`

### Concurrency

- `GetAllExchangeRates()` uses goroutines to fetch all currencies in parallel
- Each currency spawns its own goroutine
- Results are collected using sync.Mutex to avoid race conditions

### Data Source

- Website: https://www.boc.cn/sourcedb/whpj/
- Pages scraped: index.html, index_1.html, index_2.html, index_3.html, index_4.html
- Data format: HTML table with align="left" attribute

## Supported Currencies

The library supports 27 currencies defined in `CurrencyDict`:
AED, AUD, BRL, CAD, CHF, DKK, EUR, GBP, HKD, IDR, INR, JPY, KRW, MOP, MYR, NOK, NZD, PHP, RUB, SAR, SEK, SGD, THB, TRY, TWD, USD, ZAR

## API Usage as a Library

This package is designed to be imported into other Go projects:

```go
import "github.com/missuo/bocrate"

// Get specific currency
data, err := bocrate.GetExchangeRate("USD")

// Get all currencies
allData, err := bocrate.GetAllExchangeRates()
```

## Database

### Schema

The SQLite database stores exchange rates with the following schema:
- **Table**: `exchange_rates`
- **Columns**: currency_code, currency_name, foreign_exchange_buying_rate, cash_buying_rate, foreign_exchange_selling_rate, cash_selling_rate, boc_conversion_rate, release_time, created_at
- **Indexes**: On currency_code, release_time, and created_at
- **Unique Constraint**: (currency_code, release_time) to prevent duplicates

### Scheduler

- Runs every hour (cron: `0 * * * *`)
- Fetches all 27 currencies concurrently
- Stores ~135 records per run (5 historical records per currency)
- Uses `INSERT OR IGNORE` to avoid duplicate entries

## API Server

### Endpoints

All API endpoints return JSON with this format:
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

- `GET /api/latest` - Get latest rates for all currencies
- `GET /api/latest/:currency` - Get latest rate for one currency
- `GET /api/rates/:currency?days=N` - Get daily rates (one per day, default 30 days)
- `GET /api/currencies` - List all supported currencies
- `GET /` - Serve static files (if configured) or API info

### Static Files

The root path `/` is reserved for static file serving. Use the `-static` flag to specify a directory. All API endpoints are namespaced under `/api/` to avoid conflicts.

## Future Enhancements (Not Implemented Yet)

- Rate limiting for API and scraping
- Error retry logic with exponential backoff
- Unit tests and integration tests
- Metrics and monitoring
- WebSocket support for real-time updates

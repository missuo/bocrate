# bocrate

A Go library for scraping Bank of China (BOC) exchange rates.

## Features

- Fetch exchange rates for specific currencies
- Fetch exchange rates for all supported currencies
- Support for 27 major currencies
- Concurrent fetching for better performance
- Automated hourly rate fetching with cron scheduler
- SQLite database storage with historical data support
- REST API with Gin framework for easy integration
- Static file serving support

## Installation

```bash
go get github.com/missuo/bocrate
```

## Supported Currencies

AED, AUD, BRL, CAD, CHF, DKK, EUR, GBP, HKD, IDR, INR, JPY, KRW, MOP, MYR, NOK, NZD, PHP, RUB, SAR, SEK, SGD, THB, TRY, TWD, USD, ZAR

## Quick Start (All-in-One Server)

The easiest way to run the complete BOC exchange rate service (daemon + API + web interface):

```bash
# Using the convenience script
./start.sh

# Or directly
cd cmd/bocrate-server && go run main.go

# Build and run
go build -o bocrate-server ./cmd/bocrate-server
./bocrate-server
```

This starts:
- Automated hourly exchange rate fetching (scheduler/daemon)
- REST API server on port 8080
- Static web interface at http://localhost:8080

**Command-line options:**
```bash
./bocrate-server -db ./bocrate.db -addr :8080 -static ../../bocrate-web/out
```

- `-db` - Database file path (default: `bocrate.db`)
- `-addr` - Server listen address (default: `:8080`)
- `-static` - Static files directory (default: `../../bocrate-web/out`)

## Usage

### Get Exchange Rate for a Specific Currency

```go
package main

import (
    "fmt"
    "log"

    "github.com/missuo/bocrate"
)

func main() {
    // Get USD exchange rate
    data, err := bocrate.GetExchangeRate("USD")
    if err != nil {
        log.Fatal(err)
    }

    for _, rate := range data {
        fmt.Printf("Currency: %s\n", rate.CurrencyName)
        fmt.Printf("Foreign Exchange Buying Rate: %s\n", rate.ForeignExchangeBuyingRate)
        fmt.Printf("Cash Buying Rate: %s\n", rate.CashBuyingRate)
        fmt.Printf("Foreign Exchange Selling Rate: %s\n", rate.ForeignExchangeSellingRate)
        fmt.Printf("Cash Selling Rate: %s\n", rate.CashSellingRate)
        fmt.Printf("BOC Conversion Rate: %s\n", rate.BOCConversionRate)
        fmt.Printf("Release Time: %s\n", rate.ReleaseTime)
        fmt.Println("---")
    }
}
```

### Get Exchange Rates for All Currencies

```go
package main

import (
    "fmt"
    "log"

    "github.com/missuo/bocrate"
)

func main() {
    // Get all exchange rates (concurrent fetching)
    allRates, err := bocrate.GetAllExchangeRates()
    if err != nil {
        log.Printf("Warning: %v", err)
    }

    for currency, rates := range allRates {
        fmt.Printf("%s: %d records\n", currency, len(rates))
        if len(rates) > 0 {
            fmt.Printf("  Latest rate: %s (released at %s)\n",
                rates[0].BOCConversionRate,
                rates[0].ReleaseTime)
        }
    }
}
```

## Data Structure

```go
type ExchangeRateData struct {
    CurrencyName                string `json:"currency_name"`
    ForeignExchangeBuyingRate   string `json:"foreign_exchange_buying_rate"`   // 现汇买入价
    CashBuyingRate              string `json:"cash_buying_rate"`              // 现钞买入价
    ForeignExchangeSellingRate  string `json:"foreign_exchange_selling_rate"`  // 现汇卖出价
    CashSellingRate             string `json:"cash_selling_rate"`             // 现钞卖出价
    BOCConversionRate           string `json:"boc_conversion_rate"`           // 中行折算价
    ReleaseTime                 string `json:"release_time"`                 // 发布时间
}
```

## Daemon Mode (Automated Fetching)

The `bocrate-daemon` runs in the background and automatically fetches exchange rates every hour, storing them in a SQLite database.

### Run the Daemon

```bash
# Build the daemon
go build -o bocrate-daemon ./cmd/bocrate-daemon

# Run with default settings (bocrate.db in current directory)
./bocrate-daemon

# Specify custom database path
./bocrate-daemon -db /path/to/custom.db

# Run once without scheduler (useful for testing)
./bocrate-daemon -once
```

### Database Operations

```go
package main

import (
    "log"
    "time"

    "github.com/missuo/bocrate"
)

func main() {
    // Open database connection
    db, err := bocrate.NewDatabase("bocrate.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Get latest rates for USD
    rates, err := db.GetLatestRates("USD", 10)
    if err != nil {
        log.Fatal(err)
    }

    // Get all latest rates
    allLatest, err := db.GetAllLatestRates()
    if err != nil {
        log.Fatal(err)
    }

    // Get rates by date range
    startDate := time.Now().Add(-24 * time.Hour)
    endDate := time.Now()
    historicalRates, err := db.GetRatesByDateRange("EUR", startDate, endDate)
    if err != nil {
        log.Fatal(err)
    }
}
```

## API Server

The `bocrate-api` provides a REST API to query exchange rate data from the database.

### Run the API Server

```bash
# Build the API server
go build -o bocrate-api ./cmd/bocrate-api

# Run with default settings (port 8080, bocrate.db in current directory)
./bocrate-api

# Specify custom database and port
./bocrate-api -db /path/to/bocrate.db -addr :3000

# Serve static files from root path
./bocrate-api -static /path/to/static/files
```

### API Endpoints

#### GET /api/latest
Get the latest exchange rates for all currencies.

**Example:**
```bash
curl http://localhost:8080/api/latest
```

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "currencies": {
      "USD": {
        "currency_name": "USD",
        "foreign_exchange_buying_rate": "706.03",
        "cash_buying_rate": "706.03",
        "foreign_exchange_selling_rate": "709",
        "cash_selling_rate": "709",
        "boc_conversion_rate": "707.33",
        "release_time": "2025/12/05 01:26:45"
      }
    },
    "count": 27
  }
}
```

#### GET /api/latest/:currency
Get the latest exchange rate for a specific currency.

**Example:**
```bash
curl http://localhost:8080/api/latest/USD
```

#### GET /api/rates/:currency?days=N
Get daily exchange rates for a specific currency (one rate per day).

**Parameters:**
- `days` - Number of days to retrieve (default: 30, max: 365)

**Example:**
```bash
curl http://localhost:8080/api/rates/USD?days=7
```

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "currency": "USD",
    "rates": [
      {
        "currency_name": "USD",
        "foreign_exchange_buying_rate": "706.03",
        "cash_buying_rate": "706.03",
        "foreign_exchange_selling_rate": "709",
        "cash_selling_rate": "709",
        "boc_conversion_rate": "707.33",
        "release_time": "2025/12/05 01:26:45"
      }
    ],
    "count": 1
  }
}
```

#### GET /api/currencies
Get all supported currencies.

**Example:**
```bash
curl http://localhost:8080/api/currencies
```

### Static Files

The root path `/` is reserved for serving static files. Use the `-static` flag to specify a directory:

```bash
./bocrate-api -static ./public
```

All API endpoints are under `/api/*` to avoid conflicts with static files.

## Example

Run the scraper example:

```bash
cd example
go run main.go
```

## Web Frontend

A modern web interface for viewing exchange rates is available in `bocrate-web/`.

### Features

- Real-time exchange rates viewer
- Search and filter currencies
- Complete API documentation
- Responsive design with Tailwind CSS
- Static export support

### Quick Start

```bash
cd bocrate-web

# Install dependencies
pnpm install

# Development
pnpm dev

# Build for production
pnpm build
```

### Deployment

Serve the static export with the API server:

```bash
# Build frontend
cd bocrate-web && pnpm build && cd ..

# Serve with API (copy out to public folder first)
./bocrate-api -static ./bocrate-web/out
```

Visit `http://localhost:8080` to view the web interface.

See [bocrate-web/README.md](bocrate-web/README.md) for detailed documentation.

## Database Schema

```sql
CREATE TABLE exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency_code VARCHAR(10) NOT NULL,
    currency_name VARCHAR(50) NOT NULL,
    foreign_exchange_buying_rate VARCHAR(20),
    cash_buying_rate VARCHAR(20),
    foreign_exchange_selling_rate VARCHAR(20),
    cash_selling_rate VARCHAR(20),
    boc_conversion_rate VARCHAR(20),
    release_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(currency_code, release_time)
);
```

## License

MIT

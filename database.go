package bocrate

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// Database represents the SQLite database connection
type Database struct {
	db *sql.DB
}

// NewDatabase creates a new database connection
func NewDatabase(dbPath string) (*Database, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	database := &Database{db: db}

	// Initialize tables
	if err := database.InitTables(); err != nil {
		return nil, fmt.Errorf("failed to initialize tables: %w", err)
	}

	return database, nil
}

// InitTables creates the necessary database tables
func (d *Database) InitTables() error {
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS exchange_rates (
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

	CREATE INDEX IF NOT EXISTS idx_currency_code ON exchange_rates(currency_code);
	CREATE INDEX IF NOT EXISTS idx_release_time ON exchange_rates(release_time);
	CREATE INDEX IF NOT EXISTS idx_created_at ON exchange_rates(created_at);
	`

	_, err := d.db.Exec(createTableSQL)
	return err
}

// SaveExchangeRate saves a single exchange rate record to the database
func (d *Database) SaveExchangeRate(data ExchangeRateData) error {
	insertSQL := `
	INSERT OR IGNORE INTO exchange_rates (
		currency_code,
		currency_name,
		foreign_exchange_buying_rate,
		cash_buying_rate,
		foreign_exchange_selling_rate,
		cash_selling_rate,
		boc_conversion_rate,
		release_time
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := d.db.Exec(
		insertSQL,
		data.CurrencyName,
		CurrencyDict[data.CurrencyName],
		data.ForeignExchangeBuyingRate,
		data.CashBuyingRate,
		data.ForeignExchangeSellingRate,
		data.CashSellingRate,
		data.BOCConversionRate,
		data.ReleaseTime,
	)

	return err
}

// SaveExchangeRates saves multiple exchange rate records to the database
func (d *Database) SaveExchangeRates(data []ExchangeRateData) error {
	tx, err := d.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT OR IGNORE INTO exchange_rates (
			currency_code,
			currency_name,
			foreign_exchange_buying_rate,
			cash_buying_rate,
			foreign_exchange_selling_rate,
			cash_selling_rate,
			boc_conversion_rate,
			release_time
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, rate := range data {
		_, err := stmt.Exec(
			rate.CurrencyName,
			CurrencyDict[rate.CurrencyName],
			rate.ForeignExchangeBuyingRate,
			rate.CashBuyingRate,
			rate.ForeignExchangeSellingRate,
			rate.CashSellingRate,
			rate.BOCConversionRate,
			rate.ReleaseTime,
		)
		if err != nil {
			return fmt.Errorf("failed to insert rate for %s: %w", rate.CurrencyName, err)
		}
	}

	return tx.Commit()
}

// GetLatestRates retrieves the latest exchange rates for a specific currency
func (d *Database) GetLatestRates(currencyCode string, limit int) ([]ExchangeRateData, error) {
	query := `
		SELECT
			currency_code,
			foreign_exchange_buying_rate,
			cash_buying_rate,
			foreign_exchange_selling_rate,
			cash_selling_rate,
			boc_conversion_rate,
			release_time
		FROM exchange_rates
		WHERE currency_code = ?
		ORDER BY release_time DESC
		LIMIT ?
	`

	rows, err := d.db.Query(query, currencyCode, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rates []ExchangeRateData
	for rows.Next() {
		var rate ExchangeRateData
		err := rows.Scan(
			&rate.CurrencyName,
			&rate.ForeignExchangeBuyingRate,
			&rate.CashBuyingRate,
			&rate.ForeignExchangeSellingRate,
			&rate.CashSellingRate,
			&rate.BOCConversionRate,
			&rate.ReleaseTime,
		)
		if err != nil {
			return nil, err
		}
		rates = append(rates, rate)
	}

	return rates, rows.Err()
}

// GetAllLatestRates retrieves the most recent rate for all currencies
func (d *Database) GetAllLatestRates() (map[string]ExchangeRateData, error) {
	query := `
		SELECT
			currency_code,
			foreign_exchange_buying_rate,
			cash_buying_rate,
			foreign_exchange_selling_rate,
			cash_selling_rate,
			boc_conversion_rate,
			release_time
		FROM exchange_rates
		WHERE (currency_code, release_time) IN (
			SELECT currency_code, MAX(release_time)
			FROM exchange_rates
			GROUP BY currency_code
		)
	`

	rows, err := d.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rates := make(map[string]ExchangeRateData)
	for rows.Next() {
		var rate ExchangeRateData
		err := rows.Scan(
			&rate.CurrencyName,
			&rate.ForeignExchangeBuyingRate,
			&rate.CashBuyingRate,
			&rate.ForeignExchangeSellingRate,
			&rate.CashSellingRate,
			&rate.BOCConversionRate,
			&rate.ReleaseTime,
		)
		if err != nil {
			return nil, err
		}
		rates[rate.CurrencyName] = rate
	}

	return rates, rows.Err()
}

// GetRatesByDateRange retrieves exchange rates within a date range
func (d *Database) GetRatesByDateRange(currencyCode string, startDate, endDate time.Time) ([]ExchangeRateData, error) {
	query := `
		SELECT
			currency_code,
			foreign_exchange_buying_rate,
			cash_buying_rate,
			foreign_exchange_selling_rate,
			cash_selling_rate,
			boc_conversion_rate,
			release_time
		FROM exchange_rates
		WHERE currency_code = ?
		AND release_time BETWEEN ? AND ?
		ORDER BY release_time DESC
	`

	rows, err := d.db.Query(query, currencyCode, startDate.Format("2006-01-02 15:04:05"), endDate.Format("2006-01-02 15:04:05"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rates []ExchangeRateData
	for rows.Next() {
		var rate ExchangeRateData
		err := rows.Scan(
			&rate.CurrencyName,
			&rate.ForeignExchangeBuyingRate,
			&rate.CashBuyingRate,
			&rate.ForeignExchangeSellingRate,
			&rate.CashSellingRate,
			&rate.BOCConversionRate,
			&rate.ReleaseTime,
		)
		if err != nil {
			return nil, err
		}
		rates = append(rates, rate)
	}

	return rates, rows.Err()
}

// GetDailyRates retrieves one rate per day for a specific currency
// For today, returns the latest rate. For previous days, returns one rate per day.
func (d *Database) GetDailyRates(currencyCode string, days int) ([]ExchangeRateData, error) {
	query := `
		WITH daily_rates AS (
			SELECT
				currency_code,
				foreign_exchange_buying_rate,
				cash_buying_rate,
				foreign_exchange_selling_rate,
				cash_selling_rate,
				boc_conversion_rate,
				release_time,
				SUBSTR(release_time, 1, 10) as rate_date,
				ROW_NUMBER() OVER (PARTITION BY SUBSTR(release_time, 1, 10) ORDER BY release_time DESC) as rn
			FROM exchange_rates
			WHERE currency_code = ?
			AND DATETIME(REPLACE(release_time, '/', '-')) >= DATETIME('now', '-' || ? || ' days')
		)
		SELECT
			currency_code,
			foreign_exchange_buying_rate,
			cash_buying_rate,
			foreign_exchange_selling_rate,
			cash_selling_rate,
			boc_conversion_rate,
			release_time
		FROM daily_rates
		WHERE rn = 1
		ORDER BY release_time DESC
	`

	rows, err := d.db.Query(query, currencyCode, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rates []ExchangeRateData
	for rows.Next() {
		var rate ExchangeRateData
		err := rows.Scan(
			&rate.CurrencyName,
			&rate.ForeignExchangeBuyingRate,
			&rate.CashBuyingRate,
			&rate.ForeignExchangeSellingRate,
			&rate.CashSellingRate,
			&rate.BOCConversionRate,
			&rate.ReleaseTime,
		)
		if err != nil {
			return nil, err
		}
		rates = append(rates, rate)
	}

	return rates, rows.Err()
}

// GetHistoryRates retrieves all historical rates for a specific currency
func (d *Database) GetHistoryRates(currencyCode string, limit int) ([]ExchangeRateData, error) {
	query := `
		SELECT
			currency_code,
			foreign_exchange_buying_rate,
			cash_buying_rate,
			foreign_exchange_selling_rate,
			cash_selling_rate,
			boc_conversion_rate,
			release_time
		FROM exchange_rates
		WHERE currency_code = ?
		ORDER BY release_time DESC
		LIMIT ?
	`

	rows, err := d.db.Query(query, currencyCode, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rates []ExchangeRateData
	for rows.Next() {
		var rate ExchangeRateData
		err := rows.Scan(
			&rate.CurrencyName,
			&rate.ForeignExchangeBuyingRate,
			&rate.CashBuyingRate,
			&rate.ForeignExchangeSellingRate,
			&rate.CashSellingRate,
			&rate.BOCConversionRate,
			&rate.ReleaseTime,
		)
		if err != nil {
			return nil, err
		}
		rates = append(rates, rate)
	}

	return rates, rows.Err()
}

// GetAllCurrenciesLatest retrieves the latest rate for all currencies
func (d *Database) GetAllCurrenciesLatest() (map[string]ExchangeRateData, error) {
	return d.GetAllLatestRates()
}

// Close closes the database connection
func (d *Database) Close() error {
	return d.db.Close()
}

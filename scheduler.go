package bocrate

import (
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

// Scheduler manages the cron job for fetching exchange rates
type Scheduler struct {
	cron     *cron.Cron
	database *Database
}

// NewScheduler creates a new scheduler instance
func NewScheduler(database *Database) *Scheduler {
	return &Scheduler{
		cron:     cron.New(),
		database: database,
	}
}

// Start starts the scheduler with hourly rate fetching
func (s *Scheduler) Start() error {
	// Run immediately on start
	log.Println("Running initial exchange rate fetch...")
	if err := s.fetchAndSaveRates(); err != nil {
		log.Printf("Warning: Initial fetch failed: %v", err)
	}

	return s.StartCron()
}

// StartCron starts the cron scheduler without initial fetch
func (s *Scheduler) StartCron() error {
	// Schedule to run every hour at minute 0
	_, err := s.cron.AddFunc("0 * * * *", func() {
		log.Println("Starting scheduled exchange rate fetch...")
		if err := s.fetchAndSaveRates(); err != nil {
			log.Printf("Error fetching rates: %v", err)
		}
	})
	if err != nil {
		return err
	}

	s.cron.Start()
	log.Println("Scheduler started. Will fetch rates every hour.")
	return nil
}

// fetchAndSaveRates fetches all exchange rates and saves them to the database
func (s *Scheduler) fetchAndSaveRates() error {
	startTime := time.Now()
	log.Println("Fetching exchange rates for all currencies...")

	// Fetch all rates
	allRates, err := GetAllExchangeRates()
	if err != nil {
		return err
	}

	// Flatten the map into a slice
	var rates []ExchangeRateData
	for _, currencyRates := range allRates {
		rates = append(rates, currencyRates...)
	}

	// Save to database
	if err := s.database.SaveExchangeRates(rates); err != nil {
		return err
	}

	duration := time.Since(startTime)
	log.Printf("Successfully fetched and saved %d records in %v", len(rates), duration)
	return nil
}

// Stop stops the scheduler
func (s *Scheduler) Stop() {
	s.cron.Stop()
	log.Println("Scheduler stopped.")
}

// RunOnce fetches and saves rates once without starting the scheduler
func (s *Scheduler) RunOnce() error {
	return s.fetchAndSaveRates()
}

package main

import (
	"log"
	"os"

	"github.com/missuo/bocrate"
)

func main() {
	// Remove existing db to start fresh
	os.Remove("bocrate.db")

	db, err := bocrate.NewDatabase("bocrate.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Fetch rates
	log.Println("Fetching rates...")
	rates, err := bocrate.GetAllExchangeRates()
	if err != nil {
		log.Fatal(err)
	}

	// Flatten
	var flatRates []bocrate.ExchangeRateData
	for _, r := range rates {
		flatRates = append(flatRates, r...)
	}

	// Save
	if err := db.SaveExchangeRates(flatRates); err != nil {
		log.Fatal(err)
	}

	// Check format
	latest, err := db.GetLatestRates("USD", 1)
	if err != nil {
		log.Fatal(err)
	}

	if len(latest) > 0 {
		log.Printf("Latest USD Rate ReleaseTime: %q", latest[0].ReleaseTime)
	} else {
		log.Println("No USD rates found")
	}
}

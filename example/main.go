package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/missuo/bocrate"
)

func main() {
	// Example 1: Get exchange rate for a specific currency (USD)
	fmt.Println("=== Example 1: Get USD Exchange Rate ===")
	usdData, err := bocrate.GetExchangeRate("USD")
	if err != nil {
		log.Fatalf("Error fetching USD rate: %v", err)
	}

	usdJSON, _ := json.MarshalIndent(usdData, "", "  ")
	fmt.Printf("USD Exchange Rate:\n%s\n\n", usdJSON)

	// Example 2: Get exchange rate for another currency (EUR)
	fmt.Println("=== Example 2: Get EUR Exchange Rate ===")
	eurData, err := bocrate.GetExchangeRate("EUR")
	if err != nil {
		log.Fatalf("Error fetching EUR rate: %v", err)
	}

	if len(eurData) > 0 {
		fmt.Printf("Latest EUR rate: %+v\n\n", eurData[0])
	}

	// Example 3: Get all exchange rates (warning: this will take longer)
	fmt.Println("=== Example 3: Get All Exchange Rates ===")
	fmt.Println("Fetching all currency rates... (this may take a while)")
	allData, err := bocrate.GetAllExchangeRates()
	if err != nil {
		log.Printf("Warning: Error fetching some rates: %v", err)
	}

	fmt.Printf("Successfully fetched rates for %d currencies:\n", len(allData))
	for currency, data := range allData {
		fmt.Printf("- %s: %d records\n", currency, len(data))
	}
}

package main

import (
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/missuo/bocrate"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	// Command line flags
	dbPath := flag.String("db", "bocrate.db", "Path to SQLite database file")
	addr := flag.String("addr", ":8080", "Server listen address")
	staticPath := flag.String("static", "../../bocrate-web/out", "Path to static files directory")
	flag.Parse()

	log.Println("Starting BOC Exchange Rate Service...")
	log.Printf("Database: %s", *dbPath)
	log.Printf("Listen address: %s", *addr)
	log.Printf("Static files: %s", *staticPath)

	// Initialize database
	db, err := bocrate.NewDatabase(*dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Start scheduler (daemon)
	scheduler := bocrate.NewScheduler(db)

	// Perform initial fetch
	log.Println("Performing initial data fetch...")
	if err := scheduler.RunOnce(); err != nil {
		log.Fatalf("Failed to perform initial fetch: %v", err)
	}
	log.Println("Initial data fetch successful.")

	// Start cron scheduler
	if err := scheduler.StartCron(); err != nil {
		log.Fatalf("Failed to start scheduler: %v", err)
	}
	log.Println("Scheduler started (runs hourly at minute 0)")

	// Setup graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start API server in a goroutine
	apiServer := bocrate.NewAPIServer(db)
	apiServer.SetupRoutes(*staticPath)

	// Handle shutdown
	go func() {
		<-quit
		log.Println("\nShutting down gracefully...")
		scheduler.Stop()
		os.Exit(0)
	}()

	// Run API server (blocking)
	log.Printf("API server started at http://localhost%s", *addr)
	log.Println("Press Ctrl+C to stop")
	if err := apiServer.Run(*addr); err != nil {
		log.Fatalf("Failed to start API server: %v", err)
	}
}

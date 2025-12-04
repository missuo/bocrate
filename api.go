package bocrate

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// APIServer represents the HTTP API server
type APIServer struct {
	db     *Database
	router *gin.Engine
}

// NewAPIServer creates a new API server instance
func NewAPIServer(db *Database) *APIServer {
	return &APIServer{
		db:     db,
		router: gin.Default(),
	}
}

// SetupRoutes configures all API routes
func (s *APIServer) SetupRoutes(staticPath string) {
	// API routes
	api := s.router.Group("/api")
	{
		// Get latest rates for all currencies
		api.GET("/latest", s.handleGetAllLatest)

		// Get latest rate for a specific currency
		api.GET("/latest/:currency", s.handleGetLatest)

		// Get daily rates for a specific currency
		api.GET("/rates/:currency", s.handleGetDailyRates)

		// Get all currencies info
		api.GET("/currencies", s.handleGetCurrencies)

		// Get historical rates for a specific currency
		api.GET("/history/:currency", s.handleGetHistory)
	}

	// Serve static files from root
	if staticPath != "" {
		// Use NoRoute to serve static files without conflicting with API routes
		s.router.NoRoute(gin.WrapH(http.FileServer(http.Dir(staticPath))))
	} else {
		// Default handler for root
		s.router.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "BOC Exchange Rate API",
				"version": "1.0.0",
				"endpoints": gin.H{
					"latest_all":  "/api/latest",
					"latest_one":  "/api/latest/:currency",
					"daily_rates": "/api/rates/:currency?days=30",

					"history":    "/api/history/:currency?limit=1000",
					"currencies": "/api/currencies",
				},
			})
		})
	}
}

// Response structures
type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type LatestRatesResponse struct {
	Currencies map[string]ExchangeRateData `json:"currencies"`
	Count      int                         `json:"count"`
}

type DailyRatesResponse struct {
	Currency string             `json:"currency"`
	Rates    []ExchangeRateData `json:"rates"`
	Count    int                `json:"count"`
}

type CurrenciesResponse struct {
	Currencies map[string]string `json:"currencies"`
	Count      int               `json:"count"`
}

type HistoryRatesResponse struct {
	Currency string             `json:"currency"`
	Rates    []ExchangeRateData `json:"rates"`
	Count    int                `json:"count"`
}

// handleGetAllLatest handles GET /api/latest
func (s *APIServer) handleGetAllLatest(c *gin.Context) {
	rates, err := s.db.GetAllCurrenciesLatest()
	if err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to fetch latest rates",
			Data:    nil,
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "success",
		Data: LatestRatesResponse{
			Currencies: rates,
			Count:      len(rates),
		},
	})
}

// handleGetLatest handles GET /api/latest/:currency
func (s *APIServer) handleGetLatest(c *gin.Context) {
	currency := strings.ToUpper(c.Param("currency"))

	// Validate currency code
	if _, ok := CurrencyDict[currency]; !ok {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid currency code",
			Data:    nil,
		})
		return
	}

	rates, err := s.db.GetLatestRates(currency, 1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to fetch rate",
			Data:    nil,
		})
		return
	}

	if len(rates) == 0 {
		c.JSON(http.StatusNotFound, APIResponse{
			Code:    404,
			Message: "No data found for this currency",
			Data:    nil,
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "success",
		Data:    rates[0],
	})
}

// handleGetDailyRates handles GET /api/rates/:currency?days=30
func (s *APIServer) handleGetDailyRates(c *gin.Context) {
	currency := strings.ToUpper(c.Param("currency"))

	// Validate currency code
	if _, ok := CurrencyDict[currency]; !ok {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid currency code",
			Data:    nil,
		})
		return
	}

	// Get days parameter (default: 30)
	daysStr := c.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days < 1 || days > 365 {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid days parameter (must be between 1 and 365)",
			Data:    nil,
		})
		return
	}

	rates, err := s.db.GetDailyRates(currency, days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to fetch daily rates",
			Data:    nil,
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "success",
		Data: DailyRatesResponse{
			Currency: currency,
			Rates:    rates,
			Count:    len(rates),
		},
	})
}

// handleGetCurrencies handles GET /api/currencies
func (s *APIServer) handleGetCurrencies(c *gin.Context) {
	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "success",
		Data: CurrenciesResponse{
			Currencies: CurrencyDict,
			Count:      len(CurrencyDict),
		},
	})
}

// Run starts the API server
func (s *APIServer) Run(addr string) error {
	return s.router.Run(addr)
}

// GetRouter returns the Gin router instance
func (s *APIServer) GetRouter() *gin.Engine {
	return s.router
}

// handleGetHistory handles GET /api/history/:currency
func (s *APIServer) handleGetHistory(c *gin.Context) {
	currency := strings.ToUpper(c.Param("currency"))

	// Validate currency code
	if _, ok := CurrencyDict[currency]; !ok {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid currency code",
			Data:    nil,
		})
		return
	}

	// Get limit parameter (default: 1000)
	limitStr := c.DefaultQuery("limit", "1000")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid limit parameter",
			Data:    nil,
		})
		return
	}

	rates, err := s.db.GetHistoryRates(currency, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to fetch history rates",
			Data:    nil,
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "success",
		Data: HistoryRatesResponse{
			Currency: currency,
			Rates:    rates,
			Count:    len(rates),
		},
	})
}

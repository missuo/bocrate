package bocrate

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"

	"golang.org/x/net/html"
)

// CurrencyDict maps currency codes to their Chinese names
var CurrencyDict = map[string]string{
	"AED": "阿联酋迪拉姆",
	"AUD": "澳大利亚元",
	"BRL": "巴西里亚尔",
	"CAD": "加拿大元",
	"CHF": "瑞士法郎",
	"DKK": "丹麦克朗",
	"EUR": "欧元",
	"GBP": "英镑",
	"HKD": "港币",
	"IDR": "印尼卢比",
	"INR": "印度卢比",
	"JPY": "日元",
	"KRW": "韩国元",
	"MOP": "澳门元",

	"NOK": "挪威克朗",
	"NZD": "新西兰元",
	"PHP": "菲律宾比索",
	"RUB": "卢布",
	"SAR": "沙特里亚尔",
	"SEK": "瑞典克朗",
	"SGD": "新加坡元",
	"THB": "泰国铢",
	"TRY": "土耳其里拉",
	"TWD": "新台币",
	"USD": "美元",
	"ZAR": "南非兰特",
}

// ExchangeRateData represents the exchange rate data for a currency
type ExchangeRateData struct {
	CurrencyName               string `json:"currency_name"`
	ForeignExchangeBuyingRate  string `json:"foreign_exchange_buying_rate"`
	CashBuyingRate             string `json:"cash_buying_rate"`
	ForeignExchangeSellingRate string `json:"foreign_exchange_selling_rate"`
	CashSellingRate            string `json:"cash_selling_rate"`
	BOCConversionRate          string `json:"boc_conversion_rate"`
	ReleaseTime                string `json:"release_time"`
}

// extractTextFromNode recursively extracts all text content from a node
func extractTextFromNode(n *html.Node) string {
	if n.Type == html.TextNode {
		return n.Data
	}

	var text strings.Builder
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		text.WriteString(extractTextFromNode(c))
	}
	return text.String()
}

// parseTableRow extracts data from a table row
func parseTableRow(row *html.Node) []string {
	var cells []string

	// Traverse the row and find all td elements
	var findTDs func(*html.Node)
	findTDs = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "td" {
			// Extract all text from this td element
			cellText := extractTextFromNode(n)
			cells = append(cells, strings.TrimSpace(cellText))
			return // Don't traverse children since we already extracted text
		}

		// Continue traversing
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			findTDs(c)
		}
	}

	findTDs(row)
	return cells
}

// findTableRows finds all table rows from the HTML document
func findTableRows(doc *html.Node) []*html.Node {
	var rows []*html.Node
	var findRows func(*html.Node, bool)
	findRows = func(n *html.Node, inTable bool) {
		if n.Type == html.ElementNode {
			if n.Data == "table" {
				// Check if it has align="left" attribute
				for _, attr := range n.Attr {
					if attr.Key == "align" && attr.Val == "left" {
						inTable = true
						break
					}
				}
			}
			if n.Data == "tr" && inTable {
				rows = append(rows, n)
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			findRows(c, inTable)
		}
	}
	findRows(doc, false)
	return rows
}

// getPageData fetches and parses data from a single page
func getPageData(url string, chineseName string) ([]ExchangeRateData, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Accept-Language", "en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh;q=0.6")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
	req.Header.Set("Referer", "https://www.boc.cn/sourcedb/whpj/index_2.html")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
	req.Header.Set("Accept-Encoding", "gzip, deflate, br, zstd")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Parse HTML
	doc, err := html.Parse(strings.NewReader(string(body)))
	if err != nil {
		return nil, err
	}

	// Find table rows
	rows := findTableRows(doc)

	var currencyData []ExchangeRateData

	// Skip first row (header), start from index 1
	for i := 1; i < len(rows); i++ {
		cells := parseTableRow(rows[i])

		if len(cells) >= 7 {
			currencyName := strings.TrimSpace(cells[0])

			// Check if this is the currency we're looking for
			if chineseName == "" || currencyName == chineseName {
				rateData := ExchangeRateData{
					ForeignExchangeBuyingRate:  cells[1],
					CashBuyingRate:             cells[2],
					ForeignExchangeSellingRate: cells[3],
					CashSellingRate:            cells[4],
					BOCConversionRate:          cells[5],
					ReleaseTime:                strings.ReplaceAll(strings.ReplaceAll(cells[6], ".", "-"), "/", "-"),
				}
				currencyData = append(currencyData, rateData)
			}
		}
	}

	return currencyData, nil
}

// GetExchangeRate fetches exchange rate data for a specific currency
func GetExchangeRate(currencyCode string) ([]ExchangeRateData, error) {
	baseURL := "https://www.boc.cn/sourcedb/whpj/index"

	chineseName, ok := CurrencyDict[currencyCode]
	if !ok {
		return nil, fmt.Errorf("unsupported currency code: %s", currencyCode)
	}

	var allData []ExchangeRateData

	// Get first page
	firstPageURL := baseURL + ".html"
	firstPageData, err := getPageData(firstPageURL, chineseName)
	if err == nil {
		allData = append(allData, firstPageData...)
	}

	// Get pages 2-5
	for page := 1; page <= 4; page++ {
		pageURL := fmt.Sprintf("%s_%d.html", baseURL, page)
		pageData, err := getPageData(pageURL, chineseName)
		if err == nil {
			allData = append(allData, pageData...)
		}
	}

	// Add currency name to each record
	for i := range allData {
		allData[i].CurrencyName = currencyCode
	}

	return allData, nil
}

// GetAllExchangeRates fetches exchange rate data for all supported currencies
func GetAllExchangeRates() (map[string][]ExchangeRateData, error) {
	result := make(map[string][]ExchangeRateData)
	var mu sync.Mutex
	var wg sync.WaitGroup
	errChan := make(chan error, len(CurrencyDict))

	// Use goroutines to fetch data for all currencies concurrently
	for currencyCode := range CurrencyDict {
		wg.Add(1)
		go func(code string) {
			defer wg.Done()
			data, err := GetExchangeRate(code)
			if err != nil {
				errChan <- err
				return
			}
			mu.Lock()
			result[code] = data
			mu.Unlock()
		}(currencyCode)
	}

	wg.Wait()
	close(errChan)

	// Check if there were any errors
	if len(errChan) > 0 {
		return result, <-errChan
	}

	return result, nil
}

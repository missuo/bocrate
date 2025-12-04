import type {
  APIResponse,
  LatestRatesData,
  DailyRatesData,
  HistoryRatesData,
  CurrenciesData,
  ExchangeRate,
} from './types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string): Promise<APIResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function getLatestRates(): Promise<LatestRatesData> {
  const response = await fetchAPI<LatestRatesData>('/latest');
  return response.data;
}

export async function getLatestRate(currency: string): Promise<ExchangeRate> {
  const response = await fetchAPI<ExchangeRate>(`/latest/${currency}`);
  return response.data;
}

export async function getDailyRates(
  currency: string,
  days: number = 30
): Promise<DailyRatesData> {
  const response = await fetchAPI<DailyRatesData>(
    `/rates/${currency}?days=${days}`
  );
  return response.data;
}

export async function getHistoryRates(
  currency: string,
  limit: number = 1000
): Promise<HistoryRatesData> {
  const response = await fetchAPI<HistoryRatesData>(
    `/history/${currency}?limit=${limit}`
  );
  return response.data;
}

export async function getCurrencies(): Promise<CurrenciesData> {
  const response = await fetchAPI<CurrenciesData>('/currencies');
  return response.data;
}

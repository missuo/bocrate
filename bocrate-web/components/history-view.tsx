'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDailyRates } from '@/lib/api';
import type { ExchangeRate } from '@/lib/types';
import { CURRENCY_NAMES } from '@/lib/types';

export function HistoryView({ currency }: { currency: string }) {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDailyRates(currency, 30);
        setRates(data.rates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currency]);

  // Format data for chart
  // We need to reverse the rates for the chart so time goes left to right
  const chartData = [...rates].reverse().map((rate) => ({
    date: rate.release_time.replace('T', ' ').replace('Z', ''),
    rate: parseFloat(rate.foreign_exchange_buying_rate) || parseFloat(rate.cash_buying_rate),
  }));

  const currencyName = CURRENCY_NAMES[currency] || currency;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {currency} <span className="text-gray-400 font-normal">/</span> CNY
            </h1>
            <p className="text-xs text-gray-500">{currencyName}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Chart Section */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Exchange Rate Trend</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => value.split(' ')[0]} // Show only date part
                  minTickGap={50}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#2563EB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Historical Rates</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Buy (Forex)</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Buy (Cash)</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Sell (Forex)</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Sell (Cash)</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">BOC Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rates.map((rate, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-900">{rate.release_time.replace('T', ' ').replace('Z', '')}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-gray-600">{rate.foreign_exchange_buying_rate}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-gray-600">{rate.cash_buying_rate}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-gray-600">{rate.foreign_exchange_selling_rate}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-gray-600">{rate.cash_selling_rate}</td>
                    <td className="px-6 py-3 text-right tabular-nums font-medium text-gray-900">{rate.boc_conversion_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

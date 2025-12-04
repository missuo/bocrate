import { use } from 'react';
import { CURRENCY_NAMES } from '@/lib/types';
import { HistoryView } from '@/components/history-view';

export function generateStaticParams() {
  return Object.keys(CURRENCY_NAMES).map((currency) => ({
    currency: currency,
  }));
}

export default function HistoryPage({ params }: { params: Promise<{ currency: string }> }) {
  const { currency } = use(params);
  return <HistoryView currency={currency} />;
}


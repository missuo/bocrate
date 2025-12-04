export interface ExchangeRate {
  currency_name: string;
  foreign_exchange_buying_rate: string;
  cash_buying_rate: string;
  foreign_exchange_selling_rate: string;
  cash_selling_rate: string;
  boc_conversion_rate: string;
  release_time: string;
}

export interface APIResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface LatestRatesData {
  currencies: Record<string, ExchangeRate>;
  count: number;
}

export interface DailyRatesData {
  currency: string;
  rates: ExchangeRate[];
  count: number;
}

export interface HistoryRatesData {
  currency: string;
  rates: ExchangeRate[];
  count: number;
}

export interface CurrenciesData {
  currencies: Record<string, string>;
  count: number;
}

export const CURRENCY_NAMES: Record<string, string> = {
  AED: "阿联酋迪拉姆",
  AUD: "澳大利亚元",
  BRL: "巴西里亚尔",
  CAD: "加拿大元",
  CHF: "瑞士法郎",
  DKK: "丹麦克朗",
  EUR: "欧元",
  GBP: "英镑",
  HKD: "港币",
  IDR: "印尼卢比",
  INR: "印度卢比",
  JPY: "日元",
  KRW: "韩国元",
  MOP: "澳门元",

  NOK: "挪威克朗",
  NZD: "新西兰元",
  PHP: "菲律宾比索",
  RUB: "卢布",
  SAR: "沙特里亚尔",
  SEK: "瑞典克朗",
  SGD: "新加坡元",
  THB: "泰国铢",
  TRY: "土耳其里拉",
  TWD: "新台币",
  USD: "美元",
  ZAR: "南非兰特",
};

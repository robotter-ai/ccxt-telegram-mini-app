interface TickerInfo {
    ticker_id: string;
    base_currency: string;
    quote_currency: string;
    timestamp: number;
    last_price: string;
    base_volume: string;
    quote_volume: string;
    bid: string | null;
    ask: string;
    high: string;
    low: string;
    open: string;
}

export interface Ticker {
    symbol: string;
    timestamp: number;
    datetime: string;
    high: number;
    low: number;
    bid: number | null;
    bidVolume: number;
    ask: number;
    askVolume: number;
    vwap: number;
    open: number;
    close: number;
    last: number;
    previousClose: number | null;
    change: number;
    percentage: number;
    average: number;
    baseVolume: number;
    quoteVolume: number;
    info: TickerInfo;
}

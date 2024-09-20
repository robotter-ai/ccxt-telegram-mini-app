import { StringDate } from 'components/views/v2/utils/types';

export interface OrderBook {
	datetime: StringDate;
	nonce: unknown;
	symbol: string;
	timestamp: number;
	asks: [Price, Amount][];
	bids: [Price, Amount][];
}

type Price = string;
type Amount = string;

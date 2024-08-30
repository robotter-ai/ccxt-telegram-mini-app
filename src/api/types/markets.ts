import { StringDate, StringNumber } from 'components/views/v2/utils/types.ts';

export interface Market {
	id: string;
	lowercaseId: string;
	symbol: string;
	base: string;
	quote: string;
	settle: null,
	baseId: string;
	quoteId: string;
	settleId: null,
	type: string;
	spot: boolean;
	margin: boolean;
	swap: boolean;
	future: boolean;
	option: boolean;
	index: boolean;
	active: boolean;
	contract: boolean;
	linear: any;
	inverse: any;
	subType: any;
	taker: number;
	maker: number;
	contractSize: any;
	expiry: any;
	expiryDatetime: string;
	strike: any;
	optionType: any;
	precision: {
		amount: number;
		price: number;
		cost: any;
		base: any;
		quote: any;
	},
	limits: {
		leverage: {
			min: number | null;
			max: number | null;
		},
		amount: {
			min: number | null;
			max: number | null;
		},
		price: {
			min: number | null;
			max: number | null;
		},
		cost: {
			min: number | null;
			max: number | null;
		}
	},
	created: any;
	info: {
		marketId: StringNumber;
		symbol: string;
		baseAssetId: StringNumber;
		baseLotSize: StringNumber;
		quoteAssetId: StringNumber;
		quoteLotSize: StringNumber;
		priceDisplayDecimals: StringNumber;
		protectionPriceLevels: StringNumber;
		priceBandBidPct: StringNumber;
		priceBandAskPct: StringNumber;
		priceTickSize: StringNumber;
		quantityTickSize: StringNumber;
		feeTableId: StringNumber;
		status: StringNumber;
		displayRank: StringNumber;
		listedAt: StringDate;
		isPrimary: boolean;
	}
}

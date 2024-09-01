import {StringNumber} from "components/views/v2/utils/types";

export type Order = {
	checkbox: boolean;
	id: StringNumber;
	market: string;
	status: any;
	side: OrderSide;
	amount: number;
	price: number;
	datetime: number;
	actions: null;
}

export enum OrderSide {
	BUY = "buy",
	SELL = "sell",
}

export enum OrderType {
	LIMIT = "limit",
	MARKET = "market",
}

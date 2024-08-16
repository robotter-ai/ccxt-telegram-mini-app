/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseEnum } from 'model/enum/base_enum.ts';

// noinspection JSUnusedGlobalSymbols
/**
 *
 */
export class Constant extends BaseEnum {

	static v1HomePath = new Constant('Home', 'Home URL path.', '/v1');
	static v1SignInPath = new Constant('Sign In', 'Sign in URL path.', '/v1/signIn');
	static v1BalancesPath = new Constant('Balances', 'Balances URL path.', '/v1/balances');
	static v1MarketsPath = new Constant('Markets', 'Markets URL path.', '/v1/markets');
	static v1MarketPath = new Constant('Market', 'Market URL path.', '/market?marketId/v1=:marketId');
	static v1OrdersPath = new Constant('Orders', 'Orders URL path.', '/v1/orders');

	static v2HomePath = new Constant('Home', 'Home URL path.', '/v2');
	static v2SignInPath = new Constant('Sign In', 'Sign in URL path.', '/v2/signIn');
	static v2BalancesPath = new Constant('Balances', 'Balances URL path.', '/v2/balances');
	static v2MarketsPath = new Constant('Markets', 'Markets URL path.', '/v2/markets');
	static v2MarketPath = new Constant('Market', 'Market URL path.', '/market?marketId/v2=:marketId');
	static v2OrdersPath = new Constant('Orders', 'Orders URL path.', '/v2/orders');

	static homePath = Constant.v1HomePath;
	static signInPath = Constant.v1SignInPath;
	static balancesPath = Constant.v1BalancesPath;
	static marketsPath = Constant.v1MarketsPath;
	static marketPath = Constant.v1MarketPath;
	static ordersPath = Constant.v1OrdersPath;

	title: string;

	description: string;

	value: any;

	/**
	 *
	 * @param title
	 * @param description
	 * @param value
	 */
	constructor(title: string, description: string, value: any) {
		super();

		this.title = title;
		this.description = description;
		this.value = value;
	}
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseEnum } from 'model/enum/base_enum.ts';

// noinspection JSUnusedGlobalSymbols
/**
 *
 */
export class Constant extends BaseEnum {

	static homePath = new Constant('Home', 'Home URL path.', '/');
	static signInPath = new Constant('Sign In', 'Sign in URL path.', '/signIn');
	static balancesPath = new Constant('Balances', 'Balances URL path.', '/balances');
	static marketsPath = new Constant('Markets', 'Markets URL path.', '/markets');
	static marketPath = new Constant('Market', 'Market URL path.', '/market?marketId=:marketId');
	static ordersPath = new Constant('Orders', 'Orders URL path.', '/orders');

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

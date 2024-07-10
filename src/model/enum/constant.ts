/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseEnum } from 'model/enum/base_enum.ts';

// noinspection JSUnusedGlobalSymbols
/**
 *
 */
export class Constant extends BaseEnum {

	static homePath = new Constant('Home', 'Home URL path.', '/');
	static signInPath = new Constant('Sign In', 'Sign in URL path.', '/signIn');

	title: string;

	description: string;

	value: unknown;

	/**
	 *
	 * @param title
	 * @param description
	 * @param value
	 */
	constructor(title: string, description: string, value: unknown) {
		super();

		this.title = title;
		this.description = description;
		this.value = value;
	}
}

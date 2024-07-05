/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseEnum } from 'model/enum/base-enum';

// noinspection JSUnusedGlobalSymbols
/**
 *
 */
export class Constant extends BaseEnum {

	static example = new Constant('Example', 'Example description.', 'exampleValue');

	// @ts-ignore
	private title: string;

	// @ts-ignore
	private description: string;

	// @ts-ignore
	private value: unknown;

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

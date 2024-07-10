/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseEnum } from 'model/enum/base_enum.ts';

import { List } from 'model/helper/extendable-immutable/list';

/**
 *
 */
export class Environment extends BaseEnum {
	static development = new Environment('development', 'Development', 'Development.');
	static staging = new Environment('staging', 'Staging', 'Staging.');
	static production = new Environment('production', 'Production', 'Production.');

	static list = new List([
		Environment.development,
		Environment.staging,
		Environment.production,
	]);

	id: string;

	title: string;

	description: string;

	/**
	 *
	 * @param id
	 * @param title
	 * @param description
	 */
	constructor(id: string, title: string, description: string) {
		super();

		this.id = id;
		this.title = title;
		this.description = description;
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 *
	 * @param id
	 */
	static getById(id: string) {
		if (!id) {
			throw Error(`Invalid environment ${id}.`);
		}

		// @ts-ignore
		return Environment.list.find((item: Environment) => item.id === id);
	}
}

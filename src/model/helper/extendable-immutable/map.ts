/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
// @ts-ignore
import { Map as MutableMap } from 'extendable-immutable';

/**
 *
 */
export class Map extends MutableMap {

	/**
	 *
	 * @param args
	 */
	constructor(...args: any[]) {
		super(...args);

		// @ts-ignore
		return this.asMutable();
	}

	/**
	 *
	 * @param key
	 */
	getIn(key: any) {
		if (key == null) {
			return null;
		}

		if (key.constructor === Array) {
			return super.getIn(key);
		}

		return super.getIn(key.split('.'));
	}

	/**
	 *
	 * @param key
	 * @param value
	 */
	setIn(key: any, value: any) {
		if (key == null) {
			throw Error(`Invalid key ("${key}").`);
		}

		if (key.constructor === Array) {
			return super.setIn(key, value);
		}

		return super.setIn(key.split('.'), value);
	}
}

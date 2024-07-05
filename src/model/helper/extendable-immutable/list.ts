/* eslint-disable @typescript-eslint/no-explicit-any */
import { List as ExtendableList } from 'extendable-immutable';

/**
 *
 */
export class List extends ExtendableList {

	/**
	 *
	 * @param args
	 */
	constructor(...args: any[]) {
		super(...args);

		return this.asMutable();
	}
}

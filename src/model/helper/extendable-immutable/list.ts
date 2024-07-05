/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
// @ts-ignore
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

		// @ts-ignore
		return this.asMutable();
	}
}

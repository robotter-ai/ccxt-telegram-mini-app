/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';

// @ts-ignore
if (window.app == null) {
	// @ts-ignore
	window.app = new Map().asMutable();

	// @ts-ignore
	window.app.setIn('session', window.sessionStorage);
	// @ts-ignore
	window.app.setIn('local', window.localStorage);
}

// @ts-ignore
export const app = window.app;

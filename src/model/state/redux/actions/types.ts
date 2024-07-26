import { Map } from 'model/helper/extendable-immutable/map';

import { app } from 'model/storage/app';

let actionTypes = app.getIn('redux.actions.types');

if (actionTypes == null) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	actionTypes = new Map().asMutable();

	app.setIn('redux.actions.types', actionTypes);
}

export { actionTypes };

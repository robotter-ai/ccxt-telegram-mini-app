import { Map } from 'model/helper/extendable-immutable/map';

const { app } = await import('model/storage/app');

let actionBounds = app.getIn('redux.actions.bounds');

if (actionBounds == null) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	actionBounds = new Map().asMutable();

	app.setIn('redux.actions.bounds', actionBounds);
}

export { actionBounds };

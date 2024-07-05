import { Map } from 'model/helper/extendable-immutable/map';

const { app } = await import('model/storage/app');

let actionCreators = app.getIn('redux.actions.creators');

if (actionCreators == null) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	actionCreators = new Map().asMutable();

	app.setIn('redux.actions.creators', actionCreators);
}

export { actionCreators };

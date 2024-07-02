import { Map } from 'model/helper/extendable-immutable/map';
import { app } from 'model/storage/app';

let reducers = app.getIn('redux.reducers');

if (reducers == null) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	reducers = new Map().asMutable();

	app.setIn('redux.reducers', reducers);
}

export { reducers };

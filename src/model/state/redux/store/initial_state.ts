/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';
import { Status } from 'model/enum/status.ts';

const map = new Map();

map.setIn(
	'telegram.user',
	null
);

map.setIn(
	'api.isSignedIn',
	false
);

map.setIn(
	'api.token',
	null
);

map.setIn(
	'api.status',
	Status.running.id
);

map.setIn(
	'api.orders.open',
	[]
)

map.setIn(
	'api.markets',
	[]
)

map.setIn(
	'api.market',
	{
		id: null,
		candles: []
	}
)

// @ts-ignore
const initialState = map.toJS();

export { initialState };

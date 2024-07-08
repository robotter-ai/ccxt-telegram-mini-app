/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';
import { Status } from 'model/enum/status.ts';

const map = new Map();

map.setIn(
	'api.status',
	Status.running.id
);

map.setIn(
	'api.orders.open',
	[]
)

// @ts-ignore
const initialState = map.toJS();

export { initialState };

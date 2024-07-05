/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';

const map = new Map();

map.setIn(
	'api.funttastic.client.status',
	JSON.parse(
		JSON.stringify({
			'fun-client': 'unknown',
			'hb-gateway': 'unknown',
			'hb-client': 'unknown',
		}),
	),
);

// @ts-ignore
const initialState = map.toJS();

export { initialState };

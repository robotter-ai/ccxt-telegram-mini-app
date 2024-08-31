/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';
import { Status } from 'model/enum/status.ts';

const map = new Map({
	app: {
		menu: {
			isOpen: false
		},
		intervalsIds: []
	},
	api: {
		template: {
			data: null
		},
		status: Status.running.id,
		token: null,
		isSignedIn: false,
		markets: [],
		currencies: {},
		orders: {
			open: []
		},
		market: {
			id: null,
			candles: []
		},
		rewards: {},
	},
	telegram: {
		user: null
	}
});

// @ts-ignore
const initialState = map.toJS();

export { initialState };

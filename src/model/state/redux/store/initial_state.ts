/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';
import { Status } from 'model/enum/status';

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
		balanceData: {},
		orders: {
			open: []
		},
		market: {
			id: null,
			market: {},
			candles: [],
			orderBook: {
				raw: {},
				chart: {},
				granularity: 1,
			}
		},
		rewards: {},
		favorites: [],
	},
	telegram: {
		user: null
	},
	maps: {
		marketsByIds: {},
		marketsBySymbols: {},
		marketsByRawIds: {},
		marketsByRawSymbols: {},
		currenciesByIds: {},
		currenciesBySymbols: {},
		currenciesByRawIds: {},
		currenciesByRawSymbols: {},
	}
});

// @ts-ignore
const initialState = map.toJS();

export { initialState };

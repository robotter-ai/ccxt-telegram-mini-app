/* eslint-disable @typescript-eslint/no-explicit-any */
import { app } from 'model/storage/app';
import { storeFactory } from 'model/state/redux/store/store.factory';
import { initialState } from 'model/state/redux/store/initial_state';
import { subscribers } from 'model/state/redux/store/subscribers';

if (app.getIn('redux.store') == null) {
	const store = storeFactory(initialState);

	for (const value of Object.values(subscribers)) {
		store.subscribe(value(store));
	}

	app.setIn('redux.store', store);
}

export function dispatch(actionType: any, payload: any) {
	const bounds = app.getIn('redux.actions.bounds');
	const bound = bounds.getIn(actionType);

	return bound(payload);
}

// noinspection JSUnusedGlobalSymbols
export const reduxStore = app.getIn('redux.store');

/* eslint-disable @typescript-eslint/no-explicit-any */
const { app } = await import('model/storage/app');

if (app.getIn('redux.store') == null) {
	const { storeFactory } = await import('model/state/redux/store/store.factory');
	const { initialState } = await import('model/state/redux/store/initial_state');
	const { subscribers } = await import('model/state/redux/store/subscribers');

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

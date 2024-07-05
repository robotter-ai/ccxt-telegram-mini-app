/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment,@typescript-eslint/no-unused-vars */
// noinspection JSUnusedLocalSymbols

import { app } from 'model/storage/app';
import { reducers } from 'model/state/redux/reducers/index';
import { initialState } from 'model/state/redux/store/initial-state';

let rootReducer = reducers.getIn('root');

if (rootReducer == null) {
	const actionTypes = app.getIn('redux.actions.types');

	rootReducer = (currentState: any, {
		// @ts-ignore
		type: any,
		// @ts-ignore
		payload: any
	}) => {
		// @ts-ignore
		const reducer = reducers.getIn(actionTypes.getIn(type));

		if (!reducer) {
			return initialState;
		}

		return reducer(currentState, {
			// @ts-ignore
			type,
			// @ts-ignore
			payload
		});
	};

	reducers.setIn('root', rootReducer);
}

export { rootReducer };

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { applyMiddleware, createStore } from 'redux';
import { middlewares } from 'model/state/redux/store/middlewares';
import { rootReducer } from 'model/state/redux/reducers/root.reducer';
import { initialState } from 'model/state/redux/store/initial-state';

export const storeFactory = (state = initialState) => {
	return applyMiddleware(
		middlewares.mainMiddleware,
		// @ts-ignore
		middlewares.thunkMiddleware,
	)(createStore)(
		rootReducer,
		state,
		// @ts-ignore
		window.__REDUX_DEVTOOLS_EXTENSION__ &&
		// @ts-ignore
		window.__REDUX_DEVTOOLS_EXTENSION__(),
	);
};

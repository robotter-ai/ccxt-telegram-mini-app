import { applyMiddleware, createStore } from 'redux';
import { middlewares } from 'model/state/redux/store/middlewares';
import { rootReducer } from 'model/state/redux/reducers/root.reducer';
import { initialState } from 'model/state/redux/store/initial-state';

export const storeFactory = (state = initialState) => {
	return applyMiddleware(
		middlewares.mainMiddleware,
		middlewares.thunkMiddleware,
	)(createStore)(
		rootReducer,
		state,
		window.__REDUX_DEVTOOLS_EXTENSION__ &&
		window.__REDUX_DEVTOOLS_EXTENSION__(),
	);
};

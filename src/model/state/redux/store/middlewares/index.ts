import { thunk } from 'redux-thunk';

import { mainMiddleware } from 'model/state/redux/store/middlewares/main.middleware';

export const middlewares = {
	mainMiddleware,
	thunkMiddleware: thunk
};

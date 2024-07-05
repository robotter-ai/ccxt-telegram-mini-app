/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';

const { pushStack } = await import('model/state/redux/stack/methods');

pushStack('api.updateToken', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.token',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	return nextState;
});

pushStack('api.updateStatus', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.status',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	return nextState;
});

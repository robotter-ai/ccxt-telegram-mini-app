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

	// noinspection TypeScriptUnresolvedReference
	console.log('api.updateToken', nextState.api.token);

	return nextState;
});

pushStack('api.updateStatus', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.status',
			payload.status
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	console.log('api.updateStatus', nextState.api.status);

	return nextState;
});

// noinspection JSUnusedLocalSymbols
pushStack('api.signOut', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	nextState.setIn(
		'api.token',
		null
	);

	// @ts-ignore
	nextState = nextState.toJS();

	return nextState;
});

// noinspection JSUnusedLocalSymbols
pushStack('api.updateOpenOrders', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.orders.open',
			payload.result
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	console.log('api.updateOpenOrders', nextState.api.orders.open);

	return nextState;
});

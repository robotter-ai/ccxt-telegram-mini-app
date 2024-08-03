/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';

const { pushStack } = await import('model/state/redux/stack/methods');

// @ts-ignore
// noinspection JSUnusedLocalSymbols
pushStack('telegram.updateTelegramUser', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'telegram.user',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('telegram.updateTelegramUser', nextState.telegram.user);

	return nextState;
});

pushStack('api.updateIsSignedIn', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.isSignedIn',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.updateIsSignedIn', nextState.api.token);

	return nextState;
});

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
	// @ts-ignore
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
	// @ts-ignore
	console.log('api.updateStatus', nextState.api.status);

	return nextState;
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
pushStack('api.signIn', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState.setIn(
			'api.token',
			payload
		);

		nextState.setIn(
			'api.isSignedIn',
			true
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	return nextState;
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
pushStack('api.signOut', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	nextState.setIn(
		'api.token',
		null
	);

	nextState.setIn(
		'api.isSignedIn',
		false
	);

	// @ts-ignore
	nextState = nextState.toJS();

	return nextState;
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
pushStack('app.updateIntervalsIds', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState.setIn(
			'app.intervalsIds',
			[...nextState.getIn('app.intervalsIds'), payload]
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('app.intervalsIds', nextState.app.intervalsIds);

	return nextState;
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
pushStack('app.clearAllIntervalsIds', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('app.intervalsIds, before clear', nextState.getIn('app.intervalsIds'));

	nextState.setIn(
		'app.intervalsIds',
		[]
	);

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('app.intervalsIds, after clear', nextState.app.intervalsIds);

	return nextState;
});

// noinspection JSUnusedLocalSymbols
pushStack('api.updateMarkets', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.markets',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.updateMarkets', nextState.api.markets);

	return nextState;
});

// noinspection JSUnusedLocalSymbols
pushStack('api.updateCurrencies', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.currencies',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.updateCurrencies', nextState.api.currencies);

	return nextState;
});

// noinspection JSUnusedLocalSymbols
pushStack('api.updateOpenOrders', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.orders.open',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.updateOpenOrders', nextState.api.orders.open);

	return nextState;
});

// noinspection JSUnusedLocalSymbols
pushStack('api.updateMarketCandles', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.market.candles',
			[...nextState.getIn('api.market.candles'), ...payload].slice(0, 25)
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.updateMarketCandles', nextState.api.market.candles);

	return nextState;
});


// @ts-ignore
// noinspection JSUnusedLocalSymbols
pushStack('api.updateTemplateData', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.updateTemplateData', nextState);

	return nextState;
});

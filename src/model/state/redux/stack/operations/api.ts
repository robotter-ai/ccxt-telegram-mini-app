/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import { Map } from 'model/helper/extendable-immutable/map';

const { pushStack } = await import('model/state/redux/stack/methods');

pushStack('api.updateTemplateData', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.template.data',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.template.data', nextState.api.template.data);

	return nextState;
});

pushStack('api.updateBalanceData', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.balanceData',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.balanceData', nextState.api.balanceData);

	return nextState;
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
pushStack('app.toggleMenu', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	nextState.setIn(
		'app.menu.isOpen',
		!nextState.getIn('app.menu.isOpen')
	);

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('app.menu.isOpen', nextState.app.menu.isOpen);

	return nextState;
});

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

		for (const market of payload) {
			nextState.setIn(`maps.currenciesByIds.${market.id}`, market);
			nextState.setIn(`maps.currenciesBySymbols.${market.symbol}`, market);
			nextState.setIn(`maps.currenciesByRawIds.${market.info?.marketId}`, market);
			nextState.setIn(`maps.currenciesByRawSymbols.${market.info?.symbol}`, market);
		}
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

		for (const currency of Object.values(payload) as any[]) {
			nextState.setIn(`maps.currenciesByIds.${currency.id}`, currency);
			nextState.setIn(`maps.currenciesBySymbols.${currency.code}`, currency);
			nextState.setIn(`maps.currenciesByRawIds.${currency.info.assetId}`, currency);
			nextState.setIn(`maps.currenciesByRawSymbols.${currency.info.symbol}`, currency);
		}
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
pushStack('api.updateMarket', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.market.market',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.updateMarket', nextState.api.market.market);

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

pushStack('api.updateMarketOrderBookData', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.market.orderBook.raw',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.market.orderBook.raw', nextState.api.market.orderBook.raw);

	return nextState;
});

pushStack('api.updateMarketOrderBookChartData', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.market.orderBook.chart',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.market.orderBook.chart', nextState.api.market.orderBook.chart);

	return nextState;
});

pushStack('api.updateMarketOrderBookGranularity', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.market.orderBook.granularity',
			payload
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.market.orderBook.granularity', nextState.api.market.orderBook.granularity);

	return nextState;
});

// noinspection JSUnusedLocalSymbols
pushStack('api.updateRewards', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.rewards',
			{...nextState.getIn('api.rewards'), ...payload}
		);
	}

	// @ts-ignore
	nextState = nextState.toJS();

	// noinspection TypeScriptUnresolvedReference
	// @ts-ignore
	console.log('api.updateRewards', nextState.api.rewards);

	return nextState;
});

pushStack('api.updateUserMarketFavorites', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	nextState = nextState.setIn(
		'api.favorites',
		payload
	);

	// @ts-ignore
	nextState = nextState.toJS();

	// @ts-ignore
	console.log('Updated user market favorites', nextState.api.favorites);

	return nextState;
});

pushStack('api.addUserMarketFavorite', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	nextState = nextState.setIn(
		'api.favorites',
		[...nextState.getIn('api.favorites'), payload] // Append new favorite market ID
	);

	// @ts-ignore
	nextState = nextState.toJS();
// @ts-ignore
	console.log('Added favorite market', nextState.api.favorites);

	return nextState;
});

pushStack('api.removeUserMarketFavorite', (currentState: any, payload: any) => {
	let nextState = new Map(currentState);

	nextState = nextState.setIn(
		'api.favorites',
		nextState.getIn('api.favorites').filter((id: number) => id !== payload) // Remove the favorite market ID
	);

	// @ts-ignore
	nextState = nextState.toJS();
// @ts-ignore
	console.log('Removed favorite market', nextState.api.favorites);

	return nextState;
});


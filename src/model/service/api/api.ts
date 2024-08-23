/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment,@typescript-eslint/no-unused-vars */
import axios, { AxiosRequestConfig } from 'axios';

import { Environment } from 'model/enum/environment';

const environment = Environment.production;

interface ExtraOptions {
	protocol?: 'http' | 'https';
	host?: string;
	port?: number | string;
	prefix?: string;
	clientCertificatePath?: string;
	clientKeyPath?: string;
	bearerToken?: string;
}

interface Options extends Omit<AxiosRequestConfig, 'httpsAgent'>, ExtraOptions {
}

const callAPIorMockAPI = async (options: Options, handleUnAuthorized?: () => void): Promise<any> => {
	try {
		if (environment == Environment.development) {
			return await callMockAPI(options);
		} else {
			return await callAPI(options);
		}
	} catch (exception) {
		if (axios.isAxiosError(exception)) {
			if (exception?.response?.status == 401) {
				if (handleUnAuthorized) handleUnAuthorized();
			}
		}

		throw exception;
	}
};

// @ts-ignore
// noinspection JSUnusedLocalSymbols
async function callMockAPI(options: Options): Promise<any> {
	throw new Error('Not implemented');
}

async function callAPI(options: Options): Promise<any> {
	const {
		bearerToken,
		...axiosOptions
	} = options;

	axiosOptions.baseURL = '/api';

	const headers = {
		'Content-Type': 'application/json',
		...(bearerToken ? { 'Authorization': `Bearer ${bearerToken}` } : {}),
		...axiosOptions.headers,
	};

	axiosOptions.withCredentials = true;

	const config = {
		...axiosOptions,
		headers,
	};

	try {
		return await axios(config);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw error;
		}

		throw error;
	}
}

// noinspection JSUnusedGlobalSymbols
export const apiPostAuthSignIn = async (data: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'POST',
		url: '/auth/signIn',
		data: data,
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiPostAuthSignOut = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'POST',
		url: '/auth/signOut',
		data: data
	}, handleUnAuthorized);
};

export const apiPostAuthRefresh = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'POST',
		url: '/auth/refresh',
		data: data
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiPostAuthIsSignedIn = async (data: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'POST',
		url: '/auth/isSignedIn',
		data: data,
	}, handleUnAuthorized);
};


export const apiGetServiceStatus = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'GET',
		url: '/service/status',
		data: data
	}, handleUnAuthorized);
};


// noinspection JSUnusedGlobalSymbols
export const apiPostRun = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
			environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiDeleteCancelAllOrders = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'DELETE',
		url: '/run',
		data: {
			exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
			environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
			method: 'cancel_all_orders',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiDeleteCancelOrder = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'DELETE',
		url: '/run',
		data: {
			exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
			environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
			method: 'cancel_order',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiPostCreateOrder = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
			environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
			method: 'create_order',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetDescribe = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		data: {
			exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
			environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
			method: 'describe',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiPostDeposit = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
			environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
			method: 'deposit',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchBalance = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_balance',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchClosedOrders = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_closed_orders',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchCurrencies = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_currencies',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchDepositAddresses = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_deposit_addresses',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchMarkets = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_markets',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchMyTrades = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_my_trades',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOHLCV = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_oHLCV',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOpenOrder = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_open_order',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOpenOrders = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_open_orders',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOrder = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_order',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOrderBook = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_order_book',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOrders = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_orders',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOrdersAllMarkets = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_orders_all_markets',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchStatus = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_status',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchTicker = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_ticker',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchTickers = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_tickers',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchTrades = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_trades',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchTradingFee = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'GET',
		url: '/run',
		params: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_trading_fee',
			...data
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiPostSetSandboxMode = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'set_sandbox_mode',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiPostWithdraw = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'withdraw',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// @ts-ignore
// noinspection JSUnusedGlobalSymbols
export const apiPostDevelopmentExample = async (data?: any, handleUnAuthorized?: () => void) => {
	return await callAPIorMockAPI({
		method: 'POST',
		url: '/developmemt/example',
		data: data
	}, handleUnAuthorized);
};

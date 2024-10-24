/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment,@typescript-eslint/no-unused-vars */
import axios, {AxiosRequestConfig} from 'axios';

import {Environment} from 'model/enum/environment';

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
	const { url, method } = options;

	if (url === '/user/market/favorites' && method === 'GET') {
		return {
			status: 200,
			data: {
				title:'User favorites',
				message:'Fetching favorites',
				result: ["BTCUSDC", "SOLUSDC"]
			}
		};
	}

	if (url === '/user/market/favorites' && method === 'POST') {
		return {
			status: 201,
			message: 'Favorite added successfully',
		};
	}

	if (url.startsWith('/user/market/favorites/') && method === 'DELETE') {
		return {
			status: 200,
			message: 'Favorite removed successfully',
		};
	}

	throw new Error(`Mock API not implemented for ${method} ${url}`);
}



async function callAPI(options: Options): Promise<any> {
	const {
		bearerToken,
		...axiosOptions
	} = options;

	axiosOptions.baseURL = '/api';

	const headers = {
		'Content-Type': 'application/json',
		...(bearerToken ? {'Authorization': `Bearer ${bearerToken}`} : {}),
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
		method: 'POST',
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
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_balance',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchClosedOrders = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_closed_orders',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchCurrencies = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_currencies',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchDepositAddresses = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_deposit_addresses',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchMarkets = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_markets',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchMyTrades = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_my_trades',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOHLCV = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_ohlcv',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOpenOrder = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_open_order',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOpenOrders = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_open_orders',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOrder = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_order',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOrderBook = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_order_book',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOrders = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_orders',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchOrdersAllMarkets = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_orders_all_markets',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchStatus = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_status',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchTicker = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_ticker',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchTickers = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_tickers',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchTrades = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_trades',
			parameters: {
				...data
			},
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetFetchTradingFee = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'fetch_trading_fee',
			parameters: {

				...data
			},
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

// noinspection JSUnusedGlobalSymbols
export const apiGetIridiumPrivateUsersLootBoxes = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_iridium_private_get_users_loot_boxes',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetIridiumPublicPointsLoyaltyLeaderboard = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_iridium_public_get_points_loyalty_leaderboard',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetIridiumPrivateUsersInvites = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_iridium_private_get_users_invites',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetIridiumPublicPointsReferralLeaderboard = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_iridium_public_get_points_referral_leaderboard',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetIridiumPrivateUsersDailyLoyalty = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_iridium_private_get_users_daily_loyalty',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetIridiumPrivateUsersUserTier = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_iridium_private_get_users_user_tier',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetPrivateUserInfo = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_private_get_user_info',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetIridiumPrivateUsersInfo = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_iridium_private_get_users_info',
			parameters: {
				...data
			}
		},
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetIridiumPublicPointsBlocksLeaderboard = async (data?: any, handleUnAuthorized?: () => void) => {
	return callAPIorMockAPI({
		method: 'POST',
		url: '/run',
		data: {
			exchangeId: import.meta.env.VITE_EXCHANGE_ID,
			environment: import.meta.env.VITE_EXCHANGE_ENVIRONMENT,
			method: 'rest_iridium_public_get_points_blocks_leaderboard',
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
		url: '/development/example',
		data: data
	}, handleUnAuthorized);
};

// noinspection JSUnusedGlobalSymbols
export const apiGetUserMarketFavorites = async (data?: any) => {
	return await callMockAPI({
		method: 'GET',
		url: '/user/market/favorites',
		data: data,
	});
};

// noinspection JSUnusedGlobalSymbols
export const apiPostUserMarketFavorite = async (data: { marketId: number }) => {
	return await callMockAPI({
		method: 'POST',
		url: '/user/market/favorites',
		data: data,
	});
};

// noinspection JSUnusedGlobalSymbols
export const apiDeleteUserMarketFavorite = async (data: { marketId: number }) => {
	return await callMockAPI({
		method: 'DELETE',
		url: `/user/market/favorites/${data.marketId}`,
	});
};

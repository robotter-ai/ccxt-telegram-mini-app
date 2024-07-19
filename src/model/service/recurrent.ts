/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment,@typescript-eslint/no-unused-vars */
import { dispatch } from 'model/state/redux/store';
import { apiGetServiceStatus, apiPostAuthRefresh } from 'model/service/api';
import axios from 'axios';

export const executeAndSetInterval = (targetFunction: any, interval: number) => {
	targetFunction();

	return setInterval(targetFunction, interval);
};

// noinspection JSUnusedLocalSymbols
const recurrentFunctions = {
	// // @ts-ignore
	// '1s': (handleUnAuthorized?: () => void) => {
	// 	// eslint-disable-next-line prefer-const
	// 	let intervalId: any;
	//
	// 	const targetFunction = async () => {
	// 		try {
	// 		} catch (exception) {
	// 			if (axios.isAxiosError(exception)) {
	// 				if (exception?.response?.status == 401) {
	// 					clearInterval(intervalId);
	//
	// 					return;
	// 				}
	// 			}
	//
	// 			console.error(exception);
	// 		}
	// 	};
	//
	// 	intervalId = executeAndSetInterval(targetFunction, 1000);
	// },
	'1m': (handleUnAuthorized?: () => void) => {
		// eslint-disable-next-line prefer-const
		let intervalId: any;

		const targetFunction = async () => {
			try {
				const response = await apiGetServiceStatus(undefined, handleUnAuthorized);

				const status = response.data;

				dispatch('api.updateStatus', status);
			} catch (exception) {
				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status == 401) {
						clearInterval(intervalId);

						return;
					}
				}

				console.error(exception);
			}
		};

		intervalId = executeAndSetInterval(targetFunction, 60*1000);
	},
	'10min': (handleUnAuthorized?: () => void) => {
		// eslint-disable-next-line prefer-const
		let intervalId: any;

		const targetFunction = async () => {
			try {
				await apiPostAuthRefresh(undefined, handleUnAuthorized);

				const response = await apiPostAuthRefresh()
				const { token } = response.data
				dispatch('api.updateToken', token)
			} catch (exception) {
				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status == 401) {
						clearInterval(intervalId);

						return;
					}
				}

				console.error(exception);
			}
		};

		intervalId = setInterval(targetFunction, 10 * 60 * 1000);
	},
	// // @ts-ignore
	// '1h': (handleUnAuthorized?: () => void) => {
	// 	// eslint-disable-next-line prefer-const
	// 	let intervalId: any;
	//
	// 	const targetFunction = async () => {
	// 		try {
	// 		} catch (exception) {
	// 			if (axios.isAxiosError(exception)) {
	// 				if (exception?.response?.status == 401) {
	// 					clearInterval(intervalId);
	//
	// 					return;
	// 				}
	// 			}
	//
	// 			console.error(exception);
	// 		}
	// 	};
	//
	// 	intervalId = executeAndSetInterval(targetFunction, 60*60*1000);
	// },
	// // @ts-ignore
	// '1d': (handleUnAuthorized?: () => void) => {
	// 	// eslint-disable-next-line prefer-const
	// 	let intervalId: any;
	//
	// 	const targetFunction = async () => {
	// 		try {
	// 		} catch (exception) {
	// 			if (axios.isAxiosError(exception)) {
	// 				if (exception?.response?.status == 401) {
	// 					clearInterval(intervalId);
	//
	// 					return;
	// 				}
	// 			}
	//
	// 			console.error(exception);
	// 		}
	// 	};
	//
	// 	intervalId = executeAndSetInterval(targetFunction, 24*60*60*1000);
	// },
};

// noinspection JSUnusedGlobalSymbols
export const configure = (handleUnAuthorized?: () => void) => {
	// @ts-ignore
	// noinspection JSUnusedLocalSymbols
	for (const [ id, func ] of Object.entries(recurrentFunctions)) {
		func(handleUnAuthorized);
	}
};

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
		data: data
	}, handleUnAuthorized);
};

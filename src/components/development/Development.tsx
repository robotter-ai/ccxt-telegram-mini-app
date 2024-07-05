/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars,@typescript-eslint/ban-ts-comment */
// noinspection JSUnusedLocalSymbols

import { useEffect, useState } from 'react';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import 'model/initializer';
import { apiPostAuthSignIn, apiPostRun } from 'model/service/api';

const Development = () => {
	const [ data, setData ] = useState(null as any);
	const [ loading, setLoading ] = useState(true);
	const [ error, setError ] = useState(null as any);

	const handleUnAuthorized = useHandleUnauthorized();

	useEffect(() => {
		// @ts-ignore
		const fetchData = async () => {
			try {
				await apiPostAuthSignIn({
					'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
					'exchangeEnvironment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					'exchangeApiKey': `${import.meta.env.VITE_EXCHANGE_API_KEY}`,
					'exchangeApiSecret': `${import.meta.env.VITE_EXCHANGE_API_SECRET}`,
					'exchangeOptions': {
						'subAccountId': `${import.meta.env.VITE_EXCHANGE_OPTIONS_SUB_ACCOUNT_ID}`,
					}
				});

				const { configure } = await import('model/service/recurrent');
				configure(handleUnAuthorized);

				const response = await apiPostRun({
					'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
					'environment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					'method': 'fetch_ticker',
					'parameters': {
						'symbol': 'BTC/USDT'
					}
				});

				if (!(response.status === 200)) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error('Network response was not OK');
				}

				const data = await response.data;
				setData(data);
			} catch (error: any) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div>
			<h1>Data from API</h1>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
};

export default Development;

/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars,@typescript-eslint/ban-ts-comment */
// noinspection JSUnusedLocalSymbols

import { useState, useEffect } from 'react';
import 'model/initializer'
import { apiPostAuthSignIn } from 'model/service/api';

const Development = () => {
	const [data, setData] = useState(null as any);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null as any);

	useEffect(() => {
		// @ts-ignore
		const fetchData = async () => {
			try {
				// await import('model/service/recurrent');

				const response = await apiPostAuthSignIn({
					"exchangeId": `${import.meta.env.VITE_EXCHANGE_ID}`,
					"exchangeEnvironment": `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					"exchangeApiKey": `${import.meta.env.VITE_EXCHANGE_API_KEY}`,
					"exchangeApiSecret": `${import.meta.env.VITE_EXCHANGE_API_SECRET}`,
					"exchangeOptions": {
						"subAccountId": `${import.meta.env.VITE_EXCHANGE_OPTIONS_SUB_ACCOUNT_ID}`,
					}
				});
				if (!(response.status === 200)) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error('Network response was not ok');
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

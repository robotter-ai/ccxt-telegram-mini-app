/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars,@typescript-eslint/ban-ts-comment */
// noinspection JSUnusedLocalSymbols

import { useEffect, useState } from 'react';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { apiPostAuthSignIn, apiPostRun } from 'model/service/api';
import { dispatch } from 'model/state/redux/store';
import axios from 'axios';

import { connect } from 'react-redux'
import EnhancedTable from 'components/views/EnhancedTable.tsx';

// @ts-ignore
const mapStateToProps = (state: any, props: any) => ({
	openOrders: state.api.orders.open,
})

const OrderStructure = (state: any) => {
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

				const { configure, executeAndSetInterval } = await import('model/service/recurrent');
				configure(handleUnAuthorized);

				let intervalId: any;

				const targetFunction = async () => {
					try {
						const response = await apiPostRun({
							'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
							'environment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
							'method': 'fetch_open_orders',
							'parameters': {
								'symbol': 'BTC/USDT'
							}
						}, handleUnAuthorized);

						if (!(response.status === 200)) {
							// noinspection ExceptionCaughtLocallyJS
							throw new Error('Network response was not OK');
						}

						const payload = response.data;

						const output = payload.result.map((order: any, index: any) => ({
							id: index,
							market: order.symbol,
							status: order.status,
							side: order.side,
							amount: order.amount,
							price: order.price,
							datetime: new Date(order.timestamp).toLocaleString(),
						}));

						dispatch('api.updateOpenOrders', output);
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

				intervalId = executeAndSetInterval(targetFunction, 5000);
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
			<EnhancedTable rows={state.openOrders} />
		</div>
	);
};

const Orders = connect(mapStateToProps)(OrderStructure)

export default Orders

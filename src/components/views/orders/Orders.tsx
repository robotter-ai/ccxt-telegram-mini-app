import { useEffect, useState } from 'react';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { apiPostAuthSignIn, apiPostRun } from 'model/service/api';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import OrdersTable from 'components/views/orders/OrdersTable';
import { toast } from 'react-toastify';

const Orders = () => {
	const openOrders = useSelector((state: any) => state.api.orders.open);
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null as any);
	const handleUnAuthorized = useHandleUnauthorized();

	let canceledOrders = new Set();

	const cancelOpenOrder = async (orderId: any) => {
		if (!orderId) return;

		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'cancel_order',
					parameters: {
						id: orderId,
						symbol: 'BTC/USDT',
					},
				},
				handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			canceledOrders.add(orderId);

			dispatch({ type: 'api.updateOpenOrders', payload: openOrders.filter((order: any) => order.id !== orderId) });

			toast.success(`Order ${orderId} canceled successfully!`);
		} catch (error) {
			console.error('Failed to cancel order:', error);
			toast.error(`Failed to cancel order ${orderId}.`);
		}
	};

	const cancelOpenOrders = async (orderIds: any[]) => {
		if (!orderIds || !(orderIds.length > 0)) return;

		const promises = orderIds.map(async (orderId: any) => await cancelOpenOrder(orderId));
		await Promise.all(promises);

		toast.success('Selected orders canceled successfully!');
	};

	const cancelAllOpenOrders = async () => {
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'cancel_all_orders',
					parameters: {
						symbol: 'BTC/USDT',
					},
				},
				handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			openOrders.forEach((order: any) => canceledOrders.add(order.id));

			dispatch({ type: 'api.updateOpenOrders', payload: [] });

			toast.success('All orders canceled successfully!');
		} catch (error) {
			console.error('Failed to cancel all orders:', error);
			toast.error('Failed to cancel all orders.');
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				await apiPostAuthSignIn({
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					exchangeEnvironment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					exchangeApiKey: `${import.meta.env.VITE_EXCHANGE_API_KEY}`,
					exchangeApiSecret: `${import.meta.env.VITE_EXCHANGE_API_SECRET}`,
					exchangeOptions: {
						subAccountId: `${import.meta.env.VITE_EXCHANGE_OPTIONS_SUB_ACCOUNT_ID}`,
					},
				});

				const { configure, executeAndSetInterval } = await import('model/service/recurrent');
				configure(handleUnAuthorized);

				let intervalId: any;

				const targetFunction = async () => {
					try {
						const response = await apiPostRun(
							{
								exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
								environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
								method: 'fetch_open_orders',
								parameters: {
									symbol: 'BTC/USDT',
								},
							},
							handleUnAuthorized
						);

						if (response.status !== 200) {
							throw new Error('Network response was not OK');
						}

						const payload = response.data;

						const output = payload.result
							.filter((order: any) => !canceledOrders.has(order.id))
							.map((order: any) => ({
								checkbox: false,
								id: order.id,
								market: order.symbol,
								status: order.status,
								side: order.side,
								amount: order.amount,
								price: order.price,
								datetime: new Date(order.timestamp).toLocaleString(),
								actions: null,
							}));

						dispatch({ type: 'api.updateOpenOrders', payload: output });
					} catch (exception) {
						if (axios.isAxiosError(exception)) {
							if (exception?.response?.status === 401) {
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
			<OrdersTable
				rows={openOrders}
				cancelOpenOrder={cancelOpenOrder}
				cancelOpenOrders={cancelOpenOrders}
				cancelAllOpenOrders={cancelAllOpenOrders}
			/>
		</div>
	);
};

export default Orders;

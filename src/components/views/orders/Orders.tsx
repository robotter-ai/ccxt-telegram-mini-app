import React from 'react';
import { connect } from 'react-redux';
import { Base, BaseProps, BaseSnapshot, BaseState } from 'components/base/Base';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import Spinner from 'components/views/spinner/Spinner';
import './Orders.css';
import { toast } from 'react-toastify';
import OrdersTable from 'components/views/orders/OrdersTable';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

interface OrdersProps extends BaseProps {
	openOrders: any;
	dispatch: any;
	queryParams: any;
	params: any;
	searchParams: any;
	navigate: any;
	handleUnAuthorized: any;
}

interface OrdersState extends BaseState {
	isLoading: boolean;
	error?: string;
}

interface OrdersSnapshot extends BaseSnapshot {}

const mapStateToProps = (state: any, props: any) => ({
	openOrders: state.api.orders.open,
});

class OrdersStructure extends Base<OrdersProps, OrdersState, OrdersSnapshot> {
	static defaultProps: Partial<BaseProps> = {};

	recurrentIntervalId?: number;
	recurrentDelay: number = 30000;
	canceledOrdersRef: Set<string>;

	constructor(props: OrdersProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: null,
		};

		this.canceledOrdersRef = new Set();
	}

	async componentDidMount() {
		console.log('componentDidMount', arguments);
		await this.fetchData();
		this.recurrentIntervalId = executeAndSetInterval(this.fetchData.bind(this), this.recurrentDelay);
	}

	async componentWillUnmount() {
		console.log('componentWillUnmount', arguments);
		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	async fetchData() {
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_open_orders',
					parameters: {
						symbol: 'tSOLtUSDC',
					},
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			const payload = response.data;

			if (!Array.isArray(payload.result)) {
				throw new Error('Unexpected API response format');
			}

			const formatTimestamp = (timestamp: any) => {
				const date = new Date(timestamp);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				const seconds = String(date.getSeconds()).padStart(2, '0');

				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			};

			const output = payload.result
				.filter((order: any) => !this.canceledOrdersRef.has(order.id))
				.map((order: any) => ({
					checkbox: false,
					id: order.id,
					market: order.symbol,
					status: order.status,
					side: order.side,
					amount: order.amount,
					price: order.price,
					datetime: formatTimestamp(order.timestamp),
					actions: null,
				}));

			this.props.dispatch({ type: 'api.updateOpenOrders', payload: output });
		} catch (exception) {
			console.error(exception);
			this.setState({ error: exception });
			toast.error(exception as string);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async cancelOpenOrder(orderId: string) {
		if (!orderId) return;

		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'cancel_order',
					parameters: {
						id: orderId,
						symbol: 'tSOLtUSDC',
					},
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			this.canceledOrdersRef.add(orderId);

			this.props.dispatch({ type: 'api.updateOpenOrders', payload: this.props.openOrders.filter((order: any) => order.id !== orderId) });

			toast.success(`Order ${orderId} canceled successfully!`);
		} catch (error) {
			console.error('Failed to cancel order:', error);
			toast.error(`Failed to cancel order ${orderId}.`);
		}
	}

	async cancelOpenOrders(orderIds: string[]) {
		if (!orderIds || !(orderIds.length > 0)) return;

		try {
			const promises = orderIds.map(async (orderId: string) => await this.cancelOpenOrder(orderId));
			await Promise.all(promises);

			// toast.success('Selected orders canceled successfully!');
		} catch (exception) {
			// toast.error('An error has occurred while trying to cancel the selected orders.');
		}
	}

	async cancelAllOpenOrders() {
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'cancel_all_orders',
					parameters: {
						symbol: 'tSOLtUSDC',
					},
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			this.props.openOrders.forEach((order: any) => this.canceledOrdersRef.add(order.id));

			this.props.dispatch({ type: 'api.updateOpenOrders', payload: [] });

			toast.success('All orders canceled successfully!');
		} catch (error) {
			console.error('Failed to cancel all orders:', error);
			toast.error('Failed to cancel all orders.');
		}
	}

	render() {
		console.log('render', arguments);

		const { isLoading, error } = this.state;
		const { openOrders } = this.props;

		return (
			<div>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error.message}</div> : null}
				<OrdersTable
					rows={openOrders}
					cancelOpenOrder={this.cancelOpenOrder.bind(this)}
					cancelOpenOrders={this.cancelOpenOrders.bind(this)}
					cancelAllOpenOrders={this.cancelAllOpenOrders.bind(this)}
				/>
			</div>
		);
	}
}

const OrdersBehavior = (props: any) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search);
	const [searchParams] = useSearchParams();
	const handleUnAuthorized = useHandleUnauthorized();

	return (
		<OrdersStructure
			{...props}
			queryParams={queryParams}
			params={params}
			searchParams={searchParams}
			navigate={navigate}
			handleUnAuthorized={handleUnAuthorized}
		/>
	);
};

export const Orders = connect(mapStateToProps)(OrdersBehavior);

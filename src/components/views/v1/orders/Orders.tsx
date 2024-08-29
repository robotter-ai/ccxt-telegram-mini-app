import { connect } from 'react-redux';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { executeAndSetInterval } from 'model/service/recurrent';
import {apiDeleteCancelOrder, apiGetFetchOpenOrders} from 'model/service/api';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import './Orders.css';
import { toast } from 'react-toastify';
import { OrdersTable } from 'components/views/v1/orders/OrdersTable';
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

const mapStateToProps = (state: any) => ({
	openOrders: state.api.orders.open,
});

class OrdersStructure extends Base<OrdersProps, OrdersState> {
	static defaultProps: Partial<BaseProps> = {};

	recurrentIntervalId?: number | ReturnType<typeof setInterval>;
	recurrentDelay: number = 30000;
	canceledOrdersRef: Set<string>;

	constructor(props: OrdersProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		};

		this.canceledOrdersRef = new Set();
	}

	async componentDidMount() {
		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId as number);
		}
	}

	async initialize() {
		await this.fetchData();
	}

	async doRecurrently() {
		this.recurrentIntervalId = executeAndSetInterval(this.fetchData.bind(this), this.recurrentDelay);
	}

	async fetchData() {
		try {
			const response = await apiGetFetchOpenOrders(
				{},
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
		} catch (exception: any) {
			console.error(exception);
			this.setState({ error: exception.message });
			toast.error(exception.message);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async cancelOpenOrder(order: any) {
		if (!order || !order.id) return;

		try {
			const response = await apiDeleteCancelOrder(
				{
						id: order.id,
						symbol: order.market,
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			this.canceledOrdersRef.add(order.id);

			toast.success(`Order ${order.id} canceled successfully!`);

			await this.fetchData();
		} catch (error) {
			console.error('Failed to cancel order:', error);
			toast.error(`Failed to cancel order ${order.id}.`);
			throw error;
		}
	}

	async cancelOpenOrders(orders: readonly any[]) {
		if (!orders || !(orders.length > 0)) return;

		const errors: any[] = [];

		const promises = orders.map(async (order) => {
			try {
				await this.cancelOpenOrder(order);
			} catch (error: any) {
				errors.push(new Error(`Failed to cancel order ${order.id}.`));
			}
		});

		await Promise.all(promises);

		if (errors.length > 0) {
			throw new Error(errors.map(error => error.message).join('\n'));
		}
	}

	async cancelAllOpenOrders(orders: readonly any[]) {
		try {
			await this.cancelOpenOrders(orders);

			this.props.openOrders.forEach((order: any) => this.canceledOrdersRef.add(order.id));

			this.props.dispatch({ type: 'api.updateOpenOrders', payload: [] });

			toast.success('All orders canceled successfully!');
		} catch (error) {
			console.error(error);
			toast.error('Failed to cancel all orders.');
		}
	}

	render() {
		const { isLoading, error } = this.state;
		const { openOrders } = this.props;

		return (
			<div>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
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

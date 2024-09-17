import { Box, styled } from '@mui/material';
import { Order } from 'api/types/orders';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';
import { Map } from 'model/helper/extendable-immutable/map';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { apiDeleteCancelOrder, apiGetFetchOpenOrders } from 'model/service/api';
import { executeAndSetInterval } from 'model/service/recurrent';
import { dispatch } from 'model/state/redux/store';
import { connect } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import OrdersList from './OrdersList';

interface Props extends BaseProps {
	openOrders: Order[];
	marketId: string;
	data: any,
	hasMarketPath: boolean;
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: Props | any) => ({
	openOrders: state.api.orders.open,
});

const Style = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'hasMarketPath',
})<{ hasMarketPath?: boolean }>(({ hasMarketPath }) => ({
	width: '100%',
	height: '100%',
	padding: hasMarketPath ? '0' : '0 24px',
}));

class Structure extends Base<Props, State> {
	static defaultProps: Partial<BaseProps> = {};

	canceledOrdersRef: Set<string>;

	properties: Map = new Map();

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		} as Readonly<State>;

		this.canceledOrdersRef = new Set();

		this.properties.setIn('recurrent.30s.intervalId', undefined);
		this.properties.setIn('recurrent.30s.delay', 30 * 1000);

		this.cancelOpenOrder = this.cancelOpenOrder.bind(this);
		this.cancelOpenOrders = this.cancelOpenOrders.bind(this);
		this.cancelAllOpenOrders = this.cancelAllOpenOrders.bind(this);
	}

	async componentDidMount() {
		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		if (this.properties.getIn<number>('recurrent.30s.intervalId')) {
			clearInterval(this.properties.getIn<number>('recurrent.30s.intervalId'));
		}
	}

	async initialize() {
		await this.fetchData();
	}

	async doRecurrently() {

		// @ts-ignore
		this.properties.setIn(
			'recurrent.30s.intervalId',
			executeAndSetInterval(this.fetchData.bind(this), this.properties.getIn<number>('recurrent.30s.delay'))
		);
	}

	async fetchData() {
		try {
			const response = await this.fetchOpenOrders();
			this.handleFetchResponse(response);
		} catch (exception: any) {
			console.error(exception);
			this.setState({ error: exception.message });
			toast.error(exception.message);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async apiCancelOrder(order: Order) {
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

		return response;
	}

	async cancelOpenOrder(order: Order, suppressToast: boolean = false) {
		if (!order || !order.id) return;

		try {
			await this.apiCancelOrder(order);
			this.canceledOrdersRef.add(order.id);
			await this.fetchData();

			if (!suppressToast) {
				toast.success(`Order ${order.id} canceled successfully!`);
			}
		} catch (error) {
			console.error('Failed to cancel order:', error);
			if (!suppressToast) {
				toast.error(`Failed to cancel order ${order.id}.`);
			}
			throw error;
		}
	}

	async cancelOpenOrders(orders: readonly Order[]) {
		if (!orders || !(orders.length > 0)) return;

		const errors: any[] = [];

		const promises = orders.map(async (order) => {
			try {
				await this.cancelOpenOrder(order);
			} catch (error: any) {
				errors.push(error);
			}
		});

		await Promise.all(promises);

		if (errors.length > 0) {
			const errorMessage = errors.map(error => error.message).join('\n');
			toast.error(`Failed to cancel some orders: ${errorMessage}`);
			throw new Error(errorMessage);
		}
	}

	async cancelAllOpenOrders(orders: readonly Order[]) {
		if (!orders || orders.length === 0) return;

		try {
			const { successes, failures } = await this.processOrderCancellations(orders, true);

			this.props.openOrders.forEach((order: any) => this.canceledOrdersRef.add(order.id));
			dispatch('api.updateOpenOrders', []);

			this.displaySummaryToast(successes, failures);
		} catch (error) {
			console.error('Failed to cancel all orders:', error);
			toast.error('An unexpected error occurred while canceling orders.');
		}
	}

	private async processOrderCancellations(orders: readonly Order[], suppressToast: boolean) {
		const successes: string[] = [];
		const failures: string[] = [];

		await Promise.all(orders.map(async (order) => {
			try {
				await this.cancelOpenOrder(order, suppressToast);
				successes.push(order.id);
			} catch (error) {
				const errorMessage = this.extractErrorMessage(error);
				failures.push(errorMessage);
			}
		}));

		return { successes, failures };
	}

	private displaySummaryToast(successes: string[], failures: string[]) {
		if (successes.length > 0) {
			const orderText = successes.length === 1 ? 'order' : 'orders';
			toast.success(`Cancelment successfully requested for ${successes.length} ${orderText}.`, {
				toastId: 'success-summary',
				style: { whiteSpace: 'pre-line', wordWrap: 'break-word' },
			});
		}

		if (failures.length > 0) {
			const formattedFailures = failures.map((failure, index) => `${index + 1}. ${failure}`).join('\n');

			toast.error(`Failed to cancel ${failures.length} order(s):\n${formattedFailures}`, {
				toastId: 'error-summary',
				style: { whiteSpace: 'pre-line', wordWrap: 'break-word' },
			});
		}
	}

	private extractErrorMessage(error: any,): string {
		const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
		return `${errorMessage}`;
	}

	render() {
		const { isLoading, error } = this.state;
		const { data, hasMarketPath } = this.props;

		return (
			<Style hasMarketPath={hasMarketPath}>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
				<pre>{JSON.stringify(data, null, 2)}</pre>
				<OrdersList
					hasMarketPath={hasMarketPath}
					orders={this.props.marketId ? this.props.openOrders.filter((order: Order) => order.market.toUpperCase() === this.props.marketId) : this.props.openOrders}
					handleCancelAllOpenOrders={this.cancelAllOpenOrders}
					handleCancelOrder={this.cancelOpenOrder}
				/>
			</Style>
		);
	}

	private async fetchOpenOrders() {
		return await apiGetFetchOpenOrders(
			{
			},
			this.props.handleUnAuthorized
		);
	}

	private handleFetchResponse(response: any) {
		if (response.status !== 200) {
			throw new Error('Network response was not OK');
		}

		const payload = response.data;

		if (!Array.isArray(payload.result)) {
			throw new Error('Unexpected API response format');
		}

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
				datetime: order.timestamp,
				actions: null,
			}));

		dispatch('api.updateOpenOrders', output);
	}

}

const Behavior = (props: any) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search)
	const [searchParams] = useSearchParams();
	const handleUnAuthorized = useHandleUnauthorized();

	return <Structure
		{...props}
		location={location}
		navigate={navigate}
		params={params}
		queryParams={queryParams}
		searchParams={searchParams}
		handleUnAuthorized={handleUnAuthorized}
	/>;
};

// noinspection JSUnusedGlobalSymbols
export const Orders = connect(mapStateToProps)(Behavior);

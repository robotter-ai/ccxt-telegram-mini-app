import {connect} from 'react-redux';
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {Box, styled} from '@mui/material';
import {Map} from 'model/helper/extendable-immutable/map';
import {executeAndSetInterval} from 'model/service/recurrent';
import {dispatch} from 'model/state/redux/store';
import {apiPostRun} from 'model/service/api';
import {useHandleUnauthorized} from 'model/hooks/useHandleUnauthorized';
import {Base, BaseProps, BaseState} from 'components/base/Base';
import {Spinner} from 'components/views/v2/layout/spinner/Spinner';
import OrdersList from './OrdersList';
import {Order} from "components/views/v2/orders/Order";

interface Props extends BaseProps {
	openOrders: any;
	market: string;
	data: any,
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

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Box)(({theme}) => ({
	width: '100%',
	height: '100%',
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
			this.setState({error: exception.message});
			toast.error(exception.message);
		} finally {
			this.setState({isLoading: false});
		}
	}

	private async fetchOpenOrders() {
		return await apiPostRun(
			{
				exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
				environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
				method: 'fetch_open_orders',
				parameters: {},
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

	async apiCancelOrder(order: any, handleUnAuthorized: () => void) {
		const response = await apiPostRun(
			{
				exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
				environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
				method: 'cancel_order',
				parameters: {
					id: order.id,
					symbol: order.market,
				},
			},
			handleUnAuthorized
		);

		if (response.status !== 200) {
			throw new Error('Network response was not OK');
		}

		return response;
	}

	async cancelOpenOrder(order: Order) {
		if (!order || !order.id) return;

		try {
			await this.apiCancelOrder(order, this.props.handleUnAuthorized);

			this.canceledOrdersRef.add(order.id);

			toast.success(`Order ${order.id} canceled successfully!`);

			await this.fetchData();
		} catch (error) {
			console.error('Failed to cancel order:', error);
			toast.error(`Failed to cancel order ${order.id}.`);
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
				errors.push(new Error(`Failed to cancel order ${order.id}.`));
			}
		});

		await Promise.all(promises);

		if (errors.length > 0) {
			throw new Error(errors.map(error => error.message).join('\n'));
		}
	}

	async cancelAllOpenOrders(orders: readonly Order[]) {
		try {
			await this.cancelOpenOrders(orders);

			this.props.openOrders.forEach((order: any) => this.canceledOrdersRef.add(order.id));

			dispatch('api.updateOpenOrders', []);

			toast.success('All orders canceled successfully!');
		} catch (error) {
			console.error(error);
			toast.error('Failed to cancel all orders.');
		}
	}

	render() {
		const {isLoading, error} = this.state;
		const {data} = this.props;

		return (
			<Style>
				{isLoading ? <Spinner/> : null}
				{error ? <div>Error: {error}</div> : null}
				<pre>{JSON.stringify(data, null, 2)}</pre>
				<OrdersList
					orders={this.props.market ? this.props.openOrders.filter((order: Order) => order.market === this.props.market) : this.props.openOrders}
					canceledOrdersRef={this.canceledOrdersRef}
					cancelAllOpenOrders={this.cancelAllOpenOrders}
					fetchData={this.fetchData}
				/>
			</Style>
		);
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

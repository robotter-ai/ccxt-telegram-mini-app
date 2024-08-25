import { connect } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Box, styled } from '@mui/material';
import { Map } from 'model/helper/extendable-immutable/map';
import { executeAndSetInterval } from 'model/service/recurrent';
import { dispatch } from 'model/state/redux/store';
import { apiPostRun } from 'model/service/api';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';
import OrdersList from './OrdersList';

interface Props extends BaseProps {
	openOrders: any;
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
const Style = styled(Box)(({ theme }) => ({
}));

class Structure extends Base<Props, State> {
	static defaultProps: Partial<BaseProps> = {};

	recurrentIntervalId?: number | ReturnType<typeof setInterval>;
	recurrentDelay: number = 30000;
	canceledOrdersRef: Set<string>;

	properties: Map = new Map();

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		} as Readonly<State>;

		this.canceledOrdersRef = new Set();

		this.properties.setIn('recurrent.5s.intervalId', undefined);
		this.properties.setIn('recurrent.5s.delay', 5 * 1000);
	}

	async componentDidMount() {
		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		if (this.properties.getIn<number>('recurrent.5s.intervalId')) {
			clearInterval(this.properties.getIn<number>('recurrent.5s.intervalId'));
		}
	}

	render() {
		const { isLoading, error } = this.state;
		const { data } = this.props;

		// const orders = [
		// 	{
		// 		checkbox: false,
		// 		id: '1',
		// 		market: 'tSOLtUSDC',
		// 		status: 'open',
		// 		side: 'buy',
		// 		amount: '1',
		// 		price: 100,
		// 		datetime: '2021-10-02 12:00:00',
		// 		actions: null,
		// 	},
		// 	{
		// 		checkbox: false,
		// 		id: '2',
		// 		market: 'tBTCtUSDC',
		// 		status: 'open',
		// 		side: 'sell',
		// 		amount: '0.1',
		// 		price: 60000,
		// 		datetime: '2021-10-01 12:00:00',
		// 		actions: null,
		// 	},
		// 	{
		// 		checkbox: false,
		// 		id: '3',
		// 		market: 'tSOLtUSDC',
		// 		status: 'open',
		// 		side: 'buy',
		// 		amount: '1',
		// 		price: 100,
		// 		datetime: '2021-10-02 12:00:00',
		// 		actions: null,
		// 	},
		// 	{
		// 		checkbox: false,
		// 		id: '4',
		// 		market: 'tBTCtUSDC',
		// 		status: 'open',
		// 		side: 'sell',
		// 		amount: '0.1',
		// 		price: 60000,
		// 		datetime: '2021-10-01 12:00:00',
		// 		actions: null,
		// 	},
		// 	{
		// 		checkbox: false,
		// 		id: '5',
		// 		market: 'tSOLtUSDC',
		// 		status: 'open',
		// 		side: 'buy',
		// 		amount: '1',
		// 		price: 100,
		// 		datetime: '2021-10-02 12:00:00',
		// 		actions: null,
		// 	},
		// 	{
		// 		checkbox: false,
		// 		id: '6',
		// 		market: 'tBTCtUSDC',
		// 		status: 'open',
		// 		side: 'sell',
		// 		amount: '0.1',
		// 		price: 60000,
		// 		datetime: '2021-10-01 12:00:00',
		// 		actions: null,
		// 	},
		// 	{
		// 		checkbox: false,
		// 		id: '7',
		// 		market: 'tSOLtUSDC',
		// 		status: 'open',
		// 		side: 'buy',
		// 		amount: '1',
		// 		price: 100,
		// 		datetime: '2021-10-02 12:00:00',
		// 		actions: null,
		// 	},
		// 	{
		// 		checkbox: false,
		// 		id: '8',
		// 		market: 'tBTCtUSDC',
		// 		status: 'open',
		// 		side: 'sell',
		// 		amount: '0.1',
		// 		price: 60000,
		// 		datetime: '2021-10-01 12:00:00',
		// 		actions: null,
		// 	}
		// ]

		return (
			<Style>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
				<pre>{JSON.stringify(data, null, 2)}</pre>
				<OrdersList
					orders={this.props.openOrders}
					canceledOrdersRef={this.canceledOrdersRef}
					cancelAllOpenOrders={this.cancelAllOpenOrders}
					fetchData={this.fetchData}
				/>
			</Style>
		);
	}

	async initialize() {
		// try {
		// 	const response = await apiPostRun(
		// 		{
		// 			method: 'fetch_tickers',
		// 			parameters: {
		// 				symbols: ['tSOLtUSDC', 'tBTCtUSDC'],
		// 			},
		// 		},
		// 		this.props.handleUnAuthorized
		// 	);
		//
		// 	if (response.status !== 200) {
		// 		if (response.data?.title) {
		// 			const message = response.data.title;
		//
		// 			this.setState({ error: message });
		// 			toast.error(message);
		//
		// 			return;
		// 		} else {
		// 			// noinspection ExceptionCaughtLocallyJS
		// 			throw new Error(response.text);
		// 		}
		// 	}
		//
		// 	const payload = response.data.result;
		//
		// 	dispatch('api.updateTemplateData', payload);
		// } catch (exception: any) {
		// 	console.error(exception);
		//
		// 	if (axios.isAxiosError(exception)) {
		// 		if (exception?.response?.status === 401) {
		// 			return;
		// 		}
		// 	}
		//
		// 	const message = 'An error has occurred while performing this operation.'
		//
		// 	this.setState({ error: message });
		// 	toast.error(message);
		// } finally {
		// 	this.setState({ isLoading: false });
		// }
		await this.fetchData();
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			try {
				const response = await apiPostRun(
					{
						method: 'fetch_tickers',
						parameters: {
							symbols: ['tSOLtUSDC', 'tBTCtUSDC'],
						},
					},
					this.props.handleUnAuthorized
				);

				if (response.status !== 200) {
					if (response.data?.title) {
						const message = response.data.title;

						this.setState({ error: message });
						toast.error(message);

						return;
					} else {
						// noinspection ExceptionCaughtLocallyJS
						throw new Error(response.text);
					}
				}

				const payload = response.data.result;

				dispatch('api.updateTemplateData', payload);
			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						return;
					}
				}

				const message = 'An error has occurred while performing this operation.'

				this.setState({ error: message });
				toast.error(message);

				clearInterval(this.properties.getIn<number>('recurrent.5s.intervalId'));
			}
		};

		// @ts-ignore
		this.properties.setIn(
			'recurrent.5s.intervalId',
			executeAndSetInterval(recurrentFunction, this.properties.getIn<number>('recurrent.5s.delay'))
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

	async cancelOpenOrder(order: any) {
		if (!order || !order.id) return;

		try {
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

			dispatch('api.updateOpenOrders', []);

			toast.success('All orders canceled successfully!');
		} catch (error) {
			console.error(error);
			toast.error('Failed to cancel all orders.');
		}
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

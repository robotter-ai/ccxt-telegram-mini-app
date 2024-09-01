import {connect} from 'react-redux';
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import axios from 'axios';
import {Box, SelectChangeEvent, styled} from '@mui/material';
import {Map} from 'model/helper/extendable-immutable/map';
import {executeAndSetInterval} from 'model/service/recurrent';
import {dispatch} from 'model/state/redux/store';
import {apiPostRun} from 'model/service/api';
import {useHandleUnauthorized} from 'model/hooks/useHandleUnauthorized';
import {Base, BaseProps, BaseState} from 'components/base/Base';
import {Spinner} from 'components/views/v2/layout/spinner/Spinner';
import DropDownSelector from "components/general/DropdownSelector";
import {ChangeEvent} from "react";
import Button, {ButtonType} from "components/general/Button";
import ButtonGroupToggle from "components/general/ButtonGroupToggle";
import {Market} from "api/types/markets";
import {formatPrice} from "components/views/v2/utils/utils";
import NumberInput from "components/general/NumberInput";
import Decimal from "decimal.js";
import {OrderSide, OrderType} from "api/types/orders";

const OrderSideLabelMapper = {[OrderSide.BUY]: 'Buy', [OrderSide.SELL]: 'Sell'};
const OrderTypeLabelMapper = {[OrderType.MARKET]: 'Market', [OrderType.LIMIT]: 'Limit'};

interface Props extends BaseProps {
	marketId?: string;
	markets: Market[];
	data: any;
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
	selectedMarket?: string;
	marketPrice?: number;
	orderSide: OrderSide;
	orderType: OrderType;
	amount: number;
	price?: number;
	isSubmitting?: boolean;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: Props | any) => ({
	markets: state.api.markets,
	data: state.api.template.data,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Box)(({theme}) => ({
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing(3),
}));

const TotalContainer = styled(Box)(({theme}) => ({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	padding: '0.5rem 1.5rem',
	marginTop: theme.spacing(2),
	fontWeight: 'bold',
}));

class Structure extends Base<Props, State> {

	properties: Map = new Map();

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
			selectedMarket: undefined,
			marketPrice: 0,
			orderSide: OrderSide.BUY,
			orderType: OrderType.MARKET,
			amount: 0,
			price: 0,
			isSubmitting: false,
		} as Readonly<State>;

		this.properties.setIn('recurrent.5s.intervalId', undefined);
		this.properties.setIn('recurrent.5s.delay', 5 * 1000);

		this.handleMarketChange = this.handleMarketChange.bind(this);
		this.handleOrderTypeChange = this.handleOrderTypeChange.bind(this);
		this.handleAmountChange = this.handleAmountChange.bind(this);
		this.handlePriceChange = this.handlePriceChange.bind(this);
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

	handleMarketChange(event: SelectChangeEvent) {
		this.setState({selectedMarket: event.target.value});
		this.getTotalPrice(event.target.value);
	};

	handleOrderTypeChange(event: SelectChangeEvent) {
		this.setState({orderType: event.target.value as OrderType});
	};

	handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
		if (this.props.marketId) {
			this.getTotalPrice(this.props.marketId);
		}

		const isValidAmount = !(isNaN(parseFloat(event.target.value)) || parseFloat(event.target.value) < 0);
		this.setState({ amount: isValidAmount ? parseFloat(event.target.value) : 0 });
	}

	handlePriceChange(event: ChangeEvent<HTMLInputElement>) {
		const isValidPrice = !(isNaN(parseFloat(event.target.value)) || parseFloat(event.target.value) < 0);
		this.setState({ price: isValidPrice ? parseFloat(event.target.value) : 0 });
	}

	async getTotalPrice(marketId: string) {
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_ticker',
					parameters: { symbol: marketId },
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				if (response.data?.title) {
					const message = response.data.title;

					this.setState({error: message});
					toast.error(message);

					return;
				} else {
					throw new Error(response.text);
				}
			}

			const payload = response.data.result;

			this.setState({marketPrice: Number(payload.last)});
			return;
		} catch (exception) {
			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation';

			this.setState({error: message});
			toast.error(message);
		}
	};

	render() {
		const {isLoading, error, selectedMarket, amount, price, orderType} = this.state;
		const {markets} = this.props;

		const orderSideButtons = [
			{label: OrderSideLabelMapper[OrderSide.BUY], onClick: () => this.setState({orderSide: OrderSide.BUY})},
			{label: OrderSideLabelMapper[OrderSide.SELL], onClick: () => this.setState({orderSide: OrderSide.SELL})},
		];


		const orderTypeButtons = [
			{label: OrderTypeLabelMapper[OrderType.MARKET], onClick: () => this.setState({orderType: OrderType.MARKET})},
			{label: OrderTypeLabelMapper[OrderType.LIMIT], onClick: () => this.setState({orderType: OrderType.LIMIT})},
		];

		const marketOptions = markets.map((market) => ({
			value: market.symbol,
			label: `${market.base}/${market.quote}`,
		}))

		const getTotal = (orderType: OrderType) => {
			switch (orderType) {
				case OrderType.LIMIT:
					return formatPrice(Decimal.mul(new Decimal(amount), new Decimal(price ?? 0)).toNumber());
				default:
					return formatPrice(Decimal.mul(new Decimal(amount), new Decimal(this.state.marketPrice ?? 0)).toNumber());
			}
		};

		const handleCreateOrder = async () => {
			this.setState({isSubmitting: true});

			const {selectedMarket, orderSide, orderType, amount, price} = this.state;

			const market = this.props.marketId ? markets.find((m) => m.symbol.toUpperCase() === this.props.marketId)?.symbol : selectedMarket;

			try {
				if (!market) {
					toast.error('Selected market is not valid.');
					return;
				}

				const response = await apiPostRun(
					{
						exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
						environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
						method: 'create_order',
						parameters: {
							symbol: market,
							side: orderSide,
							type: orderType,
							amount: amount,
							price: orderType === OrderType.MARKET ? null : price,
						},
					},
					this.props.handleUnAuthorized
				);

				if (response.status !== 200) {
					throw new Error('Network response was not OK');
				}

				toast.success('Order created successfully!');

				this.props.navigate('/orders');
			} catch (error) {
				console.error('Failed to create order:', error);
				toast.error('Failed to create order.');
			}
			finally {
				this.setState({isSubmitting: false});
			}
		};


		return (
			<Style>
				{isLoading ? <Spinner/> : null}
				{error ? <div>Error: {error}</div> : null}
				{!this.props.marketId &&
					<DropDownSelector
						label={'Market'}
						options={marketOptions}
						value={selectedMarket ?? ''}
						onChange={this.handleMarketChange}
					/>}
				<ButtonGroupToggle buttons={orderSideButtons} defaultButton={0}/>
				<ButtonGroupToggle buttons={orderTypeButtons} defaultButton={0}/>
				<NumberInput label={'Amount'} value={amount} precision={4} onChange={this.handleAmountChange}/>
				{orderType === OrderType.LIMIT && <NumberInput label={'Price'} value={price ?? 0} onChange={this.handlePriceChange}/>}
				<TotalContainer>
					<span>Total</span>
					<span>{getTotal(orderType)}</span>
				</TotalContainer>
				<Button
					value={this.state.isSubmitting ? 'Submitting...' : OrderSideLabelMapper[this.state.orderSide]}
					type={ButtonType.Full}
					disabled={this.state.isSubmitting}
					onClick={async (e) => {
						e?.preventDefault();
						e?.stopPropagation();
						await handleCreateOrder();
					}}/>
			</Style>
		);
	}

	async initialize() {
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

					this.setState({error: message});
					toast.error(message);

					return;
				} else {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(response.text);
				}
			}

			const payload = response.data.result;

			dispatch('api.updateTemplateData', payload);
		} catch (exception: any) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation.'

			this.setState({error: message});
			toast.error(message);
		} finally {
			this.setState({isLoading: false});
		}
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

						this.setState({error: message});
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

				this.setState({error: message});
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
export const CreateOrder = connect(mapStateToProps)(Behavior);

import axios from 'axios';
import Decimal from 'decimal.js';
import { Market } from 'api/types/markets';
import { Check } from '@mui/icons-material';
import { Box, SelectChangeEvent, styled, Typography } from '@mui/material';
import { OrderSide, OrderType } from 'api/types/orders';
import { Map } from 'model/helper/extendable-immutable/map';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import Button, { ButtonType } from 'components/general/Button';
import ButtonGroupToggle from 'components/general/ButtonGroupToggle';
import DropDownSelector from 'components/general/DropdownSelector';
import NumberInput from 'components/general/NumberInput';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';
import { formatPrice } from 'components/views/v2/utils/utils';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import {
	apiGetFetchBalance,
	apiGetFetchOpenOrders,
	apiGetFetchTicker,
	apiGetFetchTickers,
	apiPostCreateOrder
} from 'model/service/api';
import { dispatch } from 'model/state/redux/store';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import { ChangeEvent } from 'react';
import { connect } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { executeAndSetInterval } from 'model/service/recurrent';
import {Constant} from "model/enum/constant";

const OrderSideLabelMapper = { [OrderSide.BUY]: 'Buy', [OrderSide.SELL]: 'Sell' };
const OrderTypeLabelMapper = { [OrderType.MARKET]: 'Market', [OrderType.LIMIT]: 'Limit' };

const Style = styled(Box)({
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column'
});

const InputsContainer = styled(Box)({
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	gap: '40px'
});

const TotalContainer = styled(Box)(({ theme }) => ({
	width: '100%',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	fontSize: '17px',
	fontWeight: '300',
	fontFamily: theme.fonts.primary
}));

const StyledTotalPrice = styled(Typography)(({ theme }) => ({
	fontSize: '19px',
	fontWeight: '300',
	fontFamily: theme.fonts.secondary,
	color: theme.palette.primary.main
}));

const Divider = styled(Box)(({ theme }) => ({
	width: '100%',
	marginTop: '20px',
	marginBottom: '20px',
	borderBottom: '0.5px solid',
	borderColor: theme.palette.primary.main,
	opacity: 0.2
}));

const ButtonContainer = styled(Box)({
	marginTop: '22px',
	marginBottom: '10px',
	width: '100%',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center'
});

interface Props extends BaseProps {
	markets: Market[];
	marketId?: string;
	updateBalanceData: (data: any) => void;
	marketPrecision: number;
}

interface State extends BaseState {
	price: string;
	error?: string;
	amount: string;
	limit: string;
	tickers: { [key: string]: any };
	precision: number;
	orderSide: OrderSide;
	isLoading: boolean;
	orderType: OrderType;
	marketPrice?: number;
	selectedMarket?: string;
	isSubmitting?: boolean;
	balanceData: any;
}

// @ts-ignore
const mapStateToProps = (state: State | any, props: Props | any) => ({
	data: state.api.template.data,
	markets: state.api.markets,
	balanceData: state.api.balanceData,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
const mapDispatchToProps = (reduxDispatch: any) => ({
	updateBalanceData(data: any) {
		dispatch('api.updateBalanceData', data);
	},
});


class Structure extends Base<Props, State> {
	properties: Map = new Map();

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
			selectedMarket: undefined,
			isSubmitting: false,
			marketPrice: 0,
			precision: 4,
			orderSide: OrderSide.BUY,
			orderType: OrderType.MARKET,
			limit: '0',
			price: '0',
			amount: '0',
			tickers: {},
			balanceData: null,
		} as Readonly<State>;

		this.properties.setIn('recurrent.5s.intervalId', undefined);
		this.properties.setIn('recurrent.5s.delay', 5 * 1000);

		this.handleMarketChange = this.handleMarketChange.bind(this);
		this.handleOrderTypeChange = this.handleOrderTypeChange.bind(this);
		this.handleAmountChange = this.handleAmountChange.bind(this);
		this.handlePriceChange = this.handlePriceChange.bind(this);
		this.handleCreateOrder = this.handleCreateOrder.bind(this);
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

	async initialize() {
		try {
			const balanceResponse = await apiGetFetchBalance(
				{},
				this.props.handleUnAuthorized
			);

			if (balanceResponse.status !== 200) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error('Failed to fetch balance');
			}

			const balanceData = balanceResponse.data.result;
			console.log('Fetched balance data:', balanceData);
			this.setState({ balanceData });

			const tickersResponse = await apiGetFetchTickers({}, this.props.handleUnAuthorized);

			if (tickersResponse.status !== 200) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error('Failed to fetch tickers');
			}

			const allTickers = tickersResponse.data.result;

			console.log('tickers:', allTickers);
			this.setState({ tickers: allTickers });
		} catch (error) {
			console.error('Error fetching balance or tickers:', error);
			this.setState({ error: 'Failed to load balance' });
			toast.error('Failed to load balance');
		} finally {
			this.setState({ isLoading: false });
		}

		if (this.props.marketId) {
			const market = this.props.markets.find((m) => m.symbol.toUpperCase() === this.props.marketId);
			const precision = market?.precision?.amount ?? (market?.precision as unknown as number);
			this.setState({ precision: precision ?? 4 });
		}

		this.setState({ isLoading: false });
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			try {
				const response = await apiGetFetchBalance({}, this.props.handleUnAuthorized);

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

				this.props.updateBalanceData(payload);
			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						return;
					}
				}

				const message = 'An error has occurred while performing this operation.';

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

	calculateTotalBalanceUSDC() {
		const { balanceData, tickers } = this.state;

		if (!balanceData) {
			return 0;
		}

		const totalBalanceUSDC = Object.entries(balanceData.total).reduce((acc, balance: any) => {
			const asset = balance[0];
			const market = `${asset}${Constant.currentUSDCurrency.value}`.toUpperCase();
			const amount = balance[1];
			const ticker = Object.values(tickers).find((ticker: any) => ticker.symbol.toUpperCase() === market);
			const price = Constant.usdCurrencies.value.includes(asset) ? 1 : (ticker?.last || 0);

			return acc + price * amount;
		}, 0);

		return totalBalanceUSDC;
	}

	validateAmount(newAmount: string) {
		const { orderSide, balanceData } = this.state;
		const selectedMarketSymbol = this.props.marketId || this.state.selectedMarket;
		const totalBalanceUSDC = this.calculateTotalBalanceUSDC();

		if (!balanceData) {
			return false;
		}

		if (orderSide === OrderSide.BUY) {
			const requiredUSDC = parseFloat(newAmount) * (this.state.marketPrice || 1);

			if (requiredUSDC > totalBalanceUSDC) {
				toast.error(`You do not have enough USDC to buy this amount.`);
				return false;
			}
		}

		if (!selectedMarketSymbol) {
			toast.error('Market symbol is undefined');
			return false;
		}

		if (orderSide === OrderSide.SELL) {
			const balance = balanceData?.total?.[selectedMarketSymbol] || 0;

			if (!selectedMarketSymbol) {
				toast.error('Market symbol is undefined');
				return false;

			}

			if (parseFloat(newAmount) > balance) {
				toast.error(`You do not have enough ${selectedMarketSymbol} to sell this amount.`);
				return false;
			}
		}

		return true;
	}

	handleMarketChange(event: SelectChangeEvent) {
		this.setState({ selectedMarket: event.target.value });

		const market = this.props.markets.find((m) => m.symbol.toUpperCase() === this.props.marketId);
		const precision = market?.precision?.amount ?? (market?.precision as unknown as number);
		this.setState({ precision: precision ?? 4 });

		this.getTotalPrice(event.target.value).catch((error) => {
			console.error('GetTotalPrice Error: ', error);
			toast.error("Couldn't calculate total price");
		});
	}

	handleOrderTypeChange(event: SelectChangeEvent) {
		this.setState({ orderType: event.target.value as OrderType });
	}

	handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
		const newAmount = event.target.value;

		if (!this.validateAmount(newAmount)) {
			return;
		}

		this.setState({ amount: newAmount });

		if (this.props.marketId) {
			this.getTotalPrice(this.props.marketId).catch((error) => {
				console.error('GetTotalPrice Error: ', error);
				toast.error("Couldn't calculate total price");
			});
		}

		const isValidAmount = !(isNaN(parseFloat(event.target.value)) || parseFloat(event.target.value) < 0);
		this.setState({ amount: isValidAmount ? event.target.value : '0' });
	}

	handlePriceChange(event: ChangeEvent<HTMLInputElement>) {
		const newLimit = event.target.value;

		if (!this.validateAmount(newLimit)) {
			return;
		}

		this.setState({ limit: newLimit });

		if (this.props.marketId) {
			this.getTotalPrice(this.props.marketId).catch((error) => {
				console.error('GetTotalPrice Error: ', error);
				toast.error("Couldn't calculate total price");
			});
		}

		const isValidPrice = !(isNaN(parseFloat(event.target.value)) || parseFloat(event.target.value) < 0);
		this.setState({ price: isValidPrice ? event.target.value : '0' });
	}

	async handleCreateOrder() {
		this.setState({ isSubmitting: true });

		const { selectedMarket, orderSide, orderType, amount, price } = this.state;

		const market = this.props.marketId
			? this.props.markets.find((m) => m.symbol.toUpperCase() === this.props.marketId)?.symbol
			: selectedMarket;

		try {
			if (!market) {
				throw new Error('Selected market is not valid.');
			}

			if (orderType === OrderType.LIMIT && (!price || parseFloat(price) <= 0)) {
				throw new Error('Invalid price. Please enter a valid price for a limit order.');
			}

			const response = await apiPostCreateOrder(
				{
					symbol: market,
					side: orderSide,
					type: orderType,
					amount: new Decimal(amount).toNumber(),
					price: orderType === OrderType.MARKET || price === undefined ? null : new Decimal(price).toNumber()
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			toast.success('Order created successfully!');

			await this.fetchOpenOrders();
		} catch (error: any) {
			console.error('Failed to create order:', error);

			const errorMessage = this.extractErrorMessage(error);

			toast.error(errorMessage, {
				style: { whiteSpace: 'pre-line', wordWrap: 'break-word' }
			});
		} finally {
			this.setState({ isSubmitting: false });
		}
	}

	private extractErrorMessage(error: any): string {
		return error.response?.data?.message || error.message || 'Failed to create order due to an unknown error.';
	}

	async fetchOpenOrders() {
		const response = await apiGetFetchOpenOrders({}, this.props.handleUnAuthorized);

		if (response.status !== 200) {
			throw new Error('Network response was not OK');
		}

		const payload = response.data;

		if (!Array.isArray(payload.result)) {
			throw new Error('Unexpected API response format');
		}

		const output = payload.result.map((order: any) => ({
			checkbox: false,
			id: order.id,
			market: order.symbol,
			status: order.status,
			side: order.side,
			amount: order.amount,
			price: order.price,
			datetime: order.timestamp,
			actions: null
		}));

		dispatch('api.updateOpenOrders', output);
	}

	async getTotalPrice(marketId: string) {
		const handleException = (exception: unknown) => {
			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = "Couldn't get total price";

			this.setState({ error: message });
			toast.error(message);
		};

		const handleResponse = (response: any) => {
			if (response.status !== 200) {
				const message = response.data.title ?? response.text;

				this.setState({ error: message });
				toast.error(message);
			}

			const payload = response.data.result;

			this.setState({ marketPrice: Number(payload.last) });
		};

		try {
			const response = await apiGetFetchTicker(
				{
					symbol: marketId
				},
				this.props.handleUnAuthorized
			);

			handleResponse(response);
		} catch (exception) {
			handleException(exception);
		}
	}

	render() {
		const { isLoading, error, selectedMarket, amount, price, orderType, orderSide, precision } = this.state;
		const { markets, marketPrecision } = this.props;


		const orderSideButtons = [
			{
				label: OrderSideLabelMapper[OrderSide.BUY],
				onClick: () => this.setState({ orderSide: OrderSide.BUY }),
				activeColor: MaterialUITheme.palette.success.main
			},
			{
				label: OrderSideLabelMapper[OrderSide.SELL],
				onClick: () => this.setState({ orderSide: OrderSide.SELL }),
				activeColor: MaterialUITheme.palette.error.main
			}
		];

		const orderTypeButtons = [
			{ label: OrderTypeLabelMapper[OrderType.MARKET], onClick: () => this.setState({ orderType: OrderType.MARKET }) },
			{ label: OrderTypeLabelMapper[OrderType.LIMIT], onClick: () => this.setState({ orderType: OrderType.LIMIT }) }
		];

		const marketOptions = markets.map((market) => ({
			value: market.symbol,
			label: `${market.base}/${market.quote}`
		}));

		const getTotal = (side: OrderSide, type: OrderType) => {
			let total: Decimal;

			if (type === OrderType.LIMIT) {
				if (side === OrderSide.BUY) {
					total = Decimal.mul(new Decimal(amount), new Decimal(price ?? 0));
				} else {
					total = Decimal.mul(new Decimal(amount), new Decimal(price ?? 0));
				}
			} else {
				total = Decimal.mul(new Decimal(amount), new Decimal(this.state.marketPrice ?? 0));
			}

			return total.toFixed();
		};

		let validationMessage = '';


		return (
			<Style>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
				<InputsContainer>
					{!this.props.marketId && (
						<DropDownSelector
							label={'MARKET'}
							options={marketOptions}
							value={selectedMarket ?? ''}
							onChange={this.handleMarketChange}
						/>
					)}
					<ButtonGroupToggle buttons={orderSideButtons} defaultButton={0} />
					<ButtonGroupToggle buttons={orderTypeButtons} defaultButton={0} />
					<NumberInput
						label={'AMOUNT'}
						value={amount ?? '0'}
						precision={marketPrecision}
						onChange={this.handleAmountChange}
					/>
					{orderType === OrderType.LIMIT && (
						<NumberInput
							label={'SET PRICE'}
							value={price ?? '0'}
							precision={marketPrecision}
							onChange={this.handlePriceChange}
						/>
					)}
					{validationMessage && <Typography color="error">{validationMessage}</Typography>}
				</InputsContainer>
				<Divider />
				<TotalContainer>
					<span>Total</span>
					<StyledTotalPrice>{formatPrice(getTotal(orderSide, orderType), precision)}</StyledTotalPrice>
				</TotalContainer>
				<ButtonContainer>
					<Button
						value={this.state.isSubmitting ? 'Order placed' : OrderSideLabelMapper[this.state.orderSide]}
						type={ButtonType.Full}
						icon={this.state.isSubmitting ? <Check sx={{ paddingTop: '-4px' }} /> : undefined}
						disabled={
							!this.handleAmountChange || Number(getTotal(orderSide, orderType)) === 0 || this.state.isSubmitting
						}
						onClick={async (e) => {
							e?.preventDefault();
							e?.stopPropagation();
							await this.handleCreateOrder();
						}}
					/>
				</ButtonContainer>
			</Style>
		);
	}
}

const Behavior = (props: any) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search);
	const [searchParams] = useSearchParams();
	const handleUnAuthorized = useHandleUnauthorized();

	return (
		<Structure
			{...props}
			location={location}
			navigate={navigate}
			params={params}
			queryParams={queryParams}
			searchParams={searchParams}
			handleUnAuthorized={handleUnAuthorized}
		/>
	);
};

export const CreateOrder = connect(mapStateToProps, mapDispatchToProps)(Behavior);

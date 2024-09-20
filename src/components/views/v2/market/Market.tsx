import {Box, IconButton, styled} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import axios from 'axios';
import {Base, BaseProps, BaseState, withHooks} from 'components/base/Base';
import {CreateOrder} from 'components/views/v2/order/CreateOrder';
import {Orders} from 'components/views/v2/orders/Orders';
import {formatPrice, formatVolume, getPrecision} from 'components/views/v2/utils/utils';
import {IChartApi, UTCTimestamp} from 'lightweight-charts';
import {Map} from 'model/helper/extendable-immutable/map';
import {apiGetFetchOHLCV, apiGetFetchOrderBook, apiGetFetchTicker} from 'model/service/api';
import {executeAndSetInterval} from 'model/service/recurrent';
import {dispatch} from 'model/state/redux/store';
import {createRef} from 'react';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';
import {Spinner} from '../layout/spinner/Spinner';
import CandleChart from './CandleChart';
import LineChart from './LineChart';
import {BookChart} from 'components/views/v2/market/BookChart';
import {TimeSwitch} from 'components/views/v2/market/charts/TimeSwitch';
import {DepthChart} from "components/views/v2/market/DepthChart";
import {SliderWithInput} from 'components/views/v2/market/charts/SliderWithInput';

const ChartModeContainer = styled(Box)({
	display: 'flex',
	justifyContent: 'center',
	margin: '10px 0',
});

const StyledIconButton = styled(IconButton)<{ isSelected: boolean }>(({ isSelected, theme }) => ({
	backgroundColor: isSelected ? theme.palette.background.paper : theme.palette.background.default,
	color: isSelected ? theme.palette.text.primary : theme.palette.text.secondary,
	borderRadius: '50%',
	minWidth: '3rem',
	height: '3rem',
	'&:hover': {
		backgroundColor: isSelected ? theme.palette.background.paper : theme.palette.action.hover,
	},
}));

const Container = styled(Box)({
	padding: '0 22px',
	height: '100%',
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
});

const ChartContainer = styled(Box)<{ hidden?: boolean }>(({ hidden }) => ({
	width: '100%',
	minHeight: '400px',
	display: hidden ? 'none' : 'block',
}));

const ChartDetails = styled(Box)({
	marginTop: '16px',
	marginBottom: '30px',
	display: 'flex',
	flexDirection: 'row',
	gap: '20px',
});

const SubTitle = styled(Box)(({ theme }) => ({
	fontSize: '13px',
	fontWeight: '300',
	fontFamily: theme.fonts.monospace,
	color: theme.palette.text.secondary,
	whiteSpace: 'nowrap',
}));

const ChartDetailItem = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'dataPrecision',
})<{ dataPrecision: number }>(({ theme, dataPrecision }) => ({
	fontSize: `${Math.max(12, 18 - (dataPrecision || 4) * 0.5)}px`,
	fontWeight: '300',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '4px',
	fontFamily: theme.fonts.secondary,
	[theme.breakpoints.down(414)]: {
		fontSize: `${Math.max(10, 16 - (dataPrecision || 4) * 0.5)}px`,
	},
}));

interface Props extends BaseProps {
	markets: any;
	height?: string | number;
	orderBookGranularity: number;
	updateMarket: (data: any) => void;
	updateMarketCandlesData: (data: any) => void;
	updateMarketOrderBookData: (data: any) => void;
	updateMarketOrderBookChartData: (data: any) => void;
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
	price: number | null;
	volume: number | null;
	chartMode: 'LINE_CHART' | 'ORDER_BOOK_TABLE' | 'ORDER_BOOK_GRAPHIC' | 'CANDLE_CHART';
	chartProps: any;
	priceChartGranularity: string;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: BaseProps | any) => ({
	markets: state.api.markets,
	ohlcvCandles: state.api.market.candles,
	orderBook: state.api.market.orderBook,
	orderBookGranularity: state.api.market.orderBook.granularity,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
const mapDispatchToProps = (reduxDispatch: any) => ({
	updateMarket(data: any) {
		dispatch('api.updateMarket', data);
	},
	updateMarketCandlesData(data: any) {
		dispatch('api.updateMarketCandles', data);
	},
	updateMarketOrderBookData(data: any) {
		dispatch('api.updateMarketOrderBookData', data);
	},
	updateMarketOrderBookChartData(data: any) {
		dispatch('api.updateMarketOrderBookChartData', data);
	},
});

class Structure extends Base<Props, State> {
	properties: Map = new Map();

	market: any;

	marketId: string;
	marketPrecision: number;

	chart?: IChartApi;
	book?: IChartApi;
	chartSeries?: any;

	chartReference = createRef<HTMLDivElement>();
	bookReference = createRef<HTMLDivElement>();

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
			price: null,
			volume: null,
			chartMode: 'LINE_CHART',
			priceChartGranularity: '1h',
			chartProps: {},
		} as Readonly<State>;

		this.marketId = this.props.queryParams.get('marketId');
		this.market = this.props.markets.find((market: any) => market.id === this.marketId);
		this.props.updateMarket(this.market);

		this.marketPrecision = this.market.precision.amount ?? this.market.precision;

		this.properties.setIn('recurrent.5s.intervalId', undefined);
		this.properties.setIn('recurrent.5s.delay', 5 * 1000);

		this.properties.setIn('chart.defaultGranularity', '1h');
	}

	handleChartModeSwitch = (mode: State['chartMode']) => {
		this.setState({ chartMode: mode });
	};

	async componentDidMount() {
		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		if (this.properties.getIn<number>('recurrent.5s.intervalId')) {
			clearInterval(this.properties.getIn<number>('recurrent.5s.intervalId'));
		}

		// window.removeEventListener('resize', this.handleChartResize);
	}

	render() {
		const { isLoading, price, volume, chartMode, chartProps, priceChartGranularity } = this.state;

		return (
			<Container>
				{isLoading && <Spinner />}

				<ChartModeContainer>
					<StyledIconButton
						onClick={() => this.handleChartModeSwitch('LINE_CHART')}
						isSelected={chartMode === 'LINE_CHART'}
						title="Line Chart"
					>
						<ShowChartIcon />
					</StyledIconButton>
					<StyledIconButton
						onClick={() => this.handleChartModeSwitch('CANDLE_CHART')}
						isSelected={chartMode === 'CANDLE_CHART'}
						title="Candle Chart"
					>
						<CandlestickChartIcon />
					</StyledIconButton>
					<StyledIconButton
						onClick={() => this.handleChartModeSwitch('ORDER_BOOK_GRAPHIC')}
						isSelected={chartMode === 'ORDER_BOOK_GRAPHIC'}
						title="Order Book Graphic"
					>
						<BarChartIcon />
					</StyledIconButton>
					<StyledIconButton
						onClick={() => this.handleChartModeSwitch('ORDER_BOOK_TABLE')}
						isSelected={chartMode === 'ORDER_BOOK_TABLE'}
						title="Order Book Table"
					>
						<TableChartIcon />
					</StyledIconButton>
				</ChartModeContainer>

				<ChartContainer hidden={chartMode !== 'LINE_CHART'}>
					<TimeSwitch
						defaultGranularity={priceChartGranularity}
						onGranularityChange={this.onChartGranularityChange}
					/>
					<LineChart {...chartProps} />
				</ChartContainer>

				<ChartContainer hidden={chartMode !== 'CANDLE_CHART'}>
					<TimeSwitch
						defaultGranularity={priceChartGranularity}
						onGranularityChange={this.onChartGranularityChange}
					/>
					<CandleChart {...chartProps} />
				</ChartContainer>

				<ChartContainer hidden={chartMode !== 'ORDER_BOOK_TABLE'}>
					<SliderWithInput />
					<BookChart marketId={this.marketId} height="100%" />
				</ChartContainer>

				<ChartContainer hidden={chartMode !== 'ORDER_BOOK_GRAPHIC'}>
					<DepthChart />
				</ChartContainer>

				<ChartDetails>
					<ChartDetailItem dataPrecision={this.marketPrecision}>
						<SubTitle>MARKET</SubTitle>
						<Box>{`${this.market.base}/${this.market.quote}`}</Box>
					</ChartDetailItem>
					<ChartDetailItem dataPrecision={this.marketPrecision}>
						<SubTitle>PRICE</SubTitle>
						<Box>{price ? formatPrice(price, this.marketPrecision) : '-'}</Box>
					</ChartDetailItem>
					<ChartDetailItem dataPrecision={this.marketPrecision}>
						<SubTitle>24H VOL ({this.market.base})</SubTitle>
						<Box>{volume ? formatVolume(volume) : '-'}</Box>
					</ChartDetailItem>
				</ChartDetails>

				<CreateOrder marketId={this.marketId} marketPrecision={getPrecision(price!)} />
				<Orders marketId={this.marketId} hasMarketPath={true} />
			</Container>
		);
	}

	async initialize() {
		const candles = await this.fetchOhlcvData(this.marketId);

		if (candles.length) {
			const lastCandle = candles[candles.length - 1];
			const price = lastCandle[4];
			const volume = lastCandle[5];
			const lastMarketPrecision = price.toString().split('.')[1]?.length || 0;
			const setLastMarketPrecision = lastMarketPrecision > 1 ? lastMarketPrecision : 2;

			this.setState({
				price: price ? price : null,
				volume: volume ? volume : null,
				chartProps: {
					candles,
					precision: setLastMarketPrecision,
					minMove: 10,
				},
			});
		}

		this.setState({ isLoading: false });
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			await this.updateOrderBook();
			const { close, timestamp } = await this.fetchTickerData(this.marketId);
			this.setState((prevState) => ({
				price: close,
				chartProps: {
					...prevState.chartProps,
					candle: {
						time: timestamp,
						value: close,
					},
				},
			}));
		};

		this.properties.setIn(
			'recurrent.5s.intervalId',
			executeAndSetInterval(recurrentFunction, this.properties.getIn<number>('recurrent.5s.delay'))
		);
	}

	async fetchOhlcvData(marketId: string): Promise<any> {
		try {
			const response = await apiGetFetchOHLCV(
				{
					symbol: marketId,
					timeframe: this.state.priceChartGranularity,
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

			this.props.updateMarketCandlesData(response.data.result);

			return response.data.result;
		} catch (exception) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation';

			this.setState({ error: message });
			toast.error(message);
		}
	}

	async fetchTickerData(marketId: string): Promise<any> {
		try {
			const response = await apiGetFetchTicker(
				{
					symbol: marketId,
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
					throw new Error(response.text);
				}
			}

			return response.data.result;
		} catch (exception) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation';

			this.setState({ error: message });
			toast.error(message);

			clearInterval(this.properties.getIn<number>('recurrent.5s.intervalId'));
		}
	}

	// createMarketBook(precision: number, lines: LineData[]) {
	// 	try {
	// 		if (!this.bookReference.current) {
	// 			console.warn('The chart reference has not been found');
	// 			return;
	// 		}
	//
	// 		this.book = createChart(this.bookReference.current, {
	// 			autoSize: true,
	// 			layout: {
	// 				background: {
	// 					type: ColorType.Solid,
	// 					color: MaterialUITheme.palette.background.default,
	// 				},
	// 				textColor: MaterialUITheme.palette.text.primary,
	// 				fontSize: 11,
	// 			},
	// 			grid: {
	// 				vertLines: {
	// 					visible: false,
	// 				},
	// 				horzLines: {
	// 					visible: false,
	// 				},
	// 			},
	// 			timeScale: {
	// 				visible: true,
	// 				borderVisible: true,
	// 				timeVisible: true,
	// 				borderColor: MaterialUITheme.palette.text.secondary,
	// 				secondsVisible: true,
	// 				fixLeftEdge: true,
	// 				fixRightEdge: true,
	// 			},
	// 			rightPriceScale: {
	// 				visible: true,
	// 				borderVisible: true,
	// 				alignLabels: true,
	// 				borderColor: MaterialUITheme.palette.text.secondary,
	// 				autoScale: true,
	// 				scaleMargins: {
	// 					top: 0.1,
	// 					bottom: 0.1,
	// 				},
	// 			},
	// 			leftPriceScale: {
	// 				visible: false,
	// 			},
	// 			handleScale: false,
	// 			handleScroll: false,
	// 		});
	//
	// 		const valueMinMove = 10;
	// 		this.chartSeries = this.book.addLineSeries({
	// 			color: MaterialUITheme.palette.error.main,
	// 			lineWidth: 1,
	// 			priceLineWidth: 1,
	// 			priceLineVisible: true,
	// 			lastValueVisible: true,
	// 			lineStyle: LineStyle.Solid,
	// 			priceLineStyle: LineStyle.Dashed,
	// 			priceLineColor: MaterialUITheme.palette.error.main,
	// 			lastPriceAnimation: LastPriceAnimationMode.Continuous,
	// 			priceFormat: {
	// 				type: 'custom',
	// 				formatter: (price: number) => price.toFixed(precision),
	// 				minMove: 0.1 ** valueMinMove,
	// 			},
	// 		});
	//
	// 		window.addEventListener('resize', this.handleChartResize);
	//
	// 		this.chartSeries.setData(lines);
	//
	// 		this.book.timeScale().fitContent();
	// 		this.book.timeScale().scrollToRealTime();
	// 	} catch (exception) {
	// 		console.error(`chart: ${exception}`);
	// 	}
	// }

	transformCandlesInLines(candles: number[][]) {
		if (!candles || !Array.isArray(candles)) {
			return [];
		}

		const formattedLines = candles.map((candle, index) => {
			const isLastCandle = index === candles.length - 1;

			return {
				time: Number(candle[0]) as UTCTimestamp,
				value: Number(candle[4]),
				...(isLastCandle && { volume: Number(candle[5]) }),
			};
		});

		return formattedLines;
	}

	handleChartResize = () => {
		if (this.chartReference.current) {
			this.chart!.applyOptions({ width: this.chartReference.current.clientWidth });
		}
	};

	onChartGranularityChange = async (time: string) => {
		await this.setState({ priceChartGranularity: time });
		await this.initialize();
	}

	updateOrderBook = async () => {
		try {
			const response = await apiGetFetchOrderBook(
				{
					symbol: this.marketId,
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

			this.props.updateMarketOrderBookData(payload);

			const aggregatedOrderBook = this.aggregateOrderBookData(payload, this.props.orderBookGranularity);
			this.props.updateMarketOrderBookChartData(aggregatedOrderBook);
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
	}

	aggregateOrderBookData(data: { bids: string[][], asks: string[][] }, granularity: number) {
		const roundPrice = (price: number, granularity: number): number => {
			return Math.floor(price / granularity) * granularity;
		};

		const aggregateOrders = (orders: string[][], granularity: number) => {
			const aggregated: { [price: number]: number } = {};

			orders.forEach(order => {
				const price = parseFloat(order[0]);
				const amount = parseFloat(order[1]);

				const roundedPrice = roundPrice(price, granularity);

				if (aggregated[roundedPrice]) {
					aggregated[roundedPrice] += amount;
				} else {
					aggregated[roundedPrice] = amount;
				}
			});

			return Object.entries(aggregated).map(([price, amount]) => [parseFloat(price), amount]);
		};

		return {
			bids: aggregateOrders(data.bids, granularity),
			asks: aggregateOrders(data.asks, granularity)
		};
	}
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Structure)(({ theme }) => `
	background-color: green;
`);

const Behavior = connect(mapStateToProps, mapDispatchToProps)(withHooks(Style));

export const Market = Behavior;

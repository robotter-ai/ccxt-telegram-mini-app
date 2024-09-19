import { Box, styled } from '@mui/material';
import axios from 'axios';
import { Base, BaseProps, BaseState, withHooks } from 'components/base/Base';
import ButtonGroupToggle from 'components/general/ButtonGroupToggle';
import { CreateOrder } from 'components/views/v2/order/CreateOrder';
import { Orders } from 'components/views/v2/orders/Orders';
import { formatPrice, formatVolume, getPrecision } from 'components/views/v2/utils/utils';
import { IChartApi, UTCTimestamp } from 'lightweight-charts';
import { Map } from 'model/helper/extendable-immutable/map';
import { apiGetFetchOHLCV, apiGetFetchTicker } from 'model/service/api';
import { executeAndSetInterval } from 'model/service/recurrent';
import { dispatch } from 'model/state/redux/store';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Spinner } from '../layout/spinner/Spinner';
import CandleChart from './CandleChart';
import LineChart from './LineChart';
import MarketBook from 'components/views/v2/market/MarketBook';
import { TimeSwitch } from 'components/views/v2/market/charts/TimeSwitch';

interface Props extends BaseProps {
	markets: any;
	height?: string | number;
	updateMarketCandles: (data: any) => void;
	updateMarketOrderBook: (data: any) => void;
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
	price: number | null;
	volume: number | null;
	chartType: 'CHART' | 'BOOK';
	chartProps: any;
	priceChartMode: 'CANDLE' | 'LINE';
	priceChartGranularity: string;
}

const ChartTypeToggleContainer = styled(Box)({
	width: '100%',
	display: 'flex',
	margin: '10px 0',
})

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

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: BaseProps | any) => ({
	markets: state.api.markets,
	ohlcvCandles: state.api.market.candles,
	orderBook: state.api.market.orderBook,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
const mapDispatchToProps = (reduxDispatch: any) => ({
	updateMarketCandles(data: any) {
		dispatch('api.updateMarketCandles', data);
	},
	updateMarketOrderBook(data: any) {
		dispatch('api.updateMarketOrderBook', data);
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
			chartType: 'CHART',
			priceChartMode: 'LINE',
			priceChartGranularity: '1h',
			chartProps: {},
		} as Readonly<State>;

		this.marketId = this.props.queryParams.get('marketId');
		this.market = this.props.markets.find((market: any) => market.id === this.marketId);

		this.marketPrecision = this.market.precision.amount ?? this.market.precision;

		this.properties.setIn('recurrent.5s.intervalId', undefined);
		this.properties.setIn('recurrent.5s.delay', 5 * 1000);

		this.properties.setIn('chart.defaultGranularity', '1h');
	}

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
		const {
			isLoading,
			price,
			volume,
			chartType,
			priceChartMode,
			chartProps,
		} = this.state;

		const chartTypeButtons = [
			{
				label: 'CHART',
				onClick: () => this.setState({ chartType: 'CHART' }),
			},
			{
				label: 'BOOK',
				onClick: () => this.setState({ chartType: 'BOOK' }),
			},
		];

		return (
			<Container>
				{isLoading && <Spinner />}

				<ChartTypeToggleContainer>
					<ButtonGroupToggle buttons={chartTypeButtons} defaultButton={0} />
				</ChartTypeToggleContainer>
				<TimeSwitch defaultGranularity={this.properties.getIn('chart.defaultGranularity')} onGranularityChange={this.onChartGranularityChange} />

				<ChartContainer hidden={chartType !== 'CHART'}>
					{priceChartMode === 'LINE' && <LineChart {...chartProps} />}
					{priceChartMode === 'CANDLE' && <CandleChart {...chartProps} />}
				</ChartContainer>

				<ChartContainer hidden={chartType !== 'BOOK'}>
					<MarketBook marketId={this.marketId} height="100%" />
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

			const lastMarketPrecision = price.toString().split('.')[1]?.length || 0
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

			// this.createMarketBook(setLastMarketPrecision, this.transformCandlesInLines(candles));
		}

		this.setState({ isLoading: false });
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			// const { close, high, info, low, open, timestamp } = generateMarketMockData(this.marketPrecision);
			const { close, high, info, low, open, timestamp } = await this.fetchTickerData(this.marketId);

			const { priceChartMode } = this.state;
			if (priceChartMode === 'LINE') {
				this.setState(prevState => ({
					price: close,
					chartProps: {
						...prevState.chartProps,
						candle: {
							time: timestamp,
							value: close,
						},
					},
				}))
			} else if (priceChartMode === 'CANDLE') {
				this.setState(prevState => ({
					price: close,
					chartProps: {
						...prevState.chartProps,
						candle: {
							time: timestamp ?? info.timestamp,
							open: open ?? info.open,
							close: close ?? info.last_price,
							high: high ?? info.high,
							low: low ?? info.low,
						},
					},
				}));
			} else {
				throw new Error(`Invalid chart type: "${this.state.priceChartMode}".`);
			}
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
					throw new Error(response.text);
				}
			}

			this.props.updateMarketCandles(response.data.result);

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
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Structure)(({ theme }) => `
	background-color: green;
`);

const Behavior = connect(mapStateToProps, mapDispatchToProps)(withHooks(Style));

export const Market = Behavior;

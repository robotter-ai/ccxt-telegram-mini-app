import { Box, styled } from '@mui/material';
import axios from 'axios';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import { CreateOrder } from 'components/views/v2/order/CreateOrder';
import { Orders } from 'components/views/v2/orders/Orders';
import { formatPrice, formatVolume, getPrecision } from 'components/views/v2/utils/utils';
import {
	ColorType,
	createChart,
	IChartApi,
	LastPriceAnimationMode,
	LineData,
	LineStyle,
	UTCTimestamp
} from 'lightweight-charts';
import { Map } from 'model/helper/extendable-immutable/map';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { apiGetFetchOHLCV, apiGetFetchTicker } from 'model/service/api';
import { executeAndSetInterval } from 'model/service/recurrent';
import { dispatch } from 'model/state/redux/store';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface MarketProps extends BaseProps {
	markets: any;
}

interface MarketState extends BaseState {
	isLoading: boolean;
	error?: string;
	price: string | number | null;
	volume: number | null;
}

const mapStateToProps = (state: MarketState | any, props: BaseProps | any) => ({
	markets: state.api.markets,
});

const Container = styled(Box)({
	padding: '0 22px',
	height: '100%',
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
});

const ChartContainer = styled(Box)({
	width: '100%',
	minHeight: '400px',
});

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

class MarketStructure extends Base<MarketProps, MarketState> {
	properties: Map = new Map();

	market: any;

	marketId: string;
	marketPrecision: number;

	chart?: IChartApi;
	chartSeries?: any;

	chartReference = createRef<HTMLDivElement>();

	constructor(props: MarketProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
			price: null,
			volume: null,
		} as Readonly<MarketState>;

		this.marketId = this.props.queryParams.get('marketId');
		this.market = this.props.markets.find((market: any) => market.id === this.marketId);

		this.marketPrecision = this.market.precision.amount ?? this.market.precision;

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

		window.removeEventListener('resize', this.handleChartResize);
	}

	render() {
		const { isLoading, price, volume } = this.state;

		return (
			<Container>
				{isLoading && <Spinner />}

				<ChartContainer id="chart" ref={this.chartReference} />

				<ChartDetails>
					<ChartDetailItem dataPrecision={this.marketPrecision}>
						<SubTitle>MARKET</SubTitle>
						<Box>{`${this.market.base}/${this.market.quote}`}</Box>
					</ChartDetailItem>
					<ChartDetailItem dataPrecision={this.marketPrecision}>
						<SubTitle>PRICE</SubTitle>
						<Box>{price ?? '-'}</Box>
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
		const payload = await this.fetchOhlcvData(this.marketId);

		const lines = this.transformCandlesInLines(payload);

		const lastMarketPrecision = lines[lines.length - 1]?.value?.toString().split('.')[1]?.length || 0
		const setLastMarketPrecision = lastMarketPrecision > 1 ? lastMarketPrecision : 2;

		this.createMarketChart(setLastMarketPrecision, lines);
		this.setState({ isLoading: false });
	}

	async doRecurrently() {
		try {
			const recurrentFunction = async () => {
				// const close = Number((Math.random() * (100000 - 10) + 10).toFixed(this.precision));
				const { timestamp, close } = await this.fetchTickerData(this.marketId);

				if (this.chartSeries) {
					const currentSeries = this.chartSeries.dataByIndex(this.chartSeries.data().length - 1);

					if (currentSeries?.value !== close && close !== null) {
						this.chartSeries.update({
							time: timestamp / 1000,
							value: close,
						});

						const formattedPrice = formatPrice(close, this.marketPrecision);
						this.setState({ price: formattedPrice });

						return;
					}
				}
			};

			this.properties.setIn(
				'recurrent.5s.intervalId',
				executeAndSetInterval(recurrentFunction, this.properties.getIn<number>('recurrent.5s.delay'))
			);
		} catch (exception) {
			console.error(`chart: ${exception}`);
		}
	}

	async fetchOhlcvData(marketId: string): Promise<any> {
		try {
			const response = await apiGetFetchOHLCV(
				{
					symbol: marketId,
					timeframe: '1s',
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

			dispatch('api.updateMarketCandles', response.data.result);

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

	createMarketChart(precision: number, lines: LineData[]) {
		try {
			if (!this.chartReference.current) {
				throw Error('The chart reference has not been found.');
			}

			this.chart = createChart(this.chartReference.current, {
				autoSize: true,
				layout: {
					background: {
						type: ColorType.Solid,
						color: MaterialUITheme.palette.background.default,
					},
					textColor: MaterialUITheme.palette.text.primary,
					fontSize: 11,
				},
				grid: {
					vertLines: {
						visible: false,
					},
					horzLines: {
						visible: false,
					},
				},
				timeScale: {
					visible: true,
					borderVisible: true,
					timeVisible: true,
					borderColor: MaterialUITheme.palette.text.secondary,
					secondsVisible: true,
					fixLeftEdge: true,
					fixRightEdge: true,
				},
				rightPriceScale: {
					visible: true,
					borderVisible: true,
					alignLabels: true,
					borderColor: MaterialUITheme.palette.text.secondary,
					autoScale: true,
					scaleMargins: {
						top: 0.1,
						bottom: 0.1,
					},
				},
				leftPriceScale: {
					visible: false,
				},
				handleScale: false,
				handleScroll: false,
			});

			const valueMinMove = 10;
			this.chartSeries = this.chart.addLineSeries({
				color: MaterialUITheme.palette.success.main,
				lineWidth: 1,
				priceLineWidth: 1,
				priceLineVisible: true,
				lastValueVisible: true,
				lineStyle: LineStyle.Solid,
				priceLineStyle: LineStyle.Dashed,
				priceLineColor: MaterialUITheme.palette.success.main,
				lastPriceAnimation: LastPriceAnimationMode.Continuous,
				priceFormat: {
					type: 'custom',
					formatter: (price: number) => price.toFixed(precision),
					minMove: 0.1 ** valueMinMove,
				},
			});

			window.addEventListener('resize', this.handleChartResize);

			this.chartSeries.setData(lines);

			this.chart.timeScale().fitContent();
			this.chart.timeScale().scrollToRealTime();
		} catch (exception) {
			console.error(`chart: ${exception}`);
		}
	}

	transformCandlesInLines(candles: number[][]): LineData[] {
		if (!candles || !Array.isArray(candles)) return [];

		const formattedCandles = candles.map((candle, index) => {
			const isLastCandle = index === candles.length - 1;
			return {
				time: Number(candle[0]) as UTCTimestamp,
				value: Number(candle[4]),
				...(isLastCandle && { volume: Number(candle[5]) }),
			};
		});

		if (formattedCandles.length) {
			const lastCandle = formattedCandles[formattedCandles.length - 1];
			this.setState({
				price: formatPrice(lastCandle.value, this.marketPrecision),
				volume: lastCandle.volume ? lastCandle.volume : null,
			});
		}

		return formattedCandles;
	}

	handleChartResize = () => {
		if (this.chartReference.current) {
			this.chart!.applyOptions({ width: this.chartReference.current.clientWidth });
		}
	};
}

const MarketBehavior = (props: any) => {
	const handleUnAuthorized = useHandleUnauthorized();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const params = useParams();
	const [searchParams] = useSearchParams();

	return (
		<MarketStructure
			{...props}
			queryParams={queryParams}
			params={params}
			searchParams={searchParams}
			handleUnAuthorized={handleUnAuthorized}
		/>
	);
};

export const Market = connect(mapStateToProps)(MarketBehavior);

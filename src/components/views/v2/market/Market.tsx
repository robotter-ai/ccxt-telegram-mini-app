import { Box, styled } from '@mui/material';
import axios from 'axios';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import { CreateOrder } from "components/views/v2/order/CreateOrder";
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts';
import { Map } from 'model/helper/extendable-immutable/map';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { apiPostRun } from 'model/service/api';
import { executeAndSetInterval } from 'model/service/recurrent';
import { dispatch } from 'model/state/redux/store';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/utils';

interface MarketProps extends BaseProps {
	markets: any;
}

interface MarketState extends BaseState {
	isLoading: boolean;
	error?: string;
}

interface LineData {
    time: UTCTimestamp;
    value: number;
    volume: number;
}

const mapStateToProps = (state: MarketState | any, props: BaseProps | any) => ({
	markets: state.api.markets,
});

const Container = styled(Box)({
	padding: '16px',
	height: '100%',
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '10px',
});

const Title = styled(Box)({
	fontWeight: '700',
	textAlign: 'center',
	color: MaterialUITheme.palette.text.primary,
});

const ChartContainer = styled(Box)({
	width: '100%',
	minHeight: '280px',
});

const ChartDetails = styled(Box)({
	display: 'flex',
	flexDirection: 'row',
	gap: '30px',
});

const SubTitle = styled(Box)({
	fontWeight: '300',
	fontSize: '12px',
});

const ChartDetailItem = styled(Box)({
	fontSize: '14px',
	fontWeight: '600',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
});

class MarketStructure extends Base<MarketProps, MarketState> {
	properties: Map = new Map();

	market: any;

	marketId: string;
	precision: number;
	price: any;
	volume: any;

	threshold: number = 0.1; // arbitrary value

	chart?: IChartApi;
	chartSeries?: any;

	chartReference = createRef<HTMLDivElement>();

	constructor(props: MarketProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		} as Readonly<MarketState>;

		this.marketId = this.props.queryParams.get('marketId');
		this.market = this.props.markets.find((market: any) => market.id === this.marketId);
		this.precision = (this.market.precision.amount !== null && this.market.precision.amount !== undefined)
			? this.market.precision.amount
			: this.market.precision;

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
		const { isLoading } = this.state;

		return (
			<Container>
				{isLoading && <Spinner />}

				<Title>
					{this.market.id}
				</Title>

				<ChartContainer id="chart" ref={this.chartReference} />

				<ChartDetails>
					<ChartDetailItem>
						<SubTitle>MARKET</SubTitle>
						<Box>{`${this.market.base}/${this.market.quote}`}</Box>
					</ChartDetailItem>
					<ChartDetailItem>
						<SubTitle>PRICE (USDC)</SubTitle>
						<Box>{this.price ?? '-'}</Box>
					</ChartDetailItem>
					<ChartDetailItem>
						<SubTitle>24H VOL (SOL)</SubTitle>
						<Box>{this.volume ?? '-'}</Box>
					</ChartDetailItem>
				</ChartDetails>

				<CreateOrder market={this.marketId} />
			</Container>
		);
	}

	async initialize() {
		const payload = await this.fetchOhlcvData(this.marketId);
		const lines = this.transformCandlesInLines(payload, this.threshold);

		this.createMarketChart(this.precision, lines);
		this.setState({ isLoading: false });
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			const { timestamp, close } = await this.fetchTickerData(this.marketId);

			if (this.chartSeries) {
				const currentSeries = this.chartSeries.dataByIndex(this.chartSeries.data().length - 1);

				if (Math.abs(close - currentSeries.value) >= this.threshold) {
					this.chartSeries.update({
						time: timestamp / 1000,
						value: close,
					});

					this.price = formatPrice(close, this.precision);
					return;
				}
			}
		};

		this.properties.setIn(
			'recurrent.5s.intervalId',
			executeAndSetInterval(recurrentFunction, this.properties.getIn<number>('recurrent.5s.delay'))
		);
	}

	async fetchOhlcvData(marketId: string): Promise<any> {
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_ohlcv',
					parameters: {
						symbol: marketId,
						timeframe: '1s',
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
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_ticker',
					parameters: {
						symbol: marketId,
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

	createMarketChart(precision: number, lines: any) {
		const hasPrecision = precision || 10;

		if (!this.chartReference.current) {
			throw Error('The chart reference has not been found.');
		}

		this.chart = createChart(this.chartReference.current, {
			autoSize: true,
			layout: {
				background: { color: 'transparent' },
				textColor: MaterialUITheme.palette.text.primary,
				fontSize: hasPrecision > 2 ? 10 : 11,
			},
			grid: {
				vertLines: {
					visible: false,
				},
				horzLines: {
					style: 4,
					color: MaterialUITheme.palette.text.secondary,
				},
			},
			timeScale: {
				timeVisible: true,
				secondsVisible: true,
				borderVisible: true,
				borderColor: MaterialUITheme.palette.text.secondary,
				fixLeftEdge: true,
				fixRightEdge: true,
			},
			rightPriceScale: {
				borderVisible: true,
				borderColor: MaterialUITheme.palette.text.secondary,
				autoScale: true,
				scaleMargins: {
					top: 0.1,
					bottom: 0.1,
				},
			},
			handleScale: false,
			handleScroll: false,
		});

		this.chartSeries = this.chart.addLineSeries({
			color: MaterialUITheme.palette.success.main,
			lineWidth: 2,
			lineStyle: 0,
			priceLineWidth: 1,
			priceLineStyle: 3,
			priceLineVisible: true,
			lastValueVisible: true,
			priceLineColor: MaterialUITheme.palette.success.main,
			lastPriceAnimation: 1,
			priceFormat: {
				type: 'custom',
				formatter: (price: number) => formatPrice(price, hasPrecision),
				minMove: 0.1,
			},
		});

		window.addEventListener('resize', this.handleChartResize);

		this.chartSeries.setData(lines);

		this.chart.timeScale().fitContent();
		this.chart.timeScale().scrollToRealTime();
	}

	transformCandlesInLines(candles: number[], threshold: number): LineData[] {
		if (!candles || !Array.isArray(candles)) return [];

		const formattedCandles = candles.reduce((acc: { data: any[], prev: number | null }, candle: any) => {
			const currentCandle: any = {
				time: Number(candle[0]) as UTCTimestamp,
				value: Number(candle[4]),
				volume: Number(candle[5]),
			};

			const lastCandle = acc.data[acc.data.length - 1];
			if (!lastCandle || Math.abs(currentCandle.value - acc.prev!) >= threshold) {
				acc.data.push(currentCandle);
				acc.prev = currentCandle.value;
			}

			return acc;
		}, { data: [], prev: null });

		if (formattedCandles.data.length) {
			const lastCandle = formattedCandles.data[formattedCandles.data.length - 1];
			this.volume = lastCandle.volume;
			this.price = formatPrice(lastCandle.value, this.precision);
		}

		return formattedCandles.data;
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

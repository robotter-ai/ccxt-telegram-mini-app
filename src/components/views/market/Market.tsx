import { connect } from 'react-redux';
import axios from 'axios';
import { Base, BaseProps, BaseSnapshot, BaseState } from 'components/base/Base.tsx';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
// import { dispatch } from 'model/state/redux/store';
import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import Spinner from 'components/views/spinner/Spinner';
import './Market.css';
import { toast } from 'react-toastify';
import { CandlestickData, createChart, LineData, UTCTimestamp, WhitespaceData } from 'lightweight-charts';
import { createRef } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { CreateOrder } from 'components/views/order/CreateOrder.tsx';

interface MarketProps extends BaseProps {
	market: any,
}

interface MarketState extends BaseState {
	isLoading: boolean,
	error?: string,
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
interface MarketSnapshot extends BaseSnapshot {
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: MarketState | any, props: MarketProps | any) => ({
	market: state.api.market,
})

// @ts-ignore
class MarketStructure extends Base<MarketProps, MarketState, MarketSnapshot> {

	static defaultProps: Partial<BaseProps> = {
	};

	recurrentIntervalId?: number;

	recurrentDelay?: number;

	chart?: any;

	chartSeries?: any;

	private chartReference = createRef<HTMLDivElement>();

	constructor(props: MarketProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		};

		const { marketId: pathMarketId } = this.props.params;
		const queryParams = this.props.queryParams;
		const queryMarketId = queryParams.get('marketId');

		this.props.market.id = pathMarketId || queryMarketId;

		this.recurrentIntervalId = undefined;
		this.recurrentDelay = 1000;
	}

	async componentDidMount() {
		console.log('componentDidMount', arguments);

		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		console.log('componentWillUnmount', arguments);

		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	render() {
		console.log('render', arguments);

		const { isLoading, error } = this.state;

		return (
			<div
				className={'h-full w-full'}
			>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
				<div
					id="chart-container"
					className="chart-container h-full w-full"
				>
					<div
						id="chart"
						className="h-lvh w-full"
						ref={this.chartReference}
					></div>
				</div>
				<div
					className={'h-full w-full'}
				>
					<h1 className="text-center text-2xl font-bold pt-10 pb-2">
						Place an Order
					</h1>
					<CreateOrder
						marketId={this.props.market.id}
					>
					</CreateOrder>
				</div>
			</div>
		);
	}

	async initialize() {
		try {
			if (!this.chartReference) {
				// noinspection ExceptionCaughtLocallyJS
				throw Error('The chart reference has not been found.');
			}

			this.chart = createChart(
				// @ts-ignore
				this.chartReference.current,
				{
					layout: {
						background: { color: "#222" },
						textColor: "#C3BCDB",
					},
					grid: {
						vertLines: { color: "#444" },
						horzLines: { color: "#444" },
					},
					timeScale: {
						timeVisible: true,
						secondsVisible: true,
					},
					autoSize: true,
				}
			);

			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_ohlcv',
					parameters: {
						symbol: this.props.market.id,
						timeframe: '1s'
					}
				},
				// @ts-ignore
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error(`An error has occurred while performing this operation: ${response.text}`);
			}

			const payload = response.data.result;

			// dispatch('api.updateMarketCandles', payload);

			window.addEventListener('resize', this.handleChartResize);

			let lines = this.transformCandlesInLines(payload);
			console.log('lines', lines);
			this.chartSeries = this.chart.addLineSeries({
				color: '#2962FF',
				priceFormat: {
					type: 'price',
					precision: 10, // Adjust precision here
					minMove: 0.0000000001, // Adjust min move here
				},
			});
			this.chartSeries.priceScale().applyOptions({
				autoScale: true,
				scaleMargins: {
					top: 0.1,
					bottom: 0.2,
				},
			});
			this.chartSeries.setData(lines);

			// let candles = this.transformCandlesInCandlesticks(payload);
			// console.log('candles', candles);
			// this.chartSeries = this.chart.addCandlestickSeries({
			// 	upColor: '#4caf50',
			// 	downColor: '#f44336',
			// 	borderDownColor: '#f44336',
			// 	borderUpColor: '#4caf50',
			// 	wickDownColor: '#f44336',
			// 	wickUpColor: '#4caf50',
			// });
			// this.chartSeries.priceScale().applyOptions({
			// 	autoScale: true,
			// 	scaleMargins: {
			// 		top: 0.1,
			// 		bottom: 0.2,
			// 	},
			// });
			// this.chartSeries.setData(candles);

			this.chart.timeScale().fitContent();
			this.chart.timeScale().scrollToRealTime();
			window.removeEventListener('resize', this.handleChartResize);
		} catch (exception) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					clearInterval(this.recurrentIntervalId);

					// TODO check if the hook is navigating to the signIn page!!!
					return;
				}
			}

			const message = 'An error has occurred while performing this operation'

			this.setState({ error: message });
			toast.error(message);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			try {
				const response = await apiPostRun(
					{
						exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
						environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
						method: 'fetch_ticker',
						parameters: {
							symbol: this.props.market.id,
						},
						// method: 'fetch_ohlcv',
						// parameters: {
						// 	symbol: this.props.market.id,
						// 	timeframe: '1s',
						// }
					},
					// @ts-ignore
					this.props.handleUnAuthorized
				);

				if (response.status !== 200) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`An error has occurred while performing this operation: ${response.text}`);
				}

				const payload = response.data.result;

				// dispatch('api.updateMarketLines', payload);

				const line = {
					time: payload.timestamp / 1000,
					value: payload.close
				};
				// const lines = this.transformCandlesInLines(payload);
				// const line = lines[lines.length - 1];
				console.log('line', line);
				this.chartSeries.update(line);

				// const candle = {
				// 	time: payload.timestamp as UTCTimestamp,
				// 	open: payload.open,
				// 	high: payload.high,
				// 	low: payload.low,
				// 	close: payload.close,
				// 	volume: payload.volume || 0,
				// }
				// // const candles = this.transformCandlesInCandlesticks(payload);
				// // const candles = candles[candles.length - 1];
				// console.log('candle', candle);
				// this.chartSeries.update(candle);
			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						return;
					}
				}

				const message = 'An error has occurred while performing this operation'

				this.setState({ error: message });
				toast.error(message);

				clearInterval(this.recurrentIntervalId);
			}
		};

		// @ts-ignore
		this.recurrentIntervalId = executeAndSetInterval(recurrentFunction, this.recurrentDelay);
	}

	transformCandlesInCandlesticks(candles: any[]): (CandlestickData | WhitespaceData)[] {
		if (!candles || !Array.isArray(candles)) return [];

		return candles.map((candle: any) => ({
			time: Number(candle[0]) as UTCTimestamp,
			open: Number(candle[1]),
			high: Number(candle[2]),
			low: Number(candle[3]),
			close: Number(candle[4]),
			volume: Number(candle[5]),
		})) as (CandlestickData | WhitespaceData)[];
	}

	transformCandlesInLines(candles: any[]): LineData[] {
		if (!candles || !Array.isArray(candles)) return [];

		return candles.map((candle: any) => ({
			time: Number(candle[0]) as UTCTimestamp,
			value: Number(candle[4]),
		})) as LineData[];
	}

	handleChartResize() {
		if (this.chartReference.current) {
			this.chart.applyOptions({ width: this.chartReference.current.clientWidth });
		}
	};
}

const MarketBehavior = (props: any) => {
	const handleUnAuthorized = useHandleUnauthorized();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search)
	const params = useParams();
	const [searchParams] = useSearchParams();

	return <MarketStructure {...props} queryParams={queryParams} params={params} searchParams={searchParams} handleUnAuthorized={handleUnAuthorized}/>;
};

// noinspection JSUnusedGlobalSymbols
export const Market = connect(mapStateToProps)(MarketBehavior)

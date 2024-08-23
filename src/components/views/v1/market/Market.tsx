import { connect } from 'react-redux';
import axios from 'axios';
import { Base, BaseProps, BaseState } from 'components/base/Base.tsx';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
// import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import { Spinner}  from 'components/views/v1/spinner/Spinner';
import { toast } from 'react-toastify';
import { CandlestickData, createChart, LineData, UTCTimestamp, WhitespaceData } from 'lightweight-charts';
import { createRef } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { CreateOrder } from 'components/views/v1/order/CreateOrder';

interface MarketProps extends BaseProps {
	market: any;
}

interface MarketState extends BaseState {
	isLoading: boolean;
	error?: string;
}

const mapStateToProps = (state: MarketState | any) => ({
	market: state.api.market,
});

class MarketStructure extends Base<MarketProps, MarketState> {
	static defaultProps: Partial<BaseProps> = {};

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
		if (this.recurrentIntervalId !== undefined) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	render() {
		console.log('render', arguments);

		const { isLoading, error } = this.state;
		const { market } = this.props;

		return (
			<div className="flex flex-col items-center h-screen w-full bg-gray-900 text-white">
				{isLoading && <Spinner />}
				{error && <div>Error: {error}</div>}
				<div className="w-full p-2">
					<h2 className="text-xl font-bold text-center">{market.id}</h2>
				</div>
				<div className="w-full flex-grow flex flex-col items-center">
					<div id="chart-container" className="w-full h-80">
						<div id="chart" className="h-full w-full" ref={this.chartReference}></div>
					</div>
					<div className="w-full p-4">
						<h1 className="text-center text-xl font-bold pt-4 pb-2">Place an Order</h1>
						<CreateOrder marketId={market.id} />
					</div>
				</div>
			</div>
		);
	}

	async initialize() {
		try {
			if (!this.chartReference.current) {
				throw Error('The chart reference has not been found.');
			}

			this.chart = createChart(this.chartReference.current, {
				layout: {
					background: { color: '#222' },
					textColor: '#C3BCDB',
				},
				grid: {
					vertLines: { color: '#444' },
					horzLines: { color: '#444' },
				},
				timeScale: {
					timeVisible: true,
					secondsVisible: true,
				},
				autoSize: true,
				handleScale: false,
			});

			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_ohlcv',
					parameters: {
						symbol: this.props.market.id,
						timeframe: '1s',
					},
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error(`An error has occurred while performing this operation: ${response.text}`);
			}

			const payload = response.data.result;

			window.addEventListener('resize', this.handleChartResize);

			let lines = this.transformCandlesInLines(payload);
			this.chartSeries = this.chart.addLineSeries({
				color: '#2962FF',
				priceFormat: {
					type: 'price',
					precision: 10,
					minMove: 0.0000000001,
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

			this.chart.timeScale().fitContent();
			this.chart.timeScale().scrollToRealTime();
			window.removeEventListener('resize', this.handleChartResize);
		} catch (exception) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					clearInterval(this.recurrentIntervalId as number);
					return;
				}
			}

			const message = 'An error has occurred while performing this operation';

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
					},
					this.props.handleUnAuthorized
				);

				if (response.status !== 200) {
					throw new Error(`An error has occurred while performing this operation: ${response.text}`);
				}

				const payload = response.data.result;

				const line = {
					time: payload.timestamp / 1000,
					value: payload.close,
				};
				this.chartSeries.update(line);
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

				clearInterval(this.recurrentIntervalId as number);
			}
		};

		this.recurrentIntervalId = window.setInterval(recurrentFunction, this.recurrentDelay);
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

	handleChartResize = () => {
		if (this.chartReference.current) {
			this.chart.applyOptions({ width: this.chartReference.current.clientWidth });
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

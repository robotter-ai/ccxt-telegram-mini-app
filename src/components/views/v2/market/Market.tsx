import { Box, styled } from '@mui/material';
import axios from 'axios';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { createChart, IChartApi, LineData, UTCTimestamp } from 'lightweight-charts';
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
import {CreateOrder} from "components/views/v2/order/CreateOrder";

interface MarketProps extends BaseProps {
	market: {
		id: string;
		precision: number;
	};
}

interface MarketState extends BaseState {
	isLoading: boolean;
	error?: string;
}

const mapStateToProps = (state: MarketState | any) => ({
	market: state.api.market,
});

const Container = styled(Box)({
	padding: '16px',
	height: '100%',
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
});

const Title = styled(Box)({
	fontWeight: '700',
	textAlign: 'center',
	color: MaterialUITheme.palette.text.primary,
});

const ChartContainer = styled(Box)({
	margin: '10px 0',
	width: '100%',
	height: '35vh',
});

class MarketStructure extends Base<MarketProps, MarketState> {
	properties: Map = new Map();

	chart?: IChartApi;
	chartSeries?: any;

	chartReference = createRef<HTMLDivElement>();

	constructor(props: MarketProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		} as Readonly<MarketState>;

		this.props.market.id = this.props.queryParams.get('marketId');
		this.props.market.precision = Number(this.props.queryParams.get('marketPrecision'));

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
		return (
			<Container>
				<Title>
					{this.props.market.id}
				</Title>

				<ChartContainer id="chart" ref={this.chartReference} />

				<CreateOrder marketId={this.props.market.id} />
			</Container>
		);
	}

	async initialize() {
		try {
			if (!this.chartReference.current) {
				throw Error('The chart reference has not been found.');
			}

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
				if (response.data?.title) {
					const message = response.data.title;

					this.setState({ error: message });
					toast.error(message);

					return;
				} else {
					throw new Error(response.text);
				}
			}

			const payload = response.data.result;
			const lines = this.transformCandlesInLines(payload);

			const precision = this.props.market.precision || 10;

			this.chart = createChart(this.chartReference.current, {
				autoSize: true,
				layout: {
					background: { color: 'transparent' },
					textColor: MaterialUITheme.palette.text.primary,
					fontSize: precision > 2 ? 10 : 11,
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


			const minMove = 10 ** -precision;
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
					type: 'price',
					precision, // check with danilo the precision of the market
					minMove,
				},
			});

			window.addEventListener('resize', this.handleChartResize);

			this.chartSeries.setData(lines);
			this.chart.timeScale().fitContent();
			this.chart.timeScale().scrollToRealTime();

			dispatch('api.updateTemplateData', payload);
		} catch (exception) {
			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation.'

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
					if (response.data?.title) {
						const message = response.data.title;

						this.setState({ error: message });
						toast.error(message);

						return;
					} else {
						throw new Error(response.text);
					}
				}

				const payload = response.data.result;

				const line = {
					time: payload.timestamp / 1000,
					value: payload.close,
				};

				this.chartSeries.update(line);
				dispatch('api.updateTemplateData', payload);
			} catch (exception) {
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
		};

		this.properties.setIn(
			'recurrent.5s.intervalId',
			executeAndSetInterval(recurrentFunction, this.properties.getIn<number>('recurrent.5s.delay'))
		);
	}

	transformCandlesInLines(candles: number[]): LineData[] {
		if (!candles || !Array.isArray(candles)) return [];

		return candles.map((candle: any) => ({
			time: Number(candle[0]) as UTCTimestamp,
			value: Number(candle[4]),
		})) as LineData[];
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

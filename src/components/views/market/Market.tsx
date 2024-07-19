import { memo, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { useParams, useSearchParams } from 'react-router-dom';
import { CandlestickData, createChart, UTCTimestamp, WhitespaceData } from 'lightweight-charts';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import Spinner from 'components/views/spinner/Spinner';
import './Market.css';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	market: state.api.market,
})

interface MarketProps {
	market: any
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const MarketStructure = ({ market }: MarketProps) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null as any);

	const { marketId: pathMarketId } = useParams();
	const [searchParams] = useSearchParams();
	const queryMarketId = searchParams.get('marketId');

	const marketId = pathMarketId || queryMarketId;

	const handleUnAuthorized = useHandleUnauthorized();

	const chartReference = useRef<any>(null);

	const transformRawCandles = (candles: any[]): (CandlestickData | WhitespaceData)[] => {
		return candles.map((candle: any) => ({
			time: Number(candle[0]) / 1000 as UTCTimestamp,
			open: Number(candle[1]),
			high: Number(candle[2]),
			low: Number(candle[3]),
			close: Number(candle[4]),
			volume: Number(candle[5]),
		})) as (CandlestickData | WhitespaceData)[];
	}

	useEffect(() => {
		const handleResize = () => {
			if (chartReference.current) {
				chart.applyOptions({ width: chartReference.current.clientWidth });
			}
		};
		const chart = createChart(chartReference.current, {
			layout: {
				background: { color: "#222" },
				textColor: "#C3BCDB",
			},
			grid: {
				vertLines: { color: "#444" },
				horzLines: { color: "#444" },
			},
			autoSize: true,
		});

		const fetchData = async () => {
			try {
				const response = await apiPostRun({
					'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
					'environment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					'method': 'fetch_ohlcv',
					'parameters': {
						symbol: marketId,
						timeframe: '1s'
					}
				}, handleUnAuthorized);

				if (!(response.status === 200)) {
					throw new Error('Network response was not OK');
				}

				const payload = response.data.result;

				let candles = transformRawCandles(payload);

				candles = candles.slice(0, 25);

				dispatch('api.updateMarketCandles', candles);

				window.addEventListener('resize', handleResize);
				const series = chart.addCandlestickSeries({
					upColor: '#26a69a',
					downColor: '#ef5350',
					borderVisible: false,
					wickUpColor: '#26a69a',
					wickDownColor: '#ef5350',
				});
				series.setData(candles);
				chart.timeScale().fitContent();
				chart.timeScale().scrollToRealTime();

				let intervalId: any;

				const targetFunction = async () => {
					try {
						const response = await apiPostRun({
							'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
							'environment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
							'method': 'fetch_ohlcv',
							'parameters': {
								symbol: marketId,
								limit: 1
							}
						}, handleUnAuthorized);

						if (!(response.status === 200)) {
							throw new Error('Network response was not OK');
						}

						const payload = response.data.result;

						const candles = transformRawCandles(payload);

						dispatch('api.updateMarketCandles', candles);

						series.update(candles[0]);
					} catch (exception) {
						if (axios.isAxiosError(exception)) {
							if (exception?.response?.status == 401) {
								clearInterval(intervalId);
								return;
							}
						}

						console.error(exception);
					}
				};

				intervalId = executeAndSetInterval(targetFunction, 1000);
			} catch (error: any) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [marketId, handleUnAuthorized]);

	return (
		<div className={"h-screen w-full"}>
			<div id="tradingview-widget-container" className="tradingview-widget-container h-full w-full">
				{loading ? <Spinner /> : error ? <div>Error: {error.message}</div> : <></>}
				<div className="h-full w-full" ref={chartReference}></div>
			</div>
		</div>
	);
};

// noinspection JSUnusedGlobalSymbols
export const Market = connect(mapStateToProps)(memo(MarketStructure));

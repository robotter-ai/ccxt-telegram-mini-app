import { Box, styled } from '@mui/material';
import { Ticker } from 'api/types/tickers';
import {
	CandlestickData,
	ColorType,
	createChart,
	IChartApi,
	LineStyle,
	UTCTimestamp
} from 'lightweight-charts';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import { useEffect, useRef } from 'react';

interface LineChartProps {
	candles: number[][];
	precision: number;
	minMove: number;
	candle: Ticker;
}

const ChartContainer = styled(Box)({
	width: '100%',
	minHeight: '400px',
});

const StyledSeriesEmpty = styled(Box)(({ theme }) => ({
	fontSize: '17px',
	fontWeight: '300',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily: theme.fonts.primary,
}));

function candleChartConfig(chartReference: HTMLDivElement) {
	return createChart(chartReference, {
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
			borderColor: MaterialUITheme.palette.text.secondary,
		},
		rightPriceScale: {
			borderColor: MaterialUITheme.palette.text.secondary,
			scaleMargins: {
				bottom: 0.1,
			},
		},
	});
}

function candleChartSeriesConfig(chart: IChartApi, precision: number, valueMinMove: number) {
	return chart.addCandlestickSeries({
		upColor: MaterialUITheme.palette.success.main,
		downColor: MaterialUITheme.palette.error.main,
		borderUpColor: MaterialUITheme.palette.success.main,
		borderDownColor: MaterialUITheme.palette.error.main,
		wickUpColor: MaterialUITheme.palette.success.main,
		wickDownColor: MaterialUITheme.palette.error.main,
		priceLineStyle: LineStyle.Dashed,
		priceFormat: {
			type: 'custom',
			formatter: (price: number) => price.toFixed(precision),
			minMove: 0.1 ** valueMinMove,
		},
	});
}


function transformCandlesInCandlesticks(candles: number[][]): CandlestickData[] {
	if (!candles || !Array.isArray(candles)) {
		return [];
	}

	const formattedCandles = candles.map((candle, index) => {
		const time = Math.floor(Number(candle[0]) / 1000) as UTCTimestamp;

		return {
			time,
			open: Number(candle[1]),
			high: Number(candle[2]),
			low: Number(candle[3]),
			close: Number(candle[4]),
		};
	});

	return formattedCandles;
}

function CandleChart({ candles, precision, minMove = 10, candle }: LineChartProps) {
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<IChartApi | null>(null);
	const seriesRef = useRef<any>(null);

	useEffect(() => {
		if (chartContainerRef.current && !chartRef.current) {
			chartRef.current = candleChartConfig(chartContainerRef.current);
			seriesRef.current = candleChartSeriesConfig(chartRef.current, precision, minMove);
		}

		if (chartRef.current && seriesRef.current) {
			const formattedCandles = transformCandlesInCandlesticks(candles);
			seriesRef.current.setData(formattedCandles);

			chartRef.current.timeScale().fitContent();
			chartRef.current.timeScale().scrollToRealTime();
		}

		return () => {
			if (chartRef.current) {
				chartRef.current.remove();
				chartRef.current = null;
			}
		};
	}, [candles, precision, minMove]);

	useEffect(() => {
		if (seriesRef.current && candle) {
			const time = candle.timestamp ?? candle.info.timestamp;
			const open = candle.open ?? candle.info.open;
			const high = candle.high ?? candle.info.high;
			const low = candle.low ?? candle.info.low;
			const close = candle.close ?? candle.info.last_price;

			const lastData = seriesRef.current.dataByIndex(seriesRef.current.data().length - 1);

			const timeInSeconds = Math.floor(time / 1000) as UTCTimestamp;

			if (
				lastData?.open !== open ||
				lastData?.high !== high ||
				lastData?.low !== low ||
				lastData?.close !== close
			) {
				seriesRef.current.update({
					time: timeInSeconds,
					open,
					high,
					low,
					close,
				});
			}
		}
	}, [candle]);


	return (
		<>
			{(
				candles ?
					<ChartContainer
						id='candle-chart'
						ref={chartContainerRef}
					/> :
					<StyledSeriesEmpty>
						No data available.
					</StyledSeriesEmpty>
			)}
		</>

	);
}

export default CandleChart;

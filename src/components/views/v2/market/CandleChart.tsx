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
	hidden?: boolean;
	candles: number[][];
	precision: number;
	minMove: number;
	candle: Ticker;
}

const ChartContainer = styled(Box)<{ hidden?: boolean }>(({ hidden }) => ({
	width: '100%',
	minHeight: '400px',
	display: hidden ? 'none' : 'block',
}));

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
		if (index === 0) {
			return {
				time: Number(candle[0]) as UTCTimestamp,
				open: Number(candle[1]),
				high: Number(candle[2]),
				low: Number(candle[3]),
				close: Number(candle[4]),
			};
		}

		const lastCandle = {
			open: Number(candles[index - 1][1]),
			high: Number(candles[index - 1][2]),
			low: Number(candles[index - 1][3]),
			close: Number(candles[index - 1][4]),
		};

		const newCandle = {
			open: Number(candle[1]),
			high: Number(candle[2]),
			low: Number(candle[3]),
			close: Number(candle[4]),
		};

		if (JSON.stringify(newCandle) === JSON.stringify(lastCandle)) {
			return;
		}

		return {
			time: Number(candle[0]) as UTCTimestamp,
			open: Number(candle[1]),
			high: Number(candle[2]),
			low: Number(candle[3]),
			close: Number(candle[4]),
		};

	}).filter(candle => candle !== undefined);

	return formattedCandles;
}


function CandleChart({ hidden, candles, precision, minMove = 10, candle }: LineChartProps) {
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

			if (
				lastData?.open !== open ||
				lastData?.high !== high ||
				lastData?.low !== low ||
				lastData?.close !== close
			) {
				seriesRef.current.update({
					time: time / 1000 as UTCTimestamp,
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
						hidden={hidden}
					/> :
					<></>
			)}
		</>

	);
}

export default CandleChart;

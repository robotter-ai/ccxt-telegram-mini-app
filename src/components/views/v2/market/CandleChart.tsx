import { Box, styled } from '@mui/material';
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
	hidden: boolean;
	candles: number[][];
	precision: number;
	minMove: number;
	candle: {
		time: UTCTimestamp;
		open: number;
		close: number;
		high: number;
		low: number;
	},
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
				top: 0.1,
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


function CandleChart({ candles, precision, minMove, candle, hidden }: LineChartProps) {
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<IChartApi | null>(null);
	const seriesRef = useRef<any>(null);

	useEffect(() => {
		if (chartContainerRef.current && !chartRef.current) {
			chartRef.current = candleChartConfig(chartContainerRef.current);
			seriesRef.current = candleChartSeriesConfig(chartRef.current, precision, minMove);
		}

		if (chartRef.current && seriesRef.current) {
			const formattedLines = transformCandlesInCandlesticks(candles);

			seriesRef.current.setData(formattedLines);

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
			const { close, high, low, open, time } = candle;

			const lastData = seriesRef.current.dataByIndex(seriesRef.current.data().length - 1);

			if (
				lastData?.close !== close &&
				lastData?.high !== high &&
				lastData?.low !== low &&
				lastData?.open !== open
			) {
				seriesRef.current.update({
					time: time / 1000,
					close,
					high,
					low,
					open,
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

import { Box, styled } from '@mui/material';
import { Ticker } from 'api/types/tickers';

import {
	ColorType,
	createChart,
	IChartApi,
	LastPriceAnimationMode,
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

function lineChartConfig(chartReference: HTMLDivElement) {
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
				bottom: 0.1,
			},
		},
		leftPriceScale: {
			visible: false,
		},
		handleScale: false,
		handleScroll: false,
	});
}

function lineChartSeriesConfig(
	chart: IChartApi,
	precision: number,
	valueMinMove: number
) {
	return chart.addLineSeries({
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
}

function transformCandlesInLines(candles: number[][]) {
	if (!candles || !Array.isArray(candles)) {
		return [];
	}

	return candles.map(candle => {
		return {
			time: Math.floor(Number(candle[0]) / 1000) as UTCTimestamp, // Convert to seconds for lightweight-charts
			value: Number(candle[4]), // Assuming the 5th value is the closing price
		};
	});
}

function LineChart({ candles, precision, minMove = 10, candle }: LineChartProps) {
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<IChartApi | null>(null);
	const seriesRef = useRef<any>(null);

	useEffect(() => {
		if (chartContainerRef.current && !chartRef.current) {
			chartRef.current = lineChartConfig(chartContainerRef.current);
			seriesRef.current = lineChartSeriesConfig(chartRef.current, precision, minMove);
		}

		if (chartRef.current && seriesRef.current) {
			const formattedLines = transformCandlesInLines(candles);

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
			const { timestamp, close, info } = candle;
			const lastData = seriesRef.current.dataByIndex(seriesRef.current.data().length - 1);

			const newTime = Math.floor((timestamp ?? info.timestamp) / 1000) as UTCTimestamp;
			const newValue = close ?? info.last_price;

			if (lastData?.value !== newValue) {
				seriesRef.current.update({
					time: newTime,
					value: newValue,
				});
			}
		}
	}, [candle]);


	return (
		<>
			{(
				candles ?
					<ChartContainer
						id='line-chart'
						ref={chartContainerRef}
					/> :
					<StyledSeriesEmpty>
						No data available.
					</StyledSeriesEmpty>
			)}
		</>

	);
}

export default LineChart;

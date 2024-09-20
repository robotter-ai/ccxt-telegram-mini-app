import { Box, styled } from '@mui/material';
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
	hidden?: boolean;
	candles: number[][];
	precision: number;
	minMove: number;
	candle: {
		time: UTCTimestamp;
		value: number;
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

	const formattedLines = candles.map((candle, index) => {
		const isLastCandle = index === candles.length - 1;

		return {
			time: Number(candle[0]) as UTCTimestamp,
			value: Number(candle[4]),
			...(isLastCandle && { volume: Number(candle[5]) }),
		};
	});

	return formattedLines;
}

function LineChart({ hidden, candles, precision, minMove, candle }: LineChartProps) {
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
			const { value, time } = candle;
			const lastData = seriesRef.current.dataByIndex(seriesRef.current.data().length - 1);

			if (lastData?.value !== value) {
				seriesRef.current.update({
					time: time / 1000,
					value: value,
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
						hidden={hidden}
					/> :
					<></>
			)}
		</>

	);
}

export default LineChart;

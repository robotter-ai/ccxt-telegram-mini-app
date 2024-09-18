import {
	ColorType,
	createChart,
	IChartApi,
	LastPriceAnimationMode,
	LineStyle,
	UTCTimestamp
} from 'lightweight-charts';
import { MaterialUITheme } from 'model/theme/MaterialUI';

export const linesChartConfig = (chartReference: HTMLDivElement) => {
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

export const linesSeriesConfig = (
	chart: IChartApi,
	precision: number,
	valueMinMove: number
) => {
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

export const transformCandlesInLines = (candles: number[][]) => {
	if (!candles || !Array.isArray(candles)) {
		return [];
	}

	const formattedLines = candles.map((candle, index) => {
		const isLastCandle = index === candles.length - 1;

		return {
			time: Number(candle[0]) as UTCTimestamp,
			value: Number(candle[4]), // "low" or candle[2] "close"?
			...(isLastCandle && { volume: Number(candle[5]) }),
		};
	});

	return formattedLines;
}

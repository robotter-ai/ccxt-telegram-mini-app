import {
	CandlestickData,
	createChart,
	IChartApi,
	UTCTimestamp
} from 'lightweight-charts';
import { MaterialUITheme } from 'model/theme/MaterialUI';

export const candlesChartConfig = (chartReference: HTMLDivElement) => {
	return createChart(chartReference, {
		// autoSize: true,
		layout: { textColor: 'white', background: { color: 'black' } },
		grid: {
			vertLines: {
				visible: false,
			},
			horzLines: {
				visible: false,
			},
		},
		// handleScale: false,
		// handleScroll: false,
	});
}

export const candlesSeriesConfig = (chart: IChartApi) => {
	return chart.addCandlestickSeries({
		upColor: MaterialUITheme.palette.success.main,
		downColor: MaterialUITheme.palette.error.main,
		borderUpColor: MaterialUITheme.palette.success.main,
		borderDownColor: MaterialUITheme.palette.error.main,
		wickUpColor: MaterialUITheme.palette.success.main,
		wickDownColor: MaterialUITheme.palette.error.main,
	});
}


export const transformCandlesInCandlesticks = (candles: number[][]): CandlestickData[] => {
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
				volume: Number(candle[5]),
			}
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
			volume: Number(candle[5]),
		};

	}).filter(candle => candle !== undefined);

	return formattedCandles;
}

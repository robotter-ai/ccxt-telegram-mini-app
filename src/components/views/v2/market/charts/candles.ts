import {
	createChart,
	IChartApi
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

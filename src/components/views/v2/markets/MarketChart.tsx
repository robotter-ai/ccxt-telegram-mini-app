import { Box, styled } from '@mui/material';
import { ColorType, createChart, IChartApi, LineData, LineStyle, UTCTimestamp } from 'lightweight-charts';
import { apiGetFetchOHLCV } from 'model/service/api';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface MarketChartProps {
	market: any;
	colorChart: string;
}

const ChartContainer = styled(Box)({
	width: '73px',
	height: '22px',
});

const MarketChart = ({ market, colorChart }: MarketChartProps) => {
	const chartRef = useRef<HTMLDivElement>();
	const [chart, setChart] = useState<IChartApi>();
	const [chartSeries, setChartSeries] = useState<any>();

	useEffect(() => {
		const fetchOhlcvData = async (marketId: number) => {
			try {
				const response = await apiGetFetchOHLCV({ symbol: marketId, timeframe: '1s' });
				if (response.status !== 200) throw new Error(response.text);
				return response.data.result;
			} catch (exception) {
				console.error(exception);
				toast.error('An error has occurred while performing this operation');
			}
		};

		const transformCandlesInLines = (candles: number[][]) => {
			if (!candles || !Array.isArray(candles)) {
				return []
			}

			const formattedCandles = candles.map(candle => {
				return {
					time: Number(candle[0]) as UTCTimestamp,
					value: Number(candle[4]),
				};
			});

			return formattedCandles;
		};

		const createMarketChart = (lines: LineData[]) => {
			if (!chartRef.current) {
				throw Error('The chart reference has not been found.');
			}

			const newChart = createChart(chartRef.current, {
				autoSize: true,
				handleScale: false,
				handleScroll: false,
				layout: {
					background: {
						type: ColorType.Solid, color: MaterialUITheme.palette.background.default,
					},
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
					visible: false,
				},
				rightPriceScale: {
					visible: false,
				},
				leftPriceScale: {
					visible: false,
				},
			});

			const newChartSeries = newChart.addLineSeries({
				color: colorChart,
				lineWidth: 1,
				priceLineVisible: false,
				lineStyle: LineStyle.Solid,
			});

			newChartSeries.setData(lines);
			newChart.timeScale().fitContent();
			newChart.timeScale().scrollToRealTime();

			setChart(newChart);
			setChartSeries(newChartSeries);
		};

		const initialize = async () => {
			if (chart!) {
				return;
			}

			const payload = await fetchOhlcvData(market.id);
			const lines = transformCandlesInLines(payload);

			createMarketChart(lines);
		};

		initialize();

	}, [market, chartSeries, chart, colorChart]);

	return (
		<ChartContainer ref={chartRef} />
	);
};

export default MarketChart;

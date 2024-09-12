import { Box, styled } from '@mui/material';
import {
	ColorType,
	createChart,
	CrosshairMode,
	IChartApi,
	LineData,
	LineStyle,
	UTCTimestamp,
} from 'lightweight-charts';
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
	height: '45px',
});

function movingAverage(data: LineData[], windowSize: number) {
	const averages = [];

	for (let i = 0; i < data.length; i++) {
		const end = Math.min(data.length, i + windowSize);
		const window = data.slice(i, end);
		const sum = window.reduce((acc, point) => acc + point.value, 0);
		const avg = sum / window.length;
		averages.push({ time: data[i].time, value: avg });
	}

	return averages;
}

const MarketChart = ({ market, colorChart }: MarketChartProps) => {
	const markertChartRef = useRef<HTMLDivElement>(null);
	const [chart, setChart] = useState<IChartApi | null>(null);
	const [chartSeries, setChartSeries] = useState<any>(null);

	useEffect(() => {
		const fetchOhlcvData = async (marketId: number) => {
			try {
				const response = await apiGetFetchOHLCV(
					{
						symbol: marketId,
						timeframe: '1s',
					}
				);

				if (response.status !== 200) {
					throw new Error(response.text);
				}

				return response.data.result;
			} catch (exception) {
				console.error(exception);
				toast.error('An error has occurred while performing this operation');
			}
		};

		const transformCandlesInLines = (candles: number[][]) => {
			if (!candles || !Array.isArray(candles)) {
				return [];
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
			if (!markertChartRef.current) {
				throw Error('The chart reference has not been found.');
			}

			const newChart = createChart(markertChartRef.current, {
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

			newChart.applyOptions({
				crosshair: {
					mode: CrosshairMode.Hidden,
					horzLine: {
						visible: false,
					},
					vertLine: {
						visible: false,
					},
				},
			});

			const newChartSeries = newChart.addLineSeries({
				color: colorChart,
				lineWidth: 1,
				priceLineVisible: false,
				lineStyle: LineStyle.Solid,
			});

			const smoothedData = movingAverage(lines, 3);

			newChartSeries.setData(smoothedData);
			newChartSeries.setData(lines);

			newChart.timeScale().fitContent();
			newChart.timeScale().scrollToRealTime();

			setChart(newChart);
			setChartSeries(newChartSeries);
		};

		const initialize = async () => {
			if (chart) {
				return;
			}

			const payload = await fetchOhlcvData(market.id);
			if (!payload || !payload.length) {
				return;
			}

			const lines = transformCandlesInLines(payload);
			createMarketChart(lines);
		};

		initialize();
	}, [market, chart, chartSeries, colorChart]);

	return (
		<ChartContainer ref={markertChartRef} />
	);
};

export default MarketChart;

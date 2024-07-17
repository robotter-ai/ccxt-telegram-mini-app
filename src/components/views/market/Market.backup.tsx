import { useEffect, useState, useRef, memo } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { executeAndSetInterval } from 'model/service/recurrent';
// import { apiPostRun } from 'model/service/api';
// @ts-ignore

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
})

interface TickerProps {
	marketId: string;
	data: any;
}

function TradingViewWidgetStructure() {
	let initialized = false;

	const container = useRef();

	useEffect(() => {
			if (initialized) return;

			const script = document.createElement("script");
			script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
			script.type = "text/javascript";
			script.async = true;
			script.innerHTML = `
        {
          "autosize": true,
          "symbol": "BINANCE:BTCUSDT",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "withdateranges": true,
          "range": "1D",
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "details": true,
          "hotlist": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;

			// @ts-ignore
			container.current.appendChild(script);
			initialized = true;
		},
		[]
	);

	// @ts-ignore
	return (
		<div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
			<div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
			<div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
		</div>
	);
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const TradingViewWidget = memo(TradingViewWidgetStructure);

// const TradingViewChart = () => {
// 	const src = `blob:https://www.cube.exchange/66d6ce5b-6d89-4aa3-b278-b91dfe90cf79#symbol=SOLUSDC&interval=15&widgetbar={"details":false,"watchlist":false,"watchlist_settings":{"default_symbols":[]}}&timeFrames=[{"text":"5y","resolution":"1W"},{"text":"1y","resolution":"1W"},{"text":"6m","resolution":"120"},{"text":"3m","resolution":"60"},{"text":"1m","resolution":"30"},{"text":"5d","resolution":"5"},{"text":"1d","resolution":"1"}]&locale=en&uid=tradingview_695d0&clientId=tradingview.com&userId=public_user_id&chartsStorageUrl=https://saveload.tradingview.com&chartsStorageVer=1.1&customCSS=/static/chart-theme.css&customFontFamily=plex-mono&autoSaveDelay=1&debug=false&timezone=Etc/UTC&theme=Dark&header_widget_buttons_mode=compact`;
//
// 	return (
// 		<iframe
// 			id="tradingview_695d0"
// 			name="tradingview_695d0"
// 			src={src}
// 			title="Financial Chart"
// 			// frameBorder="0"
// 			// allowTransparency="true"
// 			// scrolling="no"
// 			// allowFullScreen
// 			style={{ display: 'block', width: '100%', height: '100%' }}
// 		/>
// 	);
// };

// src/TradingViewChart.js
// const TradingViewChart = () => {
// 	useEffect(() => {
// 		const script = document.createElement('script');
// 		// script.src = 'https://s3.tradingview.com/tv.js';
// 		script.src = 'https://www.cube.exchange/66d6ce5b-6d89-4aa3-b278-b91dfe90cf79#symbol=SOLUSDC&interval=15&widgetbar={"details":false,"watchlist":false,"watchlist_settings":{"default_symbols":[]}}&timeFrames=[{"text":"5y","resolution":"1W"},{"text":"1y","resolution":"1W"},{"text":"6m","resolution":"120"},{"text":"3m","resolution":"60"},{"text":"1m","resolution":"30"},{"text":"5d","resolution":"5"},{"text":"1d","resolution":"1"}]&locale=en&uid=tradingview_695d0&clientId=tradingview.com&userId=public_user_id&chartsStorageUrl=https://saveload.tradingview.com&chartsStorageVer=1.1&customCSS=/static/chart-theme.css&customFontFamily=plex-mono&autoSaveDelay=1&debug=false&timezone=Etc/UTC&theme=Dark&header_widget_buttons_mode=compact'
// 		script.async = true;
// 		script.onload = () => {
// 			new window.TradingView.widget({
// 				"container_id": "tradingview_695d0",
// 				"symbol": "SOLUSDC",
// 				"interval": "15",
// 				"widgetbar": {
// 					"details": false,
// 					"watchlist": false,
// 					"watchlist_settings": {
// 						"default_symbols": []
// 					}
// 				},
// 				"timeFrames": [
// 					{"text":"5y","resolution":"1W"},
// 					{"text":"1y","resolution":"1W"},
// 					{"text":"6m","resolution":"120"},
// 					{"text":"3m","resolution":"60"},
// 					{"text":"1m","resolution":"30"},
// 					{"text":"5d","resolution":"5"},
// 					{"text":"1d","resolution":"1"}
// 				],
// 				"locale": "en",
// 				"uid": "tradingview_695d0",
// 				"clientId": "tradingview.com",
// 				"userId": "public_user_id",
// 				"chartsStorageUrl": "https://saveload.tradingview.com",
// 				"chartsStorageVer": 1.1,
// 				"customCSS": "/static/chart-theme.css",
// 				"customFontFamily": "plex-mono",
// 				"autoSaveDelay": 1,
// 				"debug": false,
// 				"timezone": "Etc/UTC",
// 				"theme": "Dark",
// 				"header_widget_buttons_mode": "compact"
// 			});
// 		};
// 		document.body.appendChild(script);
//
// 		return () => {
// 			document.body.removeChild(script);
// 		};
// 	}, []);
//
// 	return (
// 		<div className="tradingview-widget-container" style={{ width: "100%", height: "100vh" }}>
// 			<div id="tradingview_695d0"></div>
// 			<div className="tradingview-widget-copyright">
// 				<a href="https://www.tradingview.com/symbols/SOLUSDC/" rel="noopener" target="_blank">
// 					<span className="blue-text">SOLUSDC Chart</span>
// 				</a> by TradingView
// 			</div>
// 		</div>
// 	);
// };

// src/TradingViewChart.js
import React, { useEffect } from 'react';
import axios from 'axios';

const TradingViewChart = () => {
	useEffect(() => {
		const script = document.createElement('script');
		script.src = 'https://s3.tradingview.com/tv.js';
		script.async = true;
		script.onload = () => {
			axios.get('YOUR_DATA_SOURCE_URL')
				.then(response => {
					const candleData = response.data;

					new window.TradingView.widget({
						"container_id": "tradingview_695d0",
						"datafeed": {
							onReady: (callback) => {
								setTimeout(() => callback({ supported_resolutions: ["1", "5", "15", "30", "60", "240", "D", "W", "M"] }), 0);
							},
							resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
								setTimeout(() => {
									onSymbolResolvedCallback({
										name: symbolName,
										ticker: symbolName,
										type: "crypto",
										session: "24x7",
										timezone: "Etc/UTC",
										minmov: 1,
										pricescale: 100,
										has_intraday: true,
										has_daily: true,
										has_weekly_and_monthly: true,
									});
								}, 0);
							},
							getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
								const bars = candleData.map(candle => ({
									time: new Date(candle.timestamp).getTime(),
									low: candle.low,
									high: candle.high,
									open: candle.open,
									close: candle.close,
									volume: candle.volume,
								}));
								onHistoryCallback(bars, { noData: false });
							}
						},
						"symbol": "SOLUSDC",
						"interval": "15",
						"widgetbar": {
							"details": false,
							"watchlist": false,
							"watchlist_settings": {
								"default_symbols": []
							}
						},
						"timeFrames": [
							{"text":"5y","resolution":"1W"},
							{"text":"1y","resolution":"1W"},
							{"text":"6m","resolution":"120"},
							{"text":"3m","resolution":"60"},
							{"text":"1m","resolution":"30"},
							{"text":"5d","resolution":"5"},
							{"text":"1d","resolution":"1"}
						],
						"locale": "en",
						"uid": "tradingview_695d0",
						"clientId": "tradingview.com",
						"userId": "public_user_id",
						"chartsStorageUrl": "https://saveload.tradingview.com",
						"chartsStorageVer": 1.1,
						"customCSS": "/static/chart-theme.css",
						"customFontFamily": "plex-mono",
						"autoSaveDelay": 1,
						"debug": false,
						"timezone": "Etc/UTC",
						"theme": "Dark",
						"header_widget_buttons_mode": "compact"
					});
				})
				.catch(error => {
					console.error('Error fetching data', error);
				});
		};
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return (
		<div className="tradingview-widget-container" style={{ width: "100%", height: "100vh" }}>
			<div id="tradingview_695d0"></div>
			<div className="tradingview-widget-copyright">
				<a href="https://www.tradingview.com/symbols/SOLUSDC/" rel="noopener" target="_blank">
					<span className="blue-text">SOLUSDC Chart</span>
				</a> by TradingView
			</div>
		</div>
	);
};

const MarketStructure = ({ marketId }: TickerProps) => {
	if (!marketId) marketId = 'TSOL/TUSDC';

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	// @ts-ignore
	// noinspection JSUnusedLocalSymbols
	const [tickers, addTicker] = useState<any[]>([]);

	const handleUnAuthorized = useHandleUnauthorized();

	useEffect(() => {
		const fetchData = async () => {
			try {
				let intervalId: any;

				const targetFunction = async () => {
					try {
						// const response = await apiPostRun({
						// 	'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
						// 	'environment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
						// 	'method': 'fetch_ticker',
						// 	'parameters': {
						// 		symbol: marketId
						// 	}
						// }, handleUnAuthorized);
						//
						// if (response.status !== 200) {
						// 	// noinspection ExceptionCaughtLocallyJS
						// 	throw new Error('Network response was not OK');
						// }
						//
						// const payload = response.data.result;
						//
						// addTicker((prevTicker) => [...prevTicker, payload]);
					} catch (exception) {
						if (axios.isAxiosError(exception)) {
							if (exception?.response?.status === 401) {
								clearInterval(intervalId);
								return;
							}
						}
						console.error(exception);
					}
				};

				intervalId = executeAndSetInterval(targetFunction, 5000);
			} catch (error: any) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [handleUnAuthorized]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div>
			<TradingViewChart />
		</div>
	);
};

export const Market = connect(mapStateToProps)(MarketStructure);

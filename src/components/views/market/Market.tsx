import { memo, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { useParams, useSearchParams } from 'react-router-dom';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import './Market.css';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	market: state.api.market,
})

interface MarketProps {
	market: any;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const MarketStructure = ({ market }: MarketProps) => {
	const [ loading, setLoading ] = useState(true);
	const [ error, setError ] = useState(null as any);

	const { marketId: pathMarketId } = useParams();
	const [searchParams] = useSearchParams();
	const queryMarketId = searchParams.get('marketId');

	const marketId = pathMarketId || queryMarketId;

	const container = useRef(null);

	const handleUnAuthorized = useHandleUnauthorized();

	let hasInitialized = false;

	useEffect(() => {
		if (hasInitialized) return;

		const fetchData = async () => {
			try {
				const response = await apiPostRun({
					'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
					'environment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					'method': 'fetch_ohlcv',
					'parameters': {
						symbol: marketId
					}
				}, handleUnAuthorized);

				if (!(response.status === 200)) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error('Network response was not OK');
				}

				const payload = response.data.result;

				dispatch('api.updateMarketCandles', payload);

				const script = document.createElement("script");
				script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
				script.type = "text/javascript";
				script.async = true;
				script.innerHTML = `
					{
						"autosize": true,
						"symbol": "${marketId}",
						"timezone": "Etc/UTC",
						"theme": "dark",
						"style": "9",
						"locale": "en",
						"withdateranges": true,
						"range": "1D",
						"hide_side_toolbar": false,
						"allow_symbol_change": false,
						"calendar": false,
						"support_host": "https://www.tradingview.com"
					}
				`;

				// @ts-ignore
				container.current.appendChild(script);

				let intervalId: any;

				const targetFunction = async () => {
					try {
						const response = await apiPostRun({
							'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
							'environment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
							'method': 'fetch_ohlcv',
							'parameters': {
								symbol: marketId
							}
						}, handleUnAuthorized);

						if (!(response.status === 200)) {
							// noinspection ExceptionCaughtLocallyJS
							throw new Error('Network response was not OK');
						}

						const payload = response.data.result;

						dispatch('api.updateMarketCandles', payload);
					} catch (exception) {
						if (axios.isAxiosError(exception)) {
							if (exception?.response?.status == 401) {
								clearInterval(intervalId);

								return;
							}
						}

						console.error(exception);
					}
				};

				intervalId = executeAndSetInterval(targetFunction, 60*1000);
			} catch (error: any) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		// noinspection JSIgnoredPromiseFromCall
		fetchData();

		hasInitialized = true;
	}, []);

	return (
		<div
			className={"h-screen w-full"}
		>
			<div
				className="tradingview-widget-container"
				ref={container}
				style={{
					height: "100%",
					width: "100%"
				}}
			>
				{loading ? <div>Loading...</div> : error ? <div>Error: {error.message}</div> : <></>}
			</div>
		</div>
	);
};

// noinspection JSUnusedGlobalSymbols
export const Market = connect(mapStateToProps)(memo(MarketStructure))

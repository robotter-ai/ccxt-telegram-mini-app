import React, { useRef } from 'react';
import './App.css';
// import React, { useRef, useState } from 'react';
// import logo from 'assets/images/logo/exchange.svg';
// import ccxt from 'assets/scripts/ccxt/ccxt.browser'

function App() {
	const hasRun = useRef(false);

  // const [count, setCount] = useState(0);

	React.useEffect(() => {
		if (hasRun.current) return;

		hasRun.current = true;

		const initialize = async () => {
			try {
				console.log(ccxt.exchanges);

				const exchangeId = import.meta.env.VITE_EXCHANGE_ID;
				const exchangeClass = ccxt[exchangeId];
				const exchange = new exchangeClass ({
					'apiKey': import.meta.env.VITE_EXCHANGE_API_KEY,
					'secret': import.meta.env.VITE_EXCHANGE_API_SECRET,
				});

				// console.log(exchange.describe());
				console.log(await exchange.fetchCurrencies());
				console.log(await exchange.fetchMarkets());
				console.log(await exchange.fetchTickers());
				console.log(await exchange.fetchOrderBook('BTC/USDC'));
				console.log(await exchange.fetchBalance());
				console.log(await exchange.fetchOpenOrders('BTC/USDC'));
			} catch (exception) {
				console.error(exception);
			}
		};

		initialize();
	}, []);

	const getOpenOrders = () => {
		return {

		}
	}

  return (
    <>

    </>
  )
}

export default App

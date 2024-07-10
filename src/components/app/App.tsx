import React, { useState, useEffect, useRef } from 'react';
import './App.css';
// import logo from 'assets/images/logo/exchange.svg';
// import ccxt from 'assets/scripts/ccxt/ccxt.browser'
// import Table from "../views/Table"
import EnhancedTable from 'components/views/EnhancedTable';

// const OrderInfo = ({ order }) => {
// 	return (
// 	<div style={{ marginBottom: '20px' }}>
// 		<pre>{JSON.stringify(order, null, 2)}</pre>
// 	</div>
// 	);
//   };


function App() {
	const hasRun = useRef(false);
	const [orders, setOrders] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (hasRun.current) return;

		hasRun.current = true;

		const initialize = async () => {
			try {
				// console.log(ccxt.exchanges);

				// console.log(import.meta.env.VITE_EXCHANGE_API_KEY);
				// console.log(import.meta.env.VITE_EXCHANGE_API_SECRET);

				const exchangeId = import.meta.env.VITE_EXCHANGE_ID;
				const exchangeClass = ccxt[exchangeId];
				const exchange = new exchangeClass ({
					'apiKey': import.meta.env.VITE_EXCHANGE_API_KEY,
					'secret': import.meta.env.VITE_EXCHANGE_API_SECRET,
				});
				exchange.proxyUrl = 'http://localhost:8080/';

				exchange.setSandboxMode(true);

				// console.log(exchange.describe());
				// console.log(await exchange.fetchCurrencies());
				// console.log(await exchange.fetchMarkets());
				// console.log(await exchange.fetchTickers());
				// console.log(await exchange.fetchOrderBook('BTC/USDC'));
				// console.log(await exchange.fetchBalance());
				// console.log(await exchange.createOrder('BTC/USDT','market', 'sell', 0.01, '51000'))
				// console.log(JSON.stringify((await exchange.fetchOpenOrders('BTC/USDT'))));

				const fetchedOrders = await exchange.fetchOpenOrders('BTC/USDT');
        console.log('Fetched Orders:', fetchedOrders);

        const formattedOrders = fetchedOrders.map((order, index) => ({
          id: index,
          market: order.symbol,
          status: order.status,
          side: order.side,
          amount: order.amount,
          price: order.price,
          datetime: new Date(order.timestamp).toLocaleString(),
        }));
        console.log('Formatted Orders:', formattedOrders);

        setOrders(formattedOrders);
      } catch (exception) {
        setError(exception.message);
      } finally {
        setLoading(false);
    }
		};

    initialize();
  }, []);

  return (
    // <>
	// 	<Table/>
	// 	<div>
    //     <h1 className='text-lg font-bold'>Order Information</h1>
    //     {loading && <div>Loading...</div>}
    //     {error && <div>Error: {error}</div>}
    //     {orders && orders.length > 0 ? (
    //       orders.map((order, index) => <OrderInfo key={index} order={order} />)
    //     ) : (
    //       !loading && <div>No open orders</div>
    //     )}
    //   </div>
    // </>
	<div>
      <h1>Order Information</h1>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {!loading && !error && <EnhancedTable rows={orders} />}
    </div>
  )
}

export default App

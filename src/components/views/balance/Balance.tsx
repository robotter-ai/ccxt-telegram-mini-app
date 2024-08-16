import React, { useState, useEffect } from 'react';
import { apiPostRun } from 'model/service/api';
import Spinner from 'components/views/spinner/Spinner';
import { toast } from 'react-toastify';

interface BalanceProps {
	balanceData: any;
}

const Balance: React.FC<BalanceProps> = () => {
	const [balance, setBalance] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [tickers, setTickers] = useState<{ [key: string]: any }>({});

	useEffect(() => {
		const fetchBalance = async () => {
			try {
				const response = await apiPostRun({
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_balance',
				});

				if (response.status !== 200) {
					throw new Error('Failed to fetch balance');
				}

				const balanceData = response.data.result;
				console.log('Fetched Balance:', balanceData);
				setBalance(balanceData);

				// Fetch tickers for each symbol in the balance
				const symbols = Object.keys(balanceData.total);
				const tickerPromises = symbols.map(async (symbol) => {
					const tickerResponse = await fetchTicker(symbol);
					return { [symbol]: tickerResponse.data.result };
				});

				const tickersArray = await Promise.all(tickerPromises);
				const tickersObject = tickersArray.reduce((acc, ticker) => ({ ...acc, ...ticker }), {});
				setTickers(tickersObject);

			} catch (error: any) {
				console.error('Error fetching balance or tickers:', error);
				setError('Failed to load balance');
				toast.error('Failed to load balance');
			} finally {
				setLoading(false);
			}
		};

		fetchBalance();
	}, []);

	const fetchTicker = async (symbol: string) => {
		try {
			const response = await apiPostRun({
				exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
				environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
				method: 'fetch_ticker',
				parameters: { symbol: `TSOL/tUSDC` },
			});

			if (response.status !== 200) {
				throw new Error(`Failed to fetch ticker for ${symbol}`);
			}

			return response;

		} catch (error) {
			console.error(`Error fetching ticker for ${symbol}:`, error);
			return null;
		}
	};

	if (loading) {
		return <Spinner />;
	}

	if (error) {
		return <div className="text-red-500">{error}</div>;
	}

	return (
		<div className="p-4">
			<div className="space-y-2">
				{Object.entries(balance.total).map(([asset, amount]) => (
					<div key={asset} className="flex justify-between items-center bg-gray-800 p-2 rounded text-white">
						<span>{asset}</span>
						<span>{amount}</span>
						<span className="ml-4">
                            {tickers[asset] ? (
															<>
																<span>{`$${tickers[asset].last || 'N/A'}`}</span>
																<span className={`ml-2 ${tickers[asset].percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {tickers[asset].percentage !== undefined ? `${tickers[asset].percentage.toFixed(2)}%` : 'N/A'}
                                    </span>
															</>
														) : (
															'N/A'
														)}
                        </span>
					</div>
				))}
			</div>
		</div>
	);
};

export default Balance;

import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import MarketsTable from 'components/views/markets/MarketsTable'; // Adjust the import path as needed
import Spinner from 'components/views/spinner/Spinner'; // Ensure the path is correct
import './Markets.css';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	markets: state.api.markets,
});

interface MarketsStructureProps {
	markets: any;
}

const MarketsStructure = ({ markets }: MarketsStructureProps) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null as any);

	const handleUnAuthorized = useHandleUnauthorized();

	useEffect(() => {
		const fetchData = async () => {
			try {
				let intervalId: any;

				const targetFunction = async () => {
					try {
						const response = await apiPostRun(
							{
								exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
								environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
								method: 'fetch_markets',
								parameters: {},
							},
							handleUnAuthorized
						);

						if (!(response.status === 200)) {
							throw new Error('Network response was not OK');
						}

						const payload = response.data.result;

						const formattedMarkets = payload.map((market: any) => ({
							id: market.id,
							symbol: market.symbol,
							base: market.base,
							quote: market.quote,
							active: market.active,
							precision: market.precision.amount,
						}));

						dispatch('api.updateMarkets', formattedMarkets);
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

				intervalId = executeAndSetInterval(targetFunction, 30000);
				targetFunction();
			} catch (error: any) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [handleUnAuthorized]);

	if (loading) {
		return <Spinner />;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div>
			<MarketsTable rows={markets} />
		</div>
	);
};

export const Markets = connect(mapStateToProps)(MarketsStructure);

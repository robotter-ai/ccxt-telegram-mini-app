import { connect } from 'react-redux';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { apiPostAuthSignOut, apiPostRun } from 'model/service/api';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { dispatch } from 'model/state/redux/store';
import { Constant } from 'model/enum/constant';

interface Props extends BaseProps {
	currenciesBySymbols: any;
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
	balanceData: any;
	tickers: { [key: string]: any };
}

const mapStateToProps = (state: State | any) => ({
	balanceData: state.api.balanceData,
	tickers: state.api.tickers,
	currenciesBySymbols: state.maps.currenciesBySymbols,
});

class Structure extends Base<Props, State> {
	static defaultProps: Partial<BaseProps> = {};

	recurrentIntervalId?: number;
	recurrentDelay?: number;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
			balanceData: null,
			tickers: {},
		};

		this.recurrentIntervalId = undefined;
		this.recurrentDelay = 5 * 1000;
	}

	async componentDidMount() {
		await this.initialize();
	}

	async componentWillUnmount() {
		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	async initialize() {
		try {
			const balanceResponse = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_balance',
				},
				this.props.handleUnAuthorized
			);

			if (balanceResponse.status !== 200) {
				throw new Error('Failed to fetch balance');
			}

			const balanceData = balanceResponse.data.result;
			console.log('Fetched balance data:', balanceData);
			this.setState({ balanceData });

			const tickersResponse = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_tickers',
				},
				this.props.handleUnAuthorized
			);

			if (tickersResponse.status !== 200) {
				throw new Error('Failed to fetch tickers');
			}

			const allTickers = tickersResponse.data.result;

			const relevantTickers = Object.entries(balanceData.total).reduce((acc, [symbol]) => {
				const tickerKey = Object.keys(allTickers).find(key => key.includes(`t${symbol.slice(1)}tUSDC`));
				if (tickerKey) {
					acc[symbol] = allTickers[tickerKey];
				}
				return acc;
			}, {});

			console.log('Filtered ticker data:', relevantTickers);
			this.setState({ tickers: relevantTickers });

		} catch (error) {
			console.error('Error fetching balance or tickers:', error);
			this.setState({ error: 'Failed to load balance' });
			toast.error('Failed to load balance');
		} finally {
			this.setState({ isLoading: false });
		}
	}

	handleSignOut = async () => {
		try {
			await apiPostAuthSignOut();
			dispatch('api.signOut', null);
			toast.success('Signed out successfully!');
			this.props.navigate(Constant.homePath.value as string);
		} catch (exception) {
			console.error(exception);
			toast.error('An error occurred during sign out.');
		}
	};

	handleClick(currency: any) {
		let environment = Constant.environment.value;

		let url: string;

		if (environment === 'production') {
			url = `${Constant.marketPath.value}?marketId=${currency.code.toUpperCase()}${Constant.productionUSDCurrency.value.toUpperCase()}`;
		} else if (environment == 'staging') {
			url = `${Constant.marketPath.value}?marketId=${currency.code.toUpperCase()}${Constant.stagingUSDCurrency.value.toUpperCase()}`;
		} else if (environment == 'development') {
			url = `${Constant.marketPath.value}?marketId=${currency.code.toUpperCase()}${Constant.developmentUSDCurrency.value.toUpperCase()}`;
		} else {
			throw new Error('Invalid environment');
		}

		this.props.navigate(url);
	};

	render() {
		const { isLoading, error, balanceData, tickers } = this.state;

		if (isLoading) {
			return <Spinner />;
		}

		if (error) {
			return <div className="text-red-500">{error}</div>;
		}

		const totalBalanceUSDC = balanceData
			? Object.entries(balanceData.total).reduce((acc, [asset, amount]) => {
				const price = ['USDC', 'USDT', 'TUSDC', 'TUSDT'].includes(asset) ? 1 : (tickers[asset]?.last || 0);
				return acc + price * amount;
			}, 0)
			: 0;

		return (
			<div className="flex flex-col h-full px-4 md:px-8">
				<div className="flex-grow overflow-hidden">
					<div className="mb-4 ml-4 text-left">
						<div style={{ fontFamily: '"GT America Light", sans-serif' }} className="text-left text-sm font-extralight text-neutral-400">
							My balance
						</div>
						<div style={{ fontFamily: '"PP Editorial New Light", sans-serif' }} className="mt-4 mb-10 text-3xl text-white">
							{`$${totalBalanceUSDC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
						</div>
					</div>
					<div className="h-full overflow-x-auto">
						<table className="w-full bg-black text-white">
							<thead className="sticky top-0 bg-black">
							<tr>
								<th style={{ fontFamily: '"GT America Light", sans-serif' }} className="px-4 py-2 text-left text-sm font-extralight text-neutral-400" colSpan={2}>
									My holdings
								</th>
							</tr>
							</thead>
							<tbody>
							{balanceData &&
								Object.entries(balanceData.total).map(([asset, amount]) => {
									const currency = this.props.currenciesBySymbols[asset];
									const iconClass = `cube-icons-${asset.toLowerCase().replace(/^t/, '')} text-token-${currency.info.assetId}`;
									const name = tickers[asset]?.name || asset;
									const price = ['USDC', 'USDT', 'TUSDC', 'TUSDT'].includes(asset) ? 1 : tickers[asset]?.last || 0;
									const percentage = ['USDC', 'USDT', 'TUSDC', 'TUSDT'].includes(asset) ? '0.00%' : tickers[asset]?.percentage !== undefined ? `${tickers[asset].percentage.toFixed(2)}%` : 'N/A';

									return (
										<tr key={asset} className="border-b border-gray-600 border-none" onClick={() => {this.handleClick(currency)}}>
											<td className="px-4 py-2 w-1/12 text-center">
												<i className={iconClass} style={{ fontSize: '24px' }}></i>
											</td>
											<td className="px-4 py-2 w-7/12">
												<div className="flex flex-col ml-1">
													<span className="text-lg leading-none">{currency.name}</span>
													<span className="text-sm text-gray-400">{asset}</span>
												</div>
											</td>
											<td className="px-4 py-2 w-7/12">
												<div className="flex flex-col text-right">
													<span className="leading-none">{`$${price.toFixed(2)}`}</span>
													<span className={`text-sm ${percentage.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
															{percentage}
														</span>
												</div>
											</td>
											<td className="px-4 py-2 w-4/12 text-right">
												<div className="flex flex-col items-end">
													<span className="text-lg leading-none">{`$${amount.toFixed(2)}`}</span>
													<div className="flex items-center">
														<span className="text-xs text-gray-400 mr-2">{`${amount.toFixed(2)}`}</span>
														<span className="text-xs text-gray-400">{name}</span>
													</div>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
}

const Behavior = (props: any) => {
	const handleUnAuthorized = useHandleUnauthorized();
	const location = useLocation();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	return (
		<Structure
			{...props}
			queryParams={queryParams}
			params={params}
			searchParams={searchParams}
			handleUnAuthorized={handleUnAuthorized}
			navigate={navigate}
		/>
	);
};

export const Balances = connect(mapStateToProps)(Behavior);

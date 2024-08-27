import { connect } from 'react-redux';
import { Base, BaseProps, BaseState } from 'components/base/Base.tsx';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { apiPostRun } from 'model/service/api';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import { toast } from 'react-toastify';
import { useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import signOutIcon from 'public/images/signout.svg';
import { apiPostAuthSignOut } from 'model/service/api';
import { dispatch } from 'model/state/redux/store';
import { Constant } from 'model/enum/constant';

interface BalanceProps extends BaseProps {}

interface BalanceState extends BaseState {
	isLoading: boolean;
	error?: string;
	balanceData: any;
	tickers: { [key: string]: any };
}

const mapStateToProps = (state: BalanceState | any) => ({
	balanceData: state.api.balanceData,
	tickers: state.api.tickers,
});

class BalanceStructure extends Base<BalanceProps, BalanceState> {
	static defaultProps: Partial<BaseProps> = {};

	recurrentIntervalId?: number;
	recurrentDelay?: number;

	constructor(props: BalanceProps) {
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

			const relevantTickers = Object.entries(balanceData.total).reduce((acc, [symbol, amount]) => {
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
				// If the asset is TUSDC, use the fixed price of $1 and multiply by the user's balance
				const price = asset === 'TUSDC' ? 1 : (tickers[asset]?.last || 0);
				return acc + price * amount;
			}, 0)
			: 0;

		return (
			<div className="flex flex-col h-full">
				<div className="flex-grow overflow-hidden">
					<div className="mb-4 text-center">
						<div className="mt-10 text-sm text-gray-400">Total Balance (USDC)</div>
						<div className="mb-10 text-2xl font-bold text-white">{totalBalanceUSDC.toFixed(2)}</div>
					</div>
					<div className="h-full overflow-y-auto">
						<table className="w-full bg-black text-white">
							<thead className="sticky top-0 bg-black">
							<tr>
								<th className="px-4 py-2 text-left text-[#FE8A00]" colSpan={2}>
									Balances
								</th>
								<th className="px-4 py-2 text-right text-[#FE8A00] w-4/12">
									<span className="text-xs whitespace-nowrap">Price (USDC), 24h Chg</span>
								</th>
							</tr>
							</thead>
							<tbody>
							{balanceData &&
								Object.entries(balanceData.total).map(([asset, amount]) => {
									const iconClass = `cube-icons-${asset.slice(1).toLowerCase()}`;
									const price = asset === 'TUSDC' ? 1 : tickers[asset]?.last || 0;
									const percentage = asset === 'TUSDC' ? '0.00%' : tickers[asset]?.percentage !== undefined ? `${tickers[asset].percentage.toFixed(2)}%` : 'N/A';

									return (
										<tr key={asset} className="border-b border-gray-600">
											<td className="px-4 py-2 w-1/12">
												<i className={iconClass} style={{ fontSize: '24px' }}></i>
											</td>
											<td className="px-4 py-2 w-7/12">
												<div className="flex flex-col">
													<span className="text-lg leading-none">{amount}</span>
													<span className="text-sm text-gray-400">{asset}</span>
												</div>
											</td>
											<td className="px-4 py-2 w-4/12 text-right">
												<div className="flex flex-col items-end">
													<span className="leading-none">{`$${price.toFixed(2)}`}</span>
													<span className={`text-sm ${percentage.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                                                    {percentage}
                                                </span>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
				<div className="mt-6 flex flex-col items-center">
					<img src={signOutIcon} alt="Logout Icon" className="w-6 h-6 mb-2" />
					<button onClick={this.handleSignOut} className="text-[#FE8A00] hover:underline focus:outline-none">
						Sign Out
					</button>
				</div>
			</div>
		);
	}
}

const BalanceBehavior = (props: any) => {
	const handleUnAuthorized = useHandleUnauthorized();
	const location = useLocation();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	return (
		<BalanceStructure
			{...props}
			queryParams={queryParams}
			params={params}
			searchParams={searchParams}
			handleUnAuthorized={handleUnAuthorized}
			navigate={navigate}
		/>
	);
};

export const Balances = connect(mapStateToProps)(BalanceBehavior);

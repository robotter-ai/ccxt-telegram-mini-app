import { connect } from 'react-redux';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dispatch } from 'model/state/redux/store';
import { Constant } from 'model/enum/constant';

interface RewardsProps extends BaseProps {}

interface RewardsState extends BaseState {
	isLoading: boolean;
	error?: string;
	claimStatus: boolean;
}

const mapStateToProps = () => ({});

class RewardsStructure extends Base<RewardsProps, RewardsState> {
	static defaultProps: Partial<BaseProps> = {};

	constructor(props: RewardsProps) {
		super(props);

		this.state = {
			isLoading: false,
			error: undefined,
			claimStatus: false,
		};
	}

	handleSignOut = async () => {
		try {
			dispatch('api.signOut', null);
			toast.success('Signed out successfully!');
			this.props.navigate(Constant.homePath.value as string);
		} catch (exception) {
			console.error(exception);
			toast.error('An error occurred during sign out.');
		}
	};

	handleClaimReward = () => {
		this.setState({ claimStatus: true });
	};

	render() {
		const { isLoading, error, claimStatus } = this.state;

		if (isLoading) {
			return <div>Loading...</div>;
		}

		if (error) {
			return <div className="text-red-500">{error}</div>;
		}

		const totalCubePoints = 1160;

		return (
			<div className="flex flex-col h-full">
				<div className="flex-grow overflow-hidden">
					<div className="mb-4 text-center">
						<div className="mt-10 text-sm text-gray-400">Total Cube Points</div>
						<div className="mb-10 text-2xl font-bold text-white">{totalCubePoints.toLocaleString()}</div>
					</div>
					<div className="mb-8">
						<table className="w-full bg-[#393939] text-white">
							<thead className="sticky top-0 bg-[#393939]">
							<tr>
								<th className="px-4 py-2 text-left text-[#FE8A00]">Rewards</th>
								<th className="px-4 py-2 text-right text-[#FE8A00] w-4/12">Points</th>
							</tr>
							</thead>
							<tbody>
							<tr className="border-b border-gray-600">
								<td className="px-4 py-2">
									<div className="flex flex-col">
										<span className="text-lg leading-none">Invite Friends</span>
										<button className="mt-2 px-2 py-1 text-sm bg-[#FE8A00] text-black rounded hover:bg-orange-600">
											Send Referral
										</button>
									</div>
								</td>
								<td className="px-4 py-2 text-right">
									<div className="text-lg leading-none">+80</div>
								</td>
							</tr>
							<tr className="border-b border-gray-600">
								<td className="px-4 py-2">
									<div className="flex flex-col">
										<span className="text-lg leading-none">Daily Check-in</span>
										<span className="text-xs text-gray-400 mt-1">Streak: 5 Days</span>
										<button
											className={`mt-2 px-2 py-1 text-sm rounded ${claimStatus ? 'bg-white text-[#FE8A00] border border-[#FE8A00]' : 'bg-[#FE8A00] text-black hover:bg-orange-600'}`}
											onClick={this.handleClaimReward}
											disabled={claimStatus}
										>
											{claimStatus ? 'Claimed' : 'Claim Reward'}
										</button>
									</div>
								</td>
								<td className="px-4 py-2 text-right">
									<div className="text-lg leading-none">+80</div>
								</td>
							</tr>
							</tbody>
						</table>
					</div>
					<div>
						<table className="w-full bg-[#393939] text-white">
							<thead className="sticky top-0 bg-[#393939]">
							<tr>
								<th className="px-4 py-2 text-left text-[#FE8A00]">Tasks</th>
								<th className="px-4 py-2 text-right text-[#FE8A00] w-4/12">Points</th>
							</tr>
							</thead>
							<tbody>
							<tr className="border-b border-gray-600">
								<td className="px-4 py-2">
									<div className="flex flex-col">
										<span className="text-lg leading-none">Completed Tasks</span>
									</div>
								</td>
								<td className="px-4 py-2 text-right">
									<div className="text-lg leading-none">+1000</div>
								</td>
							</tr>
							<tr className="border-b border-gray-600">
								<td className="px-4 py-2">
									<div className="flex flex-col">
										<span className="text-lg leading-none">Complete a trade &gt; $250</span>
										<button className="mt-2 px-2 py-1 text-sm bg-[#393939] text-[#FE8A00] rounded border border-[#FE8A00] hover:bg-gray-600">
											Trade
										</button>
									</div>
								</td>
								<td className="px-4 py-2 text-right">
									<div className="text-lg leading-none">
										<span className="text-sm">Reward: </span>500
									</div>
								</td>
							</tr>
							<tr className="border-b border-gray-600">
								<td className="px-4 py-2">
									<div className="flex flex-col">
										<span className="text-lg leading-none">Trade &gt; $2500 ZEX</span>
										<button className="mt-2 px-2 py-1 text-sm bg-[#393939] text-[#FE8A00] rounded border border-[#FE8A00] hover:bg-gray-600">
											Trade
										</button>
									</div>
								</td>
								<td className="px-4 py-2 text-right">
									<div className="text-lg leading-none">
										<span className="text-sm">Reward: </span>500
									</div>
								</td>
							</tr>
							<tr className="border-b border-gray-600">
								<td className="px-4 py-2">
									<div className="flex flex-col">
										<span className="text-lg leading-none">Trade &gt; $2500 DOG...</span>
										<button className="mt-2 px-2 py-1 text-sm bg-[#393939] text-[#FE8A00] rounded border border-[#FE8A00] hover:bg-gray-600">
											Trade
										</button>
									</div>
								</td>
								<td className="px-4 py-2 text-right">
									<div className="text-lg leading-none">
										<span className="text-sm">Reward: </span>500
									</div>
								</td>
							</tr>
							</tbody>
						</table>
					</div>
					<div className="mt-6 mb-8 text-center">
						<a href="#" className="text-xs text-[#FE8A00] underline">
							Loyalty Program Terms and Conditions
						</a>
					</div>
				</div>
			</div>
		);
	}
}

const RewardsBehavior = (props: any) => {
	const location = useLocation();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	return (
		<RewardsStructure
			{...props}
			queryParams={queryParams}
			params={params}
			searchParams={searchParams}
			navigate={navigate}
		/>
	);
};

export const Rewards = connect(mapStateToProps)(RewardsBehavior);

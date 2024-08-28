import { connect } from 'react-redux';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dispatch } from 'model/state/redux/store';
import {apiGetFetchTickers} from 'model/service/api';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';
import {Style} from "@mui/icons-material";
import axios from "axios";
import React from "react";


interface RewardsProps extends BaseProps {}

interface RewardsState extends BaseState {
	isLoading: boolean;
	error?: string;
	claimStatus: boolean;
}

const mapStateToProps = (state: any) => ({});

class RewardsStructure extends Base<RewardsProps, RewardsState> {
	static defaultProps: Partial<BaseProps> = {};
	private handleClaimReward: React.MouseEventHandler<HTMLButtonElement> | undefined;

	constructor(props: RewardsProps) {
		super(props);

		this.state = {
			isLoading: false,
			error: undefined,
		} as Readonly<State>;

		this.properties.setIn('recurrent.5s.intervalId', undefined);
		this.properties.setIn('recurrent.5s.delay', 5 * 1000);
	}

	async componentDidMount() {
		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		if (this.properties.getIn<number>('recurrent.5s.intervalId')) {
			clearInterval(this.properties.getIn<number>('recurrent.5s.intervalId'));
		}
	}

	render() {
		const { isLoading, error } = this.state;
		const { data } = this.props;

		return (
			<Style>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
				<pre>{JSON.stringify(data, null, 2)}</pre>
			</Style>
		);
	}

	async initialize(symbol?: string) {
		try {
			const response = await apiGetFetchTickers(
				{
					symbols: [symbol],
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				if (response.data?.title) {
					const message = response.data.title;

					this.setState({ error: message });
					toast.error(message);

					return;
				} else {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(response.text);
				}
			}

			const payload = response.data.result;

			dispatch('api.updateTemplateData', payload);
		} catch (exception: any) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation.'

			this.setState({ error: message });
			toast.error(message);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async doRecurrently() {
		const recurrentFunction = async (symbol: string) => {
			try {
				const response = await apiGetFetchTickers(
					{
						symbols: [symbol],
					},
					this.props.handleUnAuthorized
				);

				if (response.status !== 200) {
					if (response.data?.title) {
						const message = response.data.title;

						this.setState({ error: message });
						toast.error(message);

						return;
					} else {
						// noinspection ExceptionCaughtLocallyJS
						throw new Error(response.text);
					}
				}

				const payload = response.data.result;

				dispatch('api.updateTemplateData', payload);
			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						return;
					}
				}

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

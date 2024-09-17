import axios from 'axios';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';
import {Box, Button, LinearProgress, styled} from '@mui/material';
import {
	TrendingUp,
	HexagonOutlined,
	EmojiEventsOutlined,
	BookmarkAddedOutlined,
	SignalCellularAltOutlined,
} from '@mui/icons-material';
import {dispatch} from 'model/state/redux/store';
import {executeAndSetInterval} from 'model/service/recurrent';
import {Spinner} from 'components/views/v2/layout/spinner/Spinner';
import {Base, BaseProps, BaseState, withHooks} from 'components/base/Base';
import {
	// apiGetIridiumPrivateUsersInfo,
	apiGetIridiumPrivateUsersInvites,
	apiGetIridiumPrivateUsersUserTier,
	apiGetIridiumPrivateUsersLootBoxes,
	apiGetIridiumPrivateUsersDailyLoyalty,
	apiGetIridiumPublicPointsBlocksLeaderboard,
	apiGetIridiumPublicPointsLoyaltyLeaderboard,
	apiGetIridiumPublicPointsReferralLeaderboard,
} from "model/service/api";

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	data: state.api.rewards,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
const mapDispatchToProps = (reduxDispatch: any) => ({
	updateRewards(data: any) {
		dispatch('api.updateRewards', data);
	},
});

interface Props extends BaseProps {
	updateRewards(data: any): void;
	data: {
		users_info?: any;
		users_invites?: any;
		users_user_tier?: any;
		users_loot_boxes?: any;
		users_daily_loyalty?: any;
		points_blocks_leaderboard?: any;
		points_loyalty_leaderboard?: any;
		points_referral_leaderboard?: any;
	};
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
}

class Structure extends Base<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
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
    const usersInfo = data?.users_info || {};
		const usersUserTier = data?.users_user_tier || [];
		const referralLeaderboard = data?.points_referral_leaderboard?.top || [];
		const loyaltyLeaderboard = data?.points_loyalty_leaderboard?.top || [];
		const usersDailyLoyalty = data?.users_daily_loyalty || [];


		const formatNumber = (num: any) =>
			new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(num));

		return (
			<StyledContainer>
				{isLoading && <Spinner />}
				{error && <div>Error: {error}</div>}

				<StyledBox>
					<Title>Rewards</Title>
					<Row>
						<LargeRowTitle>Blocks</LargeRowTitle>
						<RowValueNum>
							{usersInfo.blocks !== undefined ? usersInfo.blocks : 'N/A'}
						</RowValueNum>
					</Row>
				</StyledBox>

				<StyledBox>
					<TitleOne>Progress <SignalCellularAltOutlined fontSize="medium" style={{ marginLeft: '9.8em' }} /></TitleOne>
					<CompactRowOne>
						<RowTitle>Deposits</RowTitle>
						<RowValue>
							${referralLeaderboard.length > 0 ? formatNumber(referralLeaderboard[0].points) : 'N/A'}
						</RowValue>
					</CompactRowOne>
					<CompactRowOne>
						<RowTitle>Wtd Vol</RowTitle>
						<RowValue>
							${usersDailyLoyalty && usersDailyLoyalty.dailyVolume !== undefined ? formatNumber(usersDailyLoyalty.dailyVolume) : 'N/A'}
						</RowValue>
					</CompactRowOne>
					<CompactRowOne>
						<RowTitle>Volume</RowTitle>
						<RowValue>
							${loyaltyLeaderboard.length > 0 ? formatNumber(loyaltyLeaderboard[0].points) : 'N/A'}
						</RowValue>
					</CompactRowOne>
					<LinearProgress variant="indeterminate" style={{ marginBottom: '1.25em' }} />
				</StyledBox>

				<RowContainer>
					<StyledFullBox>
						<Title>
							{typeof usersUserTier === 'object' ? (
								<>Tier: {usersUserTier.projectedTier || 'N/A'}</>
							) : (	usersUserTier || 'N/A' )}
							<EmojiEventsOutlined fontSize="xsmall" style={{ marginLeft: '7.25em' }} />
						</Title>
						<CompactRow>
							<LargeRowValue>Gold</LargeRowValue>
						</CompactRow>
						<CompactRow>
							<RowSubValue>
								Rank # {referralLeaderboard.length > 0 ? Number(referralLeaderboard[0].rank) : 'N/A'}
							</RowSubValue>
						</CompactRow>
					</StyledFullBox>

					<StyledFullBox>
						<Title>
							Loyalty Score
							<BookmarkAddedOutlined fontSize="xsmall" style={{ marginLeft: '3.25em' }} />
						</Title>
						<Row>
							<RowOne >
								<RowValue style={{ fontSize: '20px' }}>{referralLeaderboard.length > 0 ? Number(referralLeaderboard[0].points) : 'N/A'}</RowValue>
							</RowOne>
							<RowSubValueOne>
								<TrendingUp fontSize="small" /> +25/ 24
							</RowSubValueOne>
						</Row>
					</StyledFullBox>
				</RowContainer>

				<StyledBox>
					<Title>Blocks <HexagonOutlined fontSize="small" style={{ marginLeft: '12em', color: 'grey' }} /></Title>
					<ButtonsRow>
						<StyledButton variant="contained" color="secondary">
							Bounty Board
						</StyledButton>
						<InvertedButton variant="contained">
							Claim All
						</InvertedButton>
					</ButtonsRow>
				</StyledBox>
			</StyledContainer>
		);
	}


	async initialize() {
		try {
		} catch (exception: any) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation.'

			this.setState({error: message});
			toast.error(message);
		} finally {
			this.setState({isLoading: false});
		}
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			try	 {
				const responses = await Promise.all([

					apiGetIridiumPrivateUsersLootBoxes(
						{
						},
						this.props.handleUnAuthorized
					),
					apiGetIridiumPublicPointsLoyaltyLeaderboard(
						{
						},
						this.props.handleUnAuthorized
					),
					apiGetIridiumPrivateUsersInvites(
						{
						},
						this.props.handleUnAuthorized
					),
					apiGetIridiumPublicPointsReferralLeaderboard(
						{
						},
						this.props.handleUnAuthorized
					),
					apiGetIridiumPrivateUsersDailyLoyalty(
						{
						},
						this.props.handleUnAuthorized
					),

					apiGetIridiumPrivateUsersUserTier(
						{},
						this.props.handleUnAuthorized
					),
					//  apiGetIridiumPrivateUsersInfo(
					// {
					// },
					//  	this.props.handleUnAuthorized
					//  ),
					apiGetIridiumPublicPointsBlocksLeaderboard(
						{
						},
						this.props.handleUnAuthorized
					),
				]);

				responses.forEach((response: any) => {

					if (response.status < 200 || response.status >= 300) {
						if (response.data?.title) {
							const message = response.data.title;
							this.setState({ error: message });
							toast.error(message);
						} else {
							toast.error(response.data?.message || 'Unknown error occurred');
						}
						return;
					}

					if (response.data?.title) {
						const key = response.data.title.replace(/.*?(public|private)_(get|post|put|delete|patch)_/, '');
						const result = response.data.result?.result || response.data.result;

						if (result !== undefined) {
							const payload = { [key]: result };
							this.props.updateRewards(payload);
						} else {
							console.warn('Missing result in API response');
						}
					} else {
						console.warn('Missing title in API response');
					}
				});

			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					console.error('Resposta da API:', exception.response);
					if (exception?.response?.status === 401) {
						return;
					}
				}

				const message = 'An error has occurred while performing this operation.'

				this.setState({error: message});
				toast.error(message);

				clearInterval(this.properties.getIn<number>('recurrent.5s.intervalId'));
			}
		};

		// @ts-ignore
		this.properties.setIn(
			'recurrent.5s.intervalId',
			executeAndSetInterval(recurrentFunction, this.properties.getIn<number>('recurrent.5s.delay'))
		);
	}
}

const StyledContainer = styled(Box)`
	background-color: black;
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 20px;
	color: white;
`;

const StyledBox = styled(Box)`
	padding: 0.7em;
	position: relative;
	border-radius: 23px;
	background-color: rgba(31, 32, 30, 0.64);
`;

const StyledFullBox = styled(StyledBox)`
	flex: 1;
`;

const Title = styled('div')`
	font-size: 11px;
	font-weight: normal;
	position: absolute;
	top: 1em;
	left: 1.3em;
	padding: 0 0.25em;
`;

const Row = styled('div')`
	display: flex;
	justify-content: space-between;
	padding: 0.25em;
	margin-top: 3.2em;
`;

const RowOne = styled('div')`
	display: flex;
	padding: 0.25em;
	margin-top: 3.2em;
	justify-content: space-between;
`;

const CompactRow = styled(Row)`
	padding: 8px 0;
	margin-top: 10px;
`;

const TitleOne = styled('div')`
	top: 0.1em;
	left: 0.5em;
	position: relative;
	font-size: 12px;
	font-weight: normal;
	padding-bottom: 6em;
`;

const CompactRowOne = styled(Row)`
	color: rgba(170, 170, 170, 0.55);
	margin: 0;
	position: relative;
	display: flex;
	padding: 0;
	top: -1.5em;
	left: 0.4em;
`;

const RowTitle = styled('div')`
	display: flex;
	font-size: 11px;
`;

const RowValue = styled('div')`
	font-size: 12px;
	font-weight: normal;
`;

const RowValueNum = styled('div')`
	right: 2em;
	font-size: 22px;
	margin-top: 0.4em;
	font-weight: 300;
`;

const LargeRowTitle = styled(RowTitle)`
	left: 0.1em;
	position: relative;
	font-size: 20px;
	font-weight: 300;
	margin-top: 0.4em;
`;

const LargeRowValue = styled(RowValue)`
	font-size: 1.3em;
	margin-top: 4.4em;
	font-weight: lighter;
`;

const RowSubValue = styled('div')`
	color: rgba(170, 170, 170, 0.55);
	font-size: 11px;
	margin-top: -1.6em;
`;

const RowSubValueOne = styled('div')`
	right: 6em;
	color: rgba(170, 170, 170, 0.55);
	position: relative;
	font-size: 11px;
	margin-top: 8.3em;
`;

const RowContainer = styled(Box)`
	gap: 20px;
	height: 12em;
	display: flex;
`;

const ButtonsRow = styled(Box)`
	gap: 7.5em;
	display: flex;
	margin-top: 7.5em;
`;

const StyledButton = styled(Button)`
	color: white;
	padding: 1.2em 1.5em;
	font-size: 8px;
	font-style: normal;
	border-radius: 5em;
	background-color: #2b2b2b;

	&:hover {
		background-color: #1f1f1f;
	}
`;

const InvertedButton = styled(Button)`
	font-size: 8px;
	left: 3em;
	border-radius: 5em;
	background-color: white;
	color: black;

	&:hover {
		background-color: #ddd;
	}
`;

const Behavior = connect(mapStateToProps, mapDispatchToProps)(withHooks(Structure));

export const Rewards = Behavior;

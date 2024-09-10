import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Box, Button, styled, LinearProgress } from '@mui/material';
import { TrendingUp, BookmarkAddedOutlined, EmojiEventsOutlined, SignalCellularAltOutlined }from '@mui/icons-material';
import { executeAndSetInterval } from 'model/service/recurrent';
import { dispatch } from 'model/state/redux/store';
import { Base, BaseProps, BaseState, withHooks } from 'components/base/Base';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';

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

interface Props extends BaseProps {}

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

		return (
			<StyledContainer>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}

				<StyledBox>
					<Title>Rewards</Title>
					<Row>
						<LargeRowTitle>Points</LargeRowTitle>
						<RowValue>5,213,564</RowValue>
					</Row>
				</StyledBox>

				<StyledBox>
						<TitleOne>Progress <SignalCellularAltOutlined fontSize="medium" style={{ marginLeft: '14.5em' }}/> </TitleOne>
						<CompactRowOne>
							<RowTitle>Deposits</RowTitle>
							<RowValue>$8,500</RowValue>
						</CompactRowOne>
						<CompactRowOne>
							<RowTitle>Wtd Vol</RowTitle>
							<RowValue>$486,321</RowValue>
						</CompactRowOne>
						<CompactRowOne>
							<RowTitle>Volume</RowTitle>
							<RowValue>$2,435,934</RowValue>
						</CompactRowOne>
					<LinearProgress variant="indeterminate" style={{marginBottom:'1.25em'}} />
				</StyledBox>


				<RowContainer>
					<StyledFullBox>
						<Title>
							Tier
							<EmojiEventsOutlined fontSize="xsmall" style={{ marginLeft: '7.25em' }}/>
						</Title>
						<CompactRow>
							<LargeRowValue>Gold</LargeRowValue>
						</CompactRow>
						<CompactRow>
							<RowSubValue>Rank #453</RowSubValue>
						</CompactRow>
					</StyledFullBox>

					<StyledFullBox>
						<Title>
							Loyalty Score
							<BookmarkAddedOutlined fontSize="xsmall" style={{ marginLeft: '3.25em' }}/>
						</Title>
						<Row>
							<LargeRowValue>236</LargeRowValue>
						</Row>
						<Row>

							<RowSubValue><TrendingUp fontSize="small" /> +25 / 24 h</RowSubValue>
						</Row>
					</StyledFullBox>
				</RowContainer>

				<StyledBox>
					<Title>Blocks</Title>
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

			this.setState({ error: message });
			toast.error(message);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			try {
				const responses = await Promise.all([
					/*apiGetIridiumPrivateUsersLootBoxes(
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
						{
						},
						this.props.handleUnAuthorized
					),
					 apiGetIridiumPrivateUsersInfo(
					{
					},
					 	this.props.handleUnAuthorized
					 ),
					apiGetIridiumPublicPointsBlocksLeaderboard(
						{
						},
						this.props.handleUnAuthorized
					),*/
				]);

				responses.forEach((response: any) => {
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

					let payload: any = {};
					payload[`${response.data.title.replace(/.*?(public|private)_(get|post|put|delete|patch)_/,'')}`] = response.data.result.result || response.data.result;

					this.props.updateRewards(payload);
				});
			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						return;
					}
				}

				const message = 'An error has occurred while performing this operation.'

				this.setState({ error: message });
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
	font-size: 12px;
	font-weight: normal;
	position: absolute;
	top: 12px;
	left: 16px;
	padding: 0 0.25em ;
`;

const Row = styled('div')`
	display: flex;
	justify-content: space-between;
	padding: 0.25em 0;
	margin-top: 1em;
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
	font-weight:normal;
`;

const LargeRowTitle = styled(RowTitle)`
	font-size: 20px;
	font-weight: lighter;
`;

const LargeRowValue = styled(RowValue)`
	font-size: 1.3em;
	margin-top: 4em;
	font-weight: lighter;
`;

const RowSubValue = styled('div')`
	color: rgba(170, 170, 170, 0.55);
	font-size: 11px;
	margin-top: -1em;
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
	padding: 0.7em 1.5em;
	font-size: 8px;
	font-style: normal;
	border-radius: 5em;
	background-color: #2b2b2b;

	&:hover {
		background-color: #1f1f1f;
	}
`;

const InvertedButton = styled(Button)`
	padding: 0.5em 2em;
	font-size: 8px;
	text-align: left;
	border-radius: 5em;
	background-color: white;
	color: black;

	&:hover {
		background-color: #ddd;
	}
`;

const Behavior = connect(mapStateToProps, mapDispatchToProps)(withHooks(Structure));

export const Rewards = Behavior;

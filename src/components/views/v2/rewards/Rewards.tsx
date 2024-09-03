import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Box, Button, styled } from '@mui/material';
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
						<LargeRowValue>5,213,564</LargeRowValue>
					</Row>
				</StyledBox>

				<StyledBox>
					<Title>Progress</Title>
					<CompactRow>
						<RowTitle>Deposits</RowTitle>
						<RowValue>$8,500</RowValue>
					</CompactRow>
					<CompactRow>
						<RowTitle>Wtd Vol</RowTitle>
						<RowValue>$486,321</RowValue>
					</CompactRow>
					<CompactRow>
						<RowTitle>Volume</RowTitle>
						<RowValue>$2,435,934</RowValue>
					</CompactRow>
				</StyledBox>

				<RowContainer>
					<StyledFullBox>
						<Title>Tier</Title>
						<CompactRow>
							<LargeRowValue>Gold</LargeRowValue>
						</CompactRow>
						<CompactRow>
							<RowSubValue>Rank #453</RowSubValue>
						</CompactRow>
					</StyledFullBox>

					<StyledFullBox>
						<Title>Loyalty Score</Title>
						<Row>
							<LargeRowValue>236</LargeRowValue>
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

				responses.forEach((response) => {
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
	background-color: #333;
	padding: 20px;
	border-radius: 8px;
	position: relative;
`;

const StyledFullBox = styled(StyledBox)`
	flex: 1;
`;

const Title = styled('div')`
	font-size: 12px;
	font-weight: bold;
	position: absolute;
	top: 8px;
	left: 10px;
`;

const Row = styled('div')`
	display: flex;
	justify-content: space-between;
	padding: 10px 0;
	margin-top: 20px;
`;

const CompactRow = styled(Row)`
	padding: 5px 0;
	margin-top: 10px;
`;

const RowTitle = styled('div')`
	font-size: 14px;
`;

const RowValue = styled('div')`
	font-size: 14px;
	font-weight: bold;
`;

const LargeRowTitle = styled(RowTitle)`
	font-size: 20px;
	font-weight: bold;
`;

const LargeRowValue = styled(RowValue)`
	font-size: 20px;
	font-weight: bold;
`;

const RowSubValue = styled('div')`
	font-size: 12px;
	color: #aaa;
`;

const RowContainer = styled(Box)`
	display: flex;
	gap: 20px;
`;

const ButtonsRow = styled(Box)`
	display: flex;
	gap: 10px;
	margin-top: 10px;
`;

const StyledButton = styled(Button)`
	background-color: #2b2b2b;
	color: white;

	&:hover {
		background-color: #1f1f1f;
	}
`;

const InvertedButton = styled(Button)`
	background-color: white;
	color: black;

	&:hover {
		background-color: #ddd;
	}
`;

const Behavior = connect(mapStateToProps, mapDispatchToProps)(withHooks(Structure));

export const Rewards = Behavior;

import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Box, styled } from '@mui/material';
import { executeAndSetInterval } from 'model/service/recurrent';
import { dispatch } from 'model/state/redux/store';
import {
	apiGetIridiumPrivateUsersDailyLoyalty,
	apiGetIridiumPrivateUsersInvites,
	apiGetIridiumPrivateUsersLootBoxes,
	apiGetIridiumPrivateUsersUserTier,
	apiGetIridiumPublicPointsBlocksLeaderboard,
	apiGetIridiumPublicPointsLoyaltyLeaderboard,
	apiGetIridiumPublicPointsReferralLeaderboard,
} from 'model/service/api';
import { Base, BaseProps, BaseState, withHooks } from 'components/base/Base';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';

interface Props extends BaseProps {
	data: any,
	updateRewards: (data: any) => void,
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: Props | any) => ({
	data: state.api.rewards,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
const mapDispatchToProps = (reduxDispatch: any) => ({
	updateRewards(data: any) {
		dispatch('api.updateRewards', data);
	},
});

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

		return (
			<Box className={this.props.className}>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
				<pre>{JSON.stringify(data, null, 2)}</pre>
			</Box>
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

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Structure)(({ theme }) => `
	background-color: green;
`);

const Behavior = connect(mapStateToProps, mapDispatchToProps)(withHooks(Style));

export const Rewards = Behavior;

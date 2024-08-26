import { connect } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Box, styled } from '@mui/material';
import { Base, BaseProps, BaseState } from 'components/base/Base.tsx';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
// import { dispatch } from 'model/state/redux/store';
import { executeAndSetInterval } from 'model/service/recurrent';
// import { apiPostRun } from 'model/service/api';
import { Map } from 'model/helper/extendable-immutable/map';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';

interface Props extends BaseProps {
	stateValue: any,
	propsValue: any,
	fetchedData: any,
}

interface State extends BaseState {
}

const mapStateToProps = (state: State | any, props: Props | any) => ({
	stateValue: state.api.data,
	propsValue: props.value,
})

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Box)(({ theme }) => ({
}));

class Structure extends Base<Props, State> {

	properties: Map = new Map();

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
		const { fetchedData } = this.props;

		return (
			<Style>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
				<pre>{JSON.stringify(fetchedData, null, 2)}</pre>
			</Style>
		);
	}

	async initialize() {
		try {
			// 	const response = await apiPostRun(
			// 		{
			// 			exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
			// 			environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
			// 			method: '<apiFunction>',
			// 			parameters: {
			// 				param1: '<param1Value>',
			// 				param2: '<param2Value>',
			// 			},
			// 		},
			// 		this.props.handleUnAuthorized
			// 	);
			//
			// 	if (response.status !== 200) {
			// 		// noinspection ExceptionCaughtLocallyJS
			// 		throw new Error(`An error has occurred while performing this operation: ${response.text}`);
			// 	}
			//
			// 	const payload = response.data.result;
			//
			// 	dispatch('api.updateDevelopmentData', payload);
			// } catch (exception) {
			// 	console.error(exception);
			//
			// 	if (axios.isAxiosError(exception)) {
			// 		if (exception?.response?.status === 401) {
			// 			// TODO check if the hook is navigating to the signIn page!!!
			// 			return;
			// 		}
			// 	}
			//
			// 	const message = 'An error has occurred while performing this operation'
			//
			// 	this.setState({ error: message });
			// 	toast.error(message);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			try {
				// const response = await apiPostRun(
				// 	{
				// 		exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
				// 		environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
				// 		method: '<apiFunction>',
				// 		parameters: {
				// 			param1: '<param1Value>',
				// 			param2: '<param2Value>',
				// 		},
				// 	},
				// 	// @ts-ignore
				// 	this.props.handleUnAuthorized
				// );
				//
				// if (response.status !== 200) {
				// 	// noinspection ExceptionCaughtLocallyJS
				// 	throw new Error(`An error has occurred while performing this operation: ${response.text}`);
				// }
				//
				// const payload = response.data.result;
				//
				// dispatch('api.updateDevelopmentData', payload);
			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						// TODO check if the hook is navigating to the signIn page!!!
						return;
					}
				}

				const message = 'An error has occurred while performing this operation'

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

const Behavior = (props: any) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search)
	const [searchParams] = useSearchParams();
	const handleUnAuthorized = useHandleUnauthorized();

	return <Structure
		{...props}
		location={location}
		navigate={navigate}
		params={params}
		queryParams={queryParams}
		searchParams={searchParams}
		handleUnAuthorized={handleUnAuthorized}
	/>;
};

// noinspection JSUnusedGlobalSymbols
export const SignIn = connect(mapStateToProps)(Behavior);
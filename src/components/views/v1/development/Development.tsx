import './Development.css';
import { connect } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Base, BaseProps, BaseState } from 'components/base/Base.tsx';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import { Map } from 'model/helper/extendable-immutable/map';

interface DevelopmentProps extends BaseProps {
	stateValue: any,
	propsValue: any,
	fetchedData: any,
}

interface DevelopmentState extends BaseState {
}

const mapStateToProps = (state: DevelopmentState | any, props: DevelopmentProps | any) => ({
	stateValue: state.api.data,
	propsValue: props.value,
})

class DevelopmentStructure extends Base<DevelopmentProps, DevelopmentState> {

	properties: Map = new Map();

	constructor(props: DevelopmentProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		} as Readonly<DevelopmentState>;

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
			<div>
				{isLoading ? <Spinner /> : null}
				{error ? <div>Error: {error}</div> : null}
				<pre>{JSON.stringify(fetchedData, null, 2)}</pre>
			</div>
		);
	}

	async initialize() {
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: '<apiFunction>',
					parameters: {
						param1: '<param1Value>',
						param2: '<param2Value>',
					},
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error(`An error has occurred while performing this operation: ${response.text}`);
			}

			const payload = response.data.result;

			dispatch('api.updateDevelopmentData', payload);
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
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			try {
				const response = await apiPostRun(
					{
						exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
						environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
						method: '<apiFunction>',
						parameters: {
							param1: '<param1Value>',
							param2: '<param2Value>',
						},
					},
					// @ts-ignore
					this.props.handleUnAuthorized
				);

				if (response.status !== 200) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`An error has occurred while performing this operation: ${response.text}`);
				}

				const payload = response.data.result;

				dispatch('api.updateDevelopmentData', payload);
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

const DevelopmentBehavior = (props: any) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search)
	const [searchParams] = useSearchParams();
	const handleUnAuthorized = useHandleUnauthorized();

	return <DevelopmentStructure
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
export const Development2 = connect(mapStateToProps)(DevelopmentBehavior)


import { Cell, Input, List, Section, Tappable } from '@telegram-apps/telegram-ui';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';

// Example data for rendering list cells
const cellsTexts = ['Chat Settings', 'Data and Storage', 'Devices'];

export const Development = () => (
	<div>
		{/* List component to display a collection of items */}
		<List>
			{/* Section component to group items within the list */}
			<Section header="Header for the section" footer="Footer for the section">
				{/* Mapping through the cells data to render Cell components */}
				{cellsTexts.map((cellText, index) => (
					<Cell key={index}>
						{cellText}
					</Cell>
				))}
			</Section>
		</List>
		<Input header="Input" placeholder="I am usual input, just leave me alone" />
		<Input status="error" header="Input" placeholder="I am error input, don't make my mistakes..." />
		<Input status="focused" header="Input" placeholder="I am focused input, are u focused on me?" />
		<Input disabled header="Input" placeholder="I am disabled input" />
		<Input status="focused" header="Input" placeholder="Write and clean me" after={<Tappable Component="div" style={{
			display: 'flex'
		}}>
			<Icon24Close />
		</Tappable>} />
	</div>
);

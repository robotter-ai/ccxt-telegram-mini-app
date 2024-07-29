import { connect } from 'react-redux';
import axios from 'axios';
// import PropTypes from 'prop-types';
import { Base, BaseProps, BaseSnapshot, BaseState } from 'components/base/Base.tsx';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import Spinner from 'components/views/spinner/Spinner';
import './Template.css';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

interface TemplateProps extends BaseProps {
	queryParams: any;
	params: any;
	searchParams: any;
	navigate: any;
	handleUnAuthorized: any;
	stateValue: any,
	propsValue: any,
	fetchedData: any,
}

interface TemplateState extends BaseState {
	isLoading: boolean,
	error?: string,
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
interface TemplateSnapshot extends BaseSnapshot {
}

const mapStateToProps = (state: TemplateState | any, props: TemplateProps | any) => ({
	stateValue: state.api.data,
	propsValue: props.value,
})

// @ts-ignore
class TemplateStructure<TemplateProps, TemplateState, TemplateSnapshot> extends Base {

	// static contextTypes = {
	// 	handleUnAuthorized: PropTypes.func,
	// };

	static defaultProps: Partial<BaseProps> = {
	};

	recurrentIntervalId?: number;

	recurrentDelay?: number;

	constructor(props: BaseProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: null,
		};

		// @ts-ignore
		this.context.handleUnAuthorized = this.props.handleUnAuthorized;

		this.recurrentIntervalId = undefined;
		this.recurrentDelay = 5 * 1000;
	}

	async componentDidMount() {
		console.log('componentDidMount', arguments);

		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		console.log('componentWillUnmount', arguments);

		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	render() {
		console.log('render', arguments);

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
				// @ts-ignore
				this.context.handleUnAuthorized
			);

			if (response.status !== 200) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error(`An error has occurred while performing this operation: ${response.text}`);
			}

			const payload = response.data.result;

			dispatch('api.updateTemplateData', payload);
		} catch (exception) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					clearInterval(this.recurrentIntervalId);

					// TODO check if the hook is navigating to the signIn page!!!
					return;
				}
			}

			this.setState({ error: exception });
			toast.error(exception as string);
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
					this.context.handleUnAuthorized
				);

				if (response.status !== 200) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`An error has occurred while performing this operation: ${response.text}`);
				}

				const payload = response.data.result;

				dispatch('api.updateTemplateData', payload);
			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						clearInterval(this.recurrentIntervalId);

						// TODO check if the hook is navigating to the signIn page!!!
						return;
					}
				}

				this.setState({ error: exception });
				toast.error(exception as string);
			}
		};

		// @ts-ignore
		this.recurrentIntervalId = executeAndSetInterval(recurrentFunction, this.recurrentDelay);
	}
}

const TemplateBehavior = (props: any) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search)
	const [searchParams] = useSearchParams();
	const handleUnAuthorized = useHandleUnauthorized();

	return <
		TemplateStructure
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
export const Template = connect(mapStateToProps)(TemplateBehavior)

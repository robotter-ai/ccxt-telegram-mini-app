import { connect } from 'react-redux';
import axios from 'axios';
// import PropTypes from 'prop-types';
import { Base, BaseProps, BaseSnapshot, BaseState } from 'components/base/Base.tsx';
// import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import { executeAndSetInterval } from 'model/service/recurrent';
// import { apiPostRun } from 'model/service/api';
import Spinner from 'components/views/spinner/Spinner';
import './Development.css';
import { toast } from 'react-toastify';

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

interface DevelopmentProps extends BaseProps {
	stateValue: any,
	propsValue: any,
	fetchedData: any,
}

interface DevelopmentState extends BaseState {
	isLoading: boolean,
	error?: string,
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
interface DevelopmentSnapshot extends BaseSnapshot {
}

const mapStateToProps = (state: DevelopmentState | any, props: DevelopmentProps | any) => ({
	stateValue: state.api.data,
	propsValue: props.value,
})

// @ts-ignore
class DevelopmentStructure<DevelopmentProps, DevelopmentState, DevelopmentSnapshot> extends Base {

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

		// // @ts-ignore
		// this.context.handleUnAuthorized = useHandleUnauthorized();

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
				{error ? <div>Error: {error.message}</div> : null}
				<pre>{JSON.stringify(fetchedData, null, 2)}</pre>
			</div>
		);
	}

	async initialize() {
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
			// 	this.context.handleUnAuthorized
			// );

			const response = {
				status: 200,
				text: null,
				data: {
					result: {
						a: 'b'
					}
				}
			}

			await sleep(2000);

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
				// 	this.context.handleUnAuthorized
				// );

				const response = {
					status: 200,
					text: null,
					data: {
						result: {
							a: 'b'
						}
					}
				}

				if (response.status !== 200) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`An error has occurred while performing this operation: ${response.text}`);
				}

				await sleep(2000);

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

// noinspection JSUnusedGlobalSymbols
export const Development = connect(mapStateToProps)(DevelopmentStructure)

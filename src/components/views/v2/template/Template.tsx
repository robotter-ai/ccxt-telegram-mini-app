import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Box, styled } from '@mui/material';
import { executeAndSetInterval } from 'model/service/recurrent';
import { dispatch } from 'model/state/redux/store';
import {apiGetFetchTickers} from 'model/service/api';
import { Base, BaseProps, BaseState, withHooks } from 'components/base/Base';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';

interface Props extends BaseProps {
	data: any,
	updateTemplateData: (data: any) => void,
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: Props | any) => ({
	data: state.api.template.data,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
const mapDispatchToProps = (reduxDispatch: any) => ({
	updateTemplateData(data: any) {
		dispatch('api.updateTemplateData', data);
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
			const response = await apiGetFetchTickers(
				{ symbols: ['tSOLtUSDC', 'tBTCtUSDC']	},
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

			this.props.updateTemplateData(payload);
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
				const response = await apiGetFetchTickers(
					{ symbols: ['tSOLtUSDC', 'tBTCtUSDC'],	},
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

				this.props.updateTemplateData(payload);
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

export const Template = Behavior;

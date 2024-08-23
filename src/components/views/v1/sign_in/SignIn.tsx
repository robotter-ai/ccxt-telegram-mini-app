import { connect } from 'react-redux';
import axios from 'axios';
import { Base, BaseProps, BaseSnapshot, BaseState } from 'components/base/Base';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import { clearAllIntervals, executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun, apiPostAuthSignIn, apiPostAuthIsSignedIn } from 'model/service/api';
import './SignIn.css';
import { toast } from 'react-toastify';
import { useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// import logo from 'src/assets/images/logo/exchange.png';
import {
	Container,
	Typography,
	TextField,
	Button,
	CircularProgress,
	Box,
	CssBaseline,
	Paper,
	IconButton,
	InputAdornment,
	Snackbar,
} from '@mui/material';

const SignInSchema = Yup.object().shape({
	apiKey: Yup.string()
		.required('API Key is required')
		.matches(/^[a-zA-Z0-9-_]+$/, 'Invalid API Key'),
	apiSecret: Yup.string()
		.required('API Secret is required')
		.matches(/^[a-zA-Z0-9-_]+$/, 'Invalid API Secret'),
	subAccountId: Yup.number()
		.required('Sub Account ID is required')
		.integer('Sub Account ID must be an integer')
		.positive('Sub Account ID must be positive'),
});

const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#FFA500',
		},
		background: {
			default: '#121212',
			paper: '#1d1d1d',
		},
	},
});

const sanitizeInput = (input: string) => {
	return DOMPurify.sanitize(input);
};

interface SignInProps extends BaseProps {
	location: any;
	navigate: any;
	params: any;
	queryParams: any;
	searchParams: any;
	handleUnAuthorized: any;
	isSignedIn: boolean;
}

interface SignInState extends BaseState {
	isLoading: boolean;
	error?: string;
	showApiKey?: boolean;
	showApiSecret?: boolean;
	showSubAccountId?: boolean;
	openSnackbar?: boolean;
	telegramUser?: any;
	queryRedirect?: string;
}

interface SignInSnapshot extends BaseSnapshot {}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	isSignedIn: state.api.isSignedIn,
});

class SignInStructure extends Base<SignInProps, SignInState, SignInSnapshot> {
	recurrentIntervalId?: number;
	recurrentDelay?: number;

	constructor(props: SignInProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
			showApiKey: false,
			showApiSecret: false,
			showSubAccountId: false,
			openSnackbar: false,
			telegramUser: undefined,
			queryRedirect: this.props.searchParams.get('redirect') || '/',
		};

		this.recurrentIntervalId = undefined;
		this.recurrentDelay = 5 * 1000;
	}

	async componentDidMount() {
		await this.initialize();
		// await this.doRecurrently();
	}

	async componentWillUnmount() {
		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	render() {
		const { isLoading, error } = this.state;

		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Box
					sx={{
						minHeight: '100vh',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						bgcolor: 'background.default',
					}}
				>
					<Container component="main" maxWidth="xs">
						<Paper elevation={6} sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
							{/*<img src={logo} alt="Logo" style={{ height: '100px', marginBottom: '20px' }} />*/}
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								{isLoading && <CircularProgress sx={{ mt: 2 }} />}
								{error && <Typography color="error">{error}</Typography>}
								<Formik
									initialValues={{
										apiKey: `${import.meta.env.VITE_EXCHANGE_API_KEY}`,
										apiSecret: `${import.meta.env.VITE_EXCHANGE_API_SECRET}`,
										subAccountId: `${import.meta.env.VITE_EXCHANGE_OPTIONS_SUB_ACCOUNT_ID}`
									}}
									validationSchema={SignInSchema}
									onSubmit={async (values, { setSubmitting }) => {
										await this.signIn(values.apiKey, values.apiSecret, Number(values.subAccountId));
										setSubmitting(false);
									}}
								>
									{({ isSubmitting }) => (
										<Form>
											<Field
												name="apiKey"
												as={TextField}
												variant="outlined"
												margin="normal"
												fullWidth
												label="API Key"
												autoComplete="apiKey"
												type={this.state.showApiKey ? 'text' : 'password'}
												autoFocus
												InputProps={{
													endAdornment: (
														<InputAdornment position="end">
															<IconButton
																aria-label="toggle API key visibility"
																onClick={() => this.handleClickShowPassword('showApiKey')}
																edge="end"
															>
																{this.state.showApiKey ? <VisibilityOff /> : <Visibility />}
															</IconButton>
														</InputAdornment>
													),
												}}
												helperText={<ErrorMessage name="apiKey" />}
											/>
											<Field
												name="apiSecret"
												as={TextField}
												variant="outlined"
												margin="normal"
												fullWidth
												label="API Secret"
												type={this.state.showApiSecret ? 'text' : 'password'}
												autoComplete="apiSecret"
												InputProps={{
													endAdornment: (
														<InputAdornment position="end">
															<IconButton
																aria-label="toggle API secret visibility"
																onClick={() => this.handleClickShowPassword('showApiSecret')}
																edge="end"
															>
																{this.state.showApiSecret ? <VisibilityOff /> : <Visibility />}
															</IconButton>
														</InputAdornment>
													),
												}}
												helperText={<ErrorMessage name="apiSecret" />}
											/>
											<Field
												name="subAccountId"
												as={TextField}
												variant="outlined"
												margin="normal"
												fullWidth
												label="Sub Account ID"
												type={this.state.showSubAccountId ? 'text' : 'password'}
												autoComplete="subAccountId"
												InputProps={{
													endAdornment: (
														<InputAdornment position="end">
															<IconButton
																aria-label="toggle sub account ID visibility"
																onClick={() => this.handleClickShowPassword('showSubAccountId')}
																edge="end"
															>
																{this.state.showSubAccountId ? <VisibilityOff /> : <Visibility />}
															</IconButton>
														</InputAdornment>
													),
												}}
												helperText={<ErrorMessage name="subAccountId" />}
											/>
											<Button
												type="submit"
												fullWidth
												variant="contained"
												color="primary"
												disabled={isSubmitting}
												sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
											>
												<LockOutlinedIcon sx={{ mr: 1 }} />
												Sign In
											</Button>
										</Form>
									)}
								</Formik>
							</Box>
						</Paper>
						<Snackbar
							open={this.state.openSnackbar}
							autoHideDuration={6000}
							onClose={this.handleCloseSnackbar}
							message={error ? error : 'An error occurred'}
						/>
					</Container>
				</Box>
			</ThemeProvider>
		);
	}

	async initialize() {
		try {
			if (Telegram && Telegram.WebApp) {
				Telegram.WebApp.ready();

				let telegramUser = Telegram.WebApp.initDataUnsafe.user;

				if (!telegramUser) {
					telegramUser = {
						id: import.meta.env.VITE_TELEGRAM_USER_ID,
					} as any;
				}

				this.setState({ telegramUser });
				dispatch('telegram.updateTelegramUser', telegramUser);

				const response = await apiPostAuthIsSignedIn(
					{
						exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
						exchangeEnvironment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
						// @ts-ignore
						userTelegramId: `${sanitizeInput(telegramUser.id)}`,
					}
				);

				const payload = response.data.result;

				if (response.status === 200 && payload === true) {
					dispatch('api.updateIsSignedIn', payload);

					await this.loadCurrencies();
					await this.loadMarkets();

					this.props.navigate(this.state.queryRedirect);
				} else {
					dispatch('api.updateIsSignedIn', false);
				}
			}
		} catch (exception: any) {
			if (axios.isAxiosError(exception)) {
				if ([401, 417].includes(Number(exception?.response?.status))) {
					clearAllIntervals();
					return;
				}
			}

			console.error(exception);
			this.setState({ error: exception.message });
			toast.error(exception.message);
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
					this.props.handleUnAuthorized
				);

				if (response.status !== 200) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`An error has occurred while performing this operation: ${response.text}`);
				}

				const payload = response.data.result;
				dispatch('api.updateSignInData', payload);
			} catch (exception: any) {
				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						clearInterval(this.recurrentIntervalId);
						return;
					}
				}

				console.error(exception);
				this.setState({ error: exception.message });
				toast.error(exception.message);
			}
		};

		// @ts-ignore
		this.recurrentIntervalId = executeAndSetInterval(recurrentFunction, this.recurrentDelay);
	}

	handleClickShowPassword = (field: string) => {
		// @ts-ignore
		this.setState((prevState: any) => ({
			[field]: !(prevState[field] as boolean),
		}));
	};

	handleCloseSnackbar = () => {
		this.setState({ openSnackbar: false });
	};

	signIn = async (apiKey: string, apiSecret: string, subAccountId: number) => {
		this.setState({ isLoading: true, error: undefined });

		try {
			const response = await apiPostAuthSignIn(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					exchangeEnvironment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					userTelegramId: `${this.state.telegramUser ? sanitizeInput(this.state.telegramUser.id) : undefined}`,
					exchangeApiKey: `${sanitizeInput(apiKey)}`,
					exchangeApiSecret: `${sanitizeInput(apiSecret)}`,
					exchangeOptions: {
						subAccountId: `${Number(subAccountId)}`,
					},
				},
				this.props.handleUnAuthorized
			);

			if (!(response.status === 200)) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error('Network response was not OK');
			}

			const payload = response.data;

			dispatch('api.signIn', payload.token);

			const { configure } = await import('model/service/recurrent');
			configure(this.props.handleUnAuthorized);

			await this.loadCurrencies();
			await this.loadMarkets();

			this.props.navigate(this.state.queryRedirect);
		} catch (exception: any) {
			console.error(exception);
			this.setState({ error: exception.message, openSnackbar: true });
			toast.error(exception.message);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	loadMarkets = async () => {
		this.setState({ isLoading: true, error: undefined });

		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_markets',
				},
				// @ts-ignore
				this.context.handleUnAuthorized
			);

			if (!(response.status === 200)) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error('Network response was not OK');
			}

			const payload = response.data.result;

			dispatch('api.updateMarkets', payload);
		} catch (exception: any) {
			console.error(exception);
			this.setState({ error: exception.message, openSnackbar: true });
			toast.error(exception.message);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	loadCurrencies = async () => {
		this.setState({ isLoading: true, error: undefined });

		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_currencies',
				},
				// @ts-ignore
				this.context.handleUnAuthorized
			);

			if (!(response.status === 200)) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error('Network response was not OK');
			}

			const payload = response.data.result;

			dispatch('api.updateCurrencies', payload);
		} catch (exception: any) {
			console.error(exception);
			this.setState({ error: exception.message, openSnackbar: true });
			toast.error(exception.message);
		} finally {
			this.setState({ isLoading: false });
		}
	};
}

const SignInBehavior = (props: any) => {
	const navigate = useNavigate();
	const handleUnAuthorized = useHandleUnauthorized();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const params = useParams();
	const [searchParams] = useSearchParams();

	return (
		<SignInStructure
			{...props}
			location={location}
			navigate={navigate}
			params={params}
			queryParams={queryParams}
			searchParams={searchParams}
			handleUnAuthorized={handleUnAuthorized}
		/>
	);
};

export const SignIn = connect(mapStateToProps)(SignInBehavior);

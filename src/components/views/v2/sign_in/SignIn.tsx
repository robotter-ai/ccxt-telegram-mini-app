import { connect } from 'react-redux';
import axios from 'axios';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import {
	apiPostAuthSignIn,
	apiPostAuthIsSignedIn,
	apiGetFetchMarkets,
	apiGetFetchCurrencies
} from 'model/service/api';
import './SignIn.css';
import { toast } from 'react-toastify';
import { useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import {
	Container,
	Typography,
	TextField,
	Button,
	Box,
	CssBaseline,
	Paper,
	IconButton,
	InputAdornment,
	Snackbar,
	Link, CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import logo from 'src/assets/images/logo/cube.png';
import { clearAllIntervals } from 'model/service/recurrent';

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
		primary: { main: '#FFA500' },
		background: { default: 'black', paper: 'black' },
	},
});

const sanitizeInput = (input: string) => DOMPurify.sanitize(input);

interface SignInProps extends BaseProps {
	isSignedIn: boolean;
}

interface SignInState extends BaseState {
	isLoading: boolean;
	error?: string;
	showPassword: {
		apiKey: boolean;
		apiSecret: boolean;
		subAccountId: boolean;
	};
	openSnackbar: boolean;
	telegramUser?: any;
	queryRedirect: string;
	focusedField: string | null;
}

const mapStateToProps = (state: any) => ({
	isSignedIn: state.api.isSignedIn,
});

class SignInStructure extends Base<SignInProps, SignInState> {
	recurrentIntervalId?: number;

	constructor(props: SignInProps) {
		super(props);
		this.state = {
			isLoading: true,
			error: undefined,
			showPassword: { apiKey: false, apiSecret: false, subAccountId: false },
			openSnackbar: false,
			telegramUser: undefined,
			queryRedirect: new URLSearchParams(window.location.search).get('redirect') || '/',
			focusedField: null,
		};
	}

	async componentDidMount() {
		await this.initialize();
	}

	componentWillUnmount() {
		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	render() {
		const { isLoading, error, showPassword, openSnackbar, focusedField } = this.state;

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
						bgcolor: 'background.default', // Uses the default background color from the theme
						width: '100%',
					}}
				>
					<Container component="main" maxWidth="md">
						<Paper
							elevation={0} // Remove elevation to avoid any shadow effects
							sx={{
								p: 4,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								width: '100%',
								backgroundColor: 'transparent', // Ensure the Paper background is transparent
							}}
						>
							<img src={logo} alt="Logo" style={{ height: '50px', marginBottom: '20px', borderRadius: '10%' }} />
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
								{isLoading && <CircularProgress sx={{ mt: 2 }} />}
								{error && <Typography color="error">{error}</Typography>}
								<Formik
									initialValues={{
										apiKey: `${import.meta.env.VITE_EXCHANGE_API_KEY}`,
										apiSecret: `${import.meta.env.VITE_EXCHANGE_API_SECRET}`,
										subAccountId: `${import.meta.env.VITE_EXCHANGE_OPTIONS_SUB_ACCOUNT_ID}`,
									}}
									validationSchema={SignInSchema}
									onSubmit={this.handleSubmit}
								>
									{({ isSubmitting }) => (
										<Form style={{ width: '100%' }}>
											{['apiKey', 'apiSecret', 'subAccountId'].map((field) => (
												<Field
													key={field}
													name={field}
													as={TextField}
													variant="outlined"
													margin="normal"
													fullWidth
													label={field.replace(/([A-Z])/g, ' $1')}
													type={showPassword[field as keyof SignInState['showPassword']] ? 'text' : 'password'}
													onFocus={() => this.setState({ focusedField: field })}
													onBlur={() => this.setState({ focusedField: null })}
													InputProps={{
														endAdornment: (
															<InputAdornment position="end">
																<IconButton
																	aria-label={`toggle ${field} visibility`}
																	onClick={() => this.toggleShowPassword(field as keyof SignInState['showPassword'])}
																	sx={{
																		color: focusedField === field ? 'primary.main' : 'inherit',
																	}}
																>
																	{showPassword[field as keyof SignInState['showPassword']] ? <VisibilityOff /> : <Visibility />}
																</IconButton>
															</InputAdornment>
														),
													}}
													helperText={<ErrorMessage name={field} />}
												/>
											))}
											<Button
												type="submit"
												fullWidth
												variant="contained"
												color="primary"
												disabled={isSubmitting}
												sx={{ mt: 3, mb: 2, borderRadius: '50px', fontWeight: 'bold' }}
											>
												Sign In
											</Button>
											<Link href="#" variant="body2" sx={{ color: 'primary.main', textAlign: 'center', display: 'block' }}>
												Where to get it?
											</Link>
										</Form>
									)}
								</Formik>
							</Box>
						</Paper>
						<Snackbar
							open={openSnackbar}
							autoHideDuration={6000}
							onClose={this.handleCloseSnackbar}
							message={error || 'An error occurred'}
						/>
						{/*<Link
							component={RouterLink}
							to="google-login"
							variant="body2"
							sx={{ color: 'primary.main', textAlign: 'center', display: 'block', mt: 4 }}
						>
							Login with Google
						</Link>*/}
					</Container>
				</Box>
			</ThemeProvider>
		);
	}

	toggleShowPassword = (field: keyof SignInState['showPassword']) => {
		this.setState((prevState) => ({
			showPassword: { ...prevState.showPassword, [field]: !prevState.showPassword[field] },
		}));
	};

	handleCloseSnackbar = () => this.setState({ openSnackbar: false });

	handleSubmit = async (values: any, { setSubmitting }: any) => {
		this.setState({ isLoading: true, error: undefined });
		try {
			const response = await apiPostAuthSignIn({
				exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
				exchangeEnvironment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
				userTelegramId: `${this.state.telegramUser ? sanitizeInput(this.state.telegramUser.id) : undefined}`,
				exchangeApiKey: `${sanitizeInput(values.apiKey)}`,
				exchangeApiSecret: `${sanitizeInput(values.apiSecret)}`,
				exchangeOptions: { subAccountId: `${Number(values.subAccountId)}` },
			}, this.props.handleUnAuthorized);

			if (response.status !== 200) throw new Error('Network response was not OK');

			dispatch('api.signIn', response.data.token);
			await this.initializeAfterSignIn();
			this.props.navigate(this.state.queryRedirect);
		} catch (exception: any) {
			console.error(exception);
			this.setState({ error: exception.message, openSnackbar: true });
			toast.error(exception.message);
		} finally {
			this.setState({ isLoading: false });
			setSubmitting(false);
		}
	};

	async initialize() {
		try {
			if (Telegram?.WebApp) {
				Telegram.WebApp.ready();
				let telegramUser = Telegram.WebApp.initDataUnsafe.user || { id: import.meta.env.VITE_TELEGRAM_USER_ID };
				this.setState({ telegramUser });
				dispatch('telegram.updateTelegramUser', telegramUser);

				const response = await apiPostAuthIsSignedIn({
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					exchangeEnvironment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					userTelegramId: `${sanitizeInput(telegramUser.id)}`,
				});

				const isSignedIn = response.data.result;
				dispatch('api.updateIsSignedIn', isSignedIn);

				if (isSignedIn) {
					await this.initializeAfterSignIn();
					this.props.navigate(this.state.queryRedirect);
				}
			}
		} catch (exception: any) {
			if (axios.isAxiosError(exception) && [401, 417].includes(Number(exception.response?.status))) {
				clearAllIntervals();
				return;
			}
			console.error(exception);
			this.setState({ error: exception.message });
			toast.error(exception.message);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async initializeAfterSignIn() {
		await this.loadMarkets();
		await this.loadCurrencies();
	}

	loadMarkets = async () => {
		this.setState({ isLoading: true });
		try {
			const response = await apiGetFetchMarkets({}, this.props.handleUnAuthorized);

			if (response.status !== 200) throw new Error('Network response was not OK');
			dispatch('api.updateMarkets', response.data.result);
		} catch (exception: any) {
			console.error(exception);
			this.setState({ error: exception.message, openSnackbar: true });
			toast.error(exception.message);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	loadCurrencies = async () => {
		this.setState({ isLoading: true });
		try {
			const response = await apiGetFetchCurrencies({}, this.props.handleUnAuthorized);

			if (response.status !== 200) throw new Error('Network response was not OK');
			dispatch('api.updateCurrencies', response.data.result);
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

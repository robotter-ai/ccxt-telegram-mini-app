import { connect } from 'react-redux';
import { Link as RouterLink, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { dispatch } from 'model/state/redux/store';
import { apiPostAuthIsSignedIn, apiPostAuthSignIn, apiPostRun } from 'model/service/api';
import {
	Box,
	Button,
	CircularProgress,
	Container,
	IconButton,
	InputAdornment,
	Paper,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import logo from 'src/assets/images/logo/cube.svg';
import { clearAllIntervals } from 'model/service/recurrent';
import { MaterialUITheme } from 'model/theme/MaterialUI';

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
			<Box
				sx={{
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					bgcolor: 'background.default',
					width: '100%',
					paddingY: 4,
					gap: 2,
				}}
			>
				<Box sx={{ marginTop: 2, mb: { xs: 4, md: 6 } }}>
					<img
						src={logo}
						alt="Logo"
						style={{
							height: '6rem',
							marginBottom: '1rem',
							borderRadius: '10%',
						}}
					/>
				</Box>
				<Container component="main" maxWidth="md" sx={{ mb: 6 }}>
					<Paper
						elevation={0}
						sx={{
							p: 4,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							width: '100%',
							backgroundColor: 'transparent',
						}}
					>
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
												label={field.replace(/([A-Z])/g, ' $1').toUpperCase()}
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
													sx: {
														borderRadius: '1rem',
													},
												}}
												helperText={<ErrorMessage name={field} />}
											/>
										))}
										<Button
											type="submit"
											fullWidth
											variant="contained"
											sx={{
												mt: 3,
												mb: 2,
												borderRadius: '50px',
												backgroundColor: `${MaterialUITheme.palette.text.primary}`,
												color: 'black',
												border: 'none',
											}}
											disabled={isSubmitting}
										>
											Sign In
										</Button>
										<Button
											fullWidth
											variant="contained"
											sx={{
												mt: 1,
												borderRadius: '50px',
												backgroundColor: 'black',
												color: 'white',
												border: '2px solid white',
											}}
											component={RouterLink}
											to="/where-to-get-it"
										>
											Where to get it?
										</Button>
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
			const response = await apiPostAuthSignIn(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					exchangeEnvironment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					userTelegramId: `${this.state.telegramUser ? sanitizeInput(this.state.telegramUser.id) : undefined}`,
					exchangeApiKey: `${sanitizeInput(values.apiKey)}`,
					exchangeApiSecret: `${sanitizeInput(values.apiSecret)}`,
					exchangeOptions: { subAccountId: `${Number(values.subAccountId)}` },
				},
				this.props.handleUnAuthorized
			);

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
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_markets',
				},
				this.props.handleUnAuthorized
			);

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
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_currencies',
				},
				this.props.handleUnAuthorized
			);

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

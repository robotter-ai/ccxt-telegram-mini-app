import { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { apiPostAuthSignIn } from 'model/service/api';
import { connect } from 'react-redux';
import { dispatch } from 'model/state/redux/store';
import {
	Container,
	Typography,
	TextField,
	Button,
	CircularProgress,
	Box,
	CssBaseline,
	Paper,
	Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	isSignedIn: state.api.isSignedIn,
});

const SignInSchema = Yup.object().shape({
	apiKey: Yup.string()
		.required('API Key is required')
		.matches(/^[a-zA-Z0-9-_]+$/, 'Invalid API Key'),
		// .matches(
		// 	/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
		// 	'Invalid API Key format'
		// ),
	apiSecret: Yup.string()
		.required('API Secret is required')
		.matches(/^[a-zA-Z0-9-_]+$/, 'Invalid API Secret'),
		// .matches(
		// 	/^[a-f0-9]{64}$/,
		// 	'Invalid API Secret format'
		// ),
	subAccountId: Yup.number()
		.required('Sub Account ID is required')
		.integer('Sub Account ID must be an integer')
		.positive('Sub Account ID must be positive'),
});

const sanitizeInput = (input: string) => {
	return DOMPurify.sanitize(input);
};

const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#90caf9',
		},
		background: {
			default: '#121212',
			paper: '#1d1d1d',
		},
	},
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const SignInStructure = (props: any) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null as any);

	const handleUnAuthorized = useHandleUnauthorized();

	const signIn = async (apiKey: string, apiSecret: string, subAccountId: number) => {
		setLoading(true);
		setError(null);

		try {
			const response = await apiPostAuthSignIn(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					exchangeEnvironment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					exchangeApiKey: `${sanitizeInput(apiKey)}`,
					exchangeApiSecret: `${sanitizeInput(apiSecret)}`,
					exchangeOptions: {
						subAccountId: `${Number(subAccountId)}`,
					},
				},
				handleUnAuthorized
			);

			if (!(response.status === 200)) {
				// noinspection ExceptionCaughtLocallyJS
				throw new Error('Network response was not OK');
			}

			const payload = response.data;

			dispatch('api.signIn', payload.token);

			const { configure } = await import('model/service/recurrent');
			configure(handleUnAuthorized);
		} catch (error: any) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Container component="main" maxWidth="xs">
				<Paper elevation={6} sx={{ padding: 2, marginTop: 8 }}>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
							<LockOutlinedIcon />
						</Avatar>
						<Typography component="h1" variant="h5">
							Sign In
						</Typography>
						{loading && <CircularProgress sx={{ mt: 2 }} />}
						{error && <Typography color="error">{error.message}</Typography>}
						<Formik
							initialValues={{
								apiKey: `${import.meta.env.VITE_EXCHANGE_API_KEY}`,
								apiSecret: `${import.meta.env.VITE_EXCHANGE_API_KEY}`,
								subAccountId: `${import.meta.env.VITE_EXCHANGE_OPTIONS_SUB_ACCOUNT_ID}`
							}}
							validationSchema={SignInSchema}
							onSubmit={async (values, { setSubmitting }) => {
								await signIn(values.apiKey, values.apiSecret, Number(values.subAccountId));
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
										type="password"
										autoFocus
										helperText={<ErrorMessage name="apiKey" />}
									/>
									<Field
										name="apiSecret"
										as={TextField}
										variant="outlined"
										margin="normal"
										fullWidth
										label="API Secret"
										type="password"
										autoComplete="apiSecret"
										helperText={<ErrorMessage name="apiSecret" />}
									/>
									<Field
										name="subAccountId"
										as={TextField}
										variant="outlined"
										margin="normal"
										fullWidth
										label="Sub Account ID"
										type="password"
										autoComplete="subAccountId"
										helperText={<ErrorMessage name="subAccountId" />}
									/>
									<Button
										type="submit"
										fullWidth
										variant="contained"
										color="primary"
										disabled={isSubmitting}
										sx={{ mt: 3, mb: 2 }}
									>
										Submit
									</Button>
								</Form>
							)}
						</Formik>
					</Box>
				</Paper>
			</Container>
		</ThemeProvider>
	);
};

const SignIn = connect(mapStateToProps)(SignInStructure);

export default SignIn;

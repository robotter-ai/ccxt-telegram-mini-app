import { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { apiPostAuthSignIn } from 'model/service/api';
import { connect } from 'react-redux';
import { dispatch } from 'model/state/redux/store';

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
		<div>
			{loading && <div>Loading...</div>}
			{error && <div>Error: {error.message}</div>}
			<Formik
				initialValues={{ apiKey: `${import.meta.env.VITE_EXCHANGE_API_KEY}`, apiSecret: `${import.meta.env.VITE_EXCHANGE_API_KEY}`, subAccountId: `${import.meta.env.VITE_EXCHANGE_OPTIONS_SUB_ACCOUNT_ID}` }}
				validationSchema={SignInSchema}
				onSubmit={async (values, { setSubmitting }) => {
					await signIn(values.apiKey, values.apiSecret, Number(values.subAccountId));
					setSubmitting(false);
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<div>
							<label htmlFor="apiKey">API Key</label>
							<Field type="text" name="apiKey" />
							<ErrorMessage name="apiKey" component="div" />
						</div>
						<div>
							<label htmlFor="apiSecret">API Secret</label>
							<Field type="password" name="apiSecret" />
							<ErrorMessage name="apiSecret" component="div" />
						</div>
						<div>
							<label htmlFor="subAccountId">Sub Account ID</label>
							<Field type="text" name="subAccountId" />
							<ErrorMessage name="subAccountId" component="div" />
						</div>
						<div>
							<button type="submit" disabled={isSubmitting}>
								Submit
							</button>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
};

const SignIn = connect(mapStateToProps)(SignInStructure);

export default SignIn;

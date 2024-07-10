import { useEffect, useState } from 'react';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { apiPostAuthSignIn } from 'model/service/api';

import { connect } from 'react-redux';

const mapStateToProps = (state: any, props: any) => ({
	status: state.api.signin.status,
})

const SignInStructure = (state: any) => {
	const [ loading, setLoading ] = useState(true);
	const [ error, setError ] = useState(null as any);

	const handleUnAuthorized = useHandleUnauthorized();

	const signIn = async (apiKey: string, apiSecret: string, subAccountId: number) => {
		await apiPostAuthSignIn({
			'exchangeId': `${import.meta.env.VITE_EXCHANGE_ID}`,
			'exchangeEnvironment': `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
			'exchangeApiKey': `${apiKey}`,
			'exchangeApiSecret': `${apiSecret}`,
			'exchangeOptions': {
				'subAccountId': `${subAccountId}`,
			}
		}, handleUnAuthorized);
	}

	useEffect(() => {
		// @ts-ignore
		const fetchData = async () => {
			try {
			} catch (error: any) {
				setError(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div>
		</div>
	);
};

const SignIn = connect(mapStateToProps)(SignInStructure)

export default SignIn

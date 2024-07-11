import React from 'react';
import { Navigate } from 'react-router';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Orders from 'components/views/orders/Orders.tsx';
import DevelopmentHome from 'components/views/development/Development';
import SignIn from 'components/views/sign_in/SignIn';
import { connect } from 'react-redux';

const mapStateToProps = (state: any) => ({
	isSignedIn: state.api.isSignedIn,
});

interface RouterProps {
	isSignedIn: boolean;
}

class RouterStructure extends React.Component<RouterProps> {
	render() {
		const { isSignedIn } = this.props;

		const SignInRedirect = () => <Navigate to="/signIn" />;
		const RootRedirect = () => <Navigate to="/" />;

		// @ts-ignore
		const normalizeRoute = (route: string) => {
			return route
				.toLowerCase()
				.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
		};

		return (
			<BrowserRouter>
				<div>
					<Routes>
						{/*
							Public
						*/}
						<Route path="/signIn" element={<SignIn />} />

						{/*
							User
						*/}
						<Route path="/" element={<Navigate to="/orders" />} />
						<Route path="/home" element={<Navigate to="/" />} />
						<Route path="/orders" element={isSignedIn ? <Orders /> : <SignInRedirect />} />

						{/*
							Development
						*/}
						<Route path="/development" element={isSignedIn ? <DevelopmentHome /> : <SignInRedirect />} />

						{/*
							Redirect unknown routes
						*/}
						<Route
							path="*"
							element={
								isSignedIn ? <RootRedirect /> : <SignInRedirect />
							}
						/>
					</Routes>
				</div>
			</BrowserRouter>
		);
	}
}

const Router = connect(mapStateToProps)(RouterStructure);

export default Router;

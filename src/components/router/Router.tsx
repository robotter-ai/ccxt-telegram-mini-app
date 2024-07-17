import React from 'react';
import { connect } from 'react-redux';
import { Navigate, useLocation, BrowserRouter, Routes, Route } from 'react-router-dom';
import { Orders } from 'components/views/orders/Orders.tsx';
import { Development } from 'components/views/development/Development';
import { SignIn } from 'components/views/sign_in/SignIn';
import { Markets } from 'components/views/markets/Markets.tsx';
import { Market } from 'components/views/market/Market.tsx';

const mapStateToProps = (state: any) => ({
	isSignedIn: state.api.isSignedIn,
});

// Function to normalize route to camelCase
const normalizeRoute = (route: string) => {
	return route
		.toLowerCase()
		.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
};

// Custom component to handle normalized routes
const NormalizedRouteStructure: React.FC<{ element: React.ReactNode, checkAuthentication?: boolean, isSignedIn: boolean }> = ({ element, checkAuthentication = false, isSignedIn = false }) => {
	const location = useLocation();
	const normalizedPath = normalizeRoute(location.pathname);

	if (normalizedPath !== location.pathname) {
		return <Navigate to={normalizedPath} />;
	}

	if (checkAuthentication && !isSignedIn) {
		const redirectUrl = `${location.pathname}${location.search}`;
		return <Navigate to={`/signIn?redirect=${encodeURIComponent(redirectUrl)}`} />;
	}

	return <>{element}</>;
};

const NormalizedRoute = connect(mapStateToProps)(NormalizedRouteStructure)

const RouterStructure = () => {
	return (
		<BrowserRouter>
			<Routes>
				{/*
					Public
				*/}
				<Route path="/signIn" element={<SignIn />} />

				{/*
					User
				*/}
				<Route path="/" element={<Navigate to="/markets" />} />
				<Route path="/home" element={<Navigate to="/" />} />
				<Route path="/orders" element={<NormalizedRoute element={<Orders />} checkAuthentication />} />
				<Route path="/markets" element={<NormalizedRoute element={<Markets />} checkAuthentication />} />
				<Route path="/market" element={<NormalizedRoute element={<Market />} checkAuthentication />} />
				<Route path="/market/:marketId" element={<NormalizedRoute element={<Market />} checkAuthentication />} />

				{/*
					Development
				*/}
				<Route path="/development" element={<NormalizedRoute element={<Development />} checkAuthentication />} />

				{/*
					Redirect unknown routes
				*/}
				<Route
					path="*"
					element={<NormalizedRoute element={<Navigate to="/" />} checkAuthentication />}
				/>
			</Routes>
		</BrowserRouter>
	);
};

export const Router = connect(mapStateToProps)(RouterStructure);

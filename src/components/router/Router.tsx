import React from 'react';
import { connect } from 'react-redux';
import { Navigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import { Orders as V1Orders } from 'components/views/v1/orders/Orders';
import { Development as V1Development } from 'components/views/v1/development/Development';
import { SignIn as V1SignIn } from 'components/views/v1/sign_in/SignIn';
import { Markets as V1Markets } from 'components/views/v1/markets/Markets';
import { Market as V1Market } from 'components/views/v1/market/Market';
import { MainLayout as V1MainLayout } from 'components/views/v1/main/MainLayout';
import { CreateOrder as V1CreateOrder } from 'components/views/v1/order/CreateOrder.tsx';
import { Balance as V1Balance } from 'components/views/v1/balance/Balance';

const mapStateToProps = (state: any) => ({
	isSignedIn: state.api.isSignedIn,
});

const NormalizedRouteStructure: React.FC<{ element: React.ReactNode, checkAuthentication?: boolean, isSignedIn: boolean }> = ({ element, checkAuthentication = false, isSignedIn = false }) => {
	if (checkAuthentication && !isSignedIn) {
		const redirectUrl = `${location.pathname}${location.search}`;
		return <Navigate to={`/signIn?redirect=${encodeURIComponent(redirectUrl)}`} />;
	}
	return <>{element}</>;
};

const NormalizedRoute = connect(mapStateToProps)(NormalizedRouteStructure);

const RouterStructure = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/signIn" element={<V1SignIn />} />
				<Route path="/" element={<V1MainLayout />}>
					<Route path="/" element={<Navigate to="/markets" />} />
					<Route path="/home" element={<Navigate to="/" />} />
					<Route path="/orders" element={<NormalizedRoute element={<V1Orders />} checkAuthentication />} />
					<Route path="/markets" element={<NormalizedRoute element={<V1Markets />} checkAuthentication />} />
					<Route path="/market" element={<NormalizedRoute element={<V1Market />} checkAuthentication />} />
					<Route path="/market/:marketId" element={<NormalizedRoute element={<V1Market />} checkAuthentication />} />
					<Route path="/development" element={<NormalizedRoute element={<V1Development />} />} />
					<Route path="/createOrder" element={<NormalizedRoute element={<V1CreateOrder />} checkAuthentication />} />
					<Route path="/balance" element={<NormalizedRoute element={<V1Balance />} checkAuthentication />} />
					<Route path="*" element={<Navigate to="/" />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export const Router = connect(mapStateToProps)(RouterStructure);

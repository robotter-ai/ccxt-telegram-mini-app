import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Navigate, BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Constant } from 'model/enum/constant.ts';

import { Main as V1Main } from 'components/views/v1/main/Main';
import { SignIn as V1SignIn } from 'components/views/v1/sign_in/SignIn';
import { Balances as V1Balances } from 'components/views/v1/balances/Balances';
import { Markets as V1Markets } from 'components/views/v1/markets/Markets';
import { Market as V1Market } from 'components/views/v1/market/Market';
import { Orders as V1Orders } from 'components/views/v1/orders/Orders';
import { CreateOrder as V1CreateOrder } from 'components/views/v1/order/CreateOrder';
import { Development as V1Development } from 'components/views/v1/development/Development';

import { Main as V2Main } from 'components/views/v2/main/Main';
// import { SignIn as V2SignIn } from 'components/views/v2/sign_in/SignIn';
// import { Balances as V2Balances } from 'components/views/v2/balances/Balances';
// import { Markets as V2Markets } from 'components/views/v2/markets/Markets';
// import { Market as V2Market } from 'components/views/v2/market/Market';
// import { Orders as V2Orders } from 'components/views/v2/orders/Orders';
// import { CreateOrder as V2CreateOrder } from 'components/views/v2/order/CreateOrder';
import { Development as V2Development } from 'components/views/v2/development/Development';

const mapStateToProps = (state: any) => ({
	isSignedIn: state.api.isSignedIn,
});

const NormalizedRouteStructure: React.FC<{ element: React.ReactNode, checkAuthentication?: boolean, isSignedIn: boolean }> = ({ element, checkAuthentication = false, isSignedIn = false }) => {
	if (checkAuthentication && !isSignedIn) {
		let redirectUrl = `${location.pathname}${location.search}`;
		if (redirectUrl.includes(Constant.v2Path.value)) {
			return <Navigate to={`${Constant.v2SignInPath.value}?redirect=${encodeURIComponent(redirectUrl)}`}/>;
		} else {
			if (!redirectUrl) redirectUrl = Constant.v1Path.value;

			return <Navigate to={`${Constant.v1SignInPath.value}?redirect=${encodeURIComponent(redirectUrl)}`}/>;
		}
	}
	return <>{element}</>;
};

const NormalizedRoute = connect(mapStateToProps)(NormalizedRouteStructure);

// @ts-ignore
// noinspection JSUnusedLocalSymbols
function RouteLogger({ children }) {
	const location = useLocation();

	useEffect(() => {
		console.log('Navigating to URL:', location.pathname + location.search);
	}, [location]);

	return children;
}

const RouterContent = () => {
	const location = useLocation();

	return (
		<Routes>
			<Route path={Constant.rootPath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.rootPath.value}`} />} />
			<Route path={Constant.signInPath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.signInPath.value}`} />} />
			<Route path={Constant.homePath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.homePath.value}`} />} />
			<Route path={Constant.ordersPath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.ordersPath.value}`} />} />
			<Route path={Constant.marketsPath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.marketsPath.value}`} />} />
			<Route path={Constant.marketPath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.marketPath.value}${location.search}`} />} />
			<Route path={Constant.createOrderPath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.createOrderPath.value}`} />} />
			<Route path={Constant.balancesPath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.balancesPath.value}`} />} />
			<Route path={Constant.developmentPath.value} element={<Navigate to={`${Constant.currentRoutePath.value}${Constant.developmentPath.value}`} />} />

			<Route path={Constant.v1SignInPath.value}  element={<V1SignIn />} />
			<Route path={Constant.v1Path.value} element={<V1Main />}>
				<Route path={Constant.v1Path.value} element={<Navigate to={Constant.v1MarketsPath.value} />} />
				<Route path={Constant.v1HomePath.value} element={<Navigate to={Constant.v1Path.value} />} />
				<Route path={Constant.v1OrdersPath.value} element={<NormalizedRoute element={<V1Orders />} checkAuthentication />} />
				<Route path={Constant.v1MarketsPath.value} element={<NormalizedRoute element={<V1Markets />} checkAuthentication />} />
				<Route path={Constant.v1MarketPath.value} element={<NormalizedRoute element={<V1Market />} checkAuthentication />} />
				<Route path={Constant.v1CreateOrderPath.value} element={<NormalizedRoute element={<V1CreateOrder />} checkAuthentication />} />
				<Route path={Constant.v1BalancesPath.value} element={<NormalizedRoute element={<V1Balances />} checkAuthentication />} />
				<Route path={Constant.v1DevelopmentPath.value} element={<NormalizedRoute element={<V1Development />} />} />
			</Route>

			{/* <Route path={Constant.v2SignInPath.value}  element={<V2SignIn />} /> */}
			<Route path={Constant.v2Path.value} element={<V2Main />}>
				<Route path={Constant.v2Path.value} element={<Navigate to={Constant.v2MarketsPath.value} />} />
				<Route path={Constant.v2HomePath.value} element={<Navigate to={Constant.v2Path.value} />} />
				{/* <Route path={Constant.v2OrdersPath.value} element={<NormalizedRoute element={<V2Orders />} checkAuthentication />} /> */}
				{/* <Route path={Constant.v2MarketsPath.value} element={<NormalizedRoute element={<V2Markets />} checkAuthentication />} /> */}
				{/* <Route path={Constant.v2MarketPath.value} element={<NormalizedRoute element={<V2Market />} checkAuthentication />} /> */}
				{/* <Route path={Constant.v2CreateOrderPath.value} element={<NormalizedRoute element={<V2CreateOrder />} checkAuthentication />} /> */}
				{/* <Route path={Constant.v2BalancesPath.value} element={<NormalizedRoute element={<V2Balances />} checkAuthentication />} /> */}
				<Route path={Constant.v2DevelopmentPath.value} element={<NormalizedRoute element={<V2Development />} />} />
			</Route>

			<Route path="*" element={<Navigate to={Constant.currentRoutePath.value} />} />
		</Routes>
	);
};

const RouterStructure = () => {
	return (
		<BrowserRouter>
			<RouteLogger>
				<RouterContent />
			</RouteLogger>
		</BrowserRouter>
	);
};

export const Router = connect(mapStateToProps)(RouterStructure);

import React from 'react';
import { Navigate, useLocation, BrowserRouter, Routes, Route } from 'react-router-dom';
import { Orders } from 'components/views/orders/Orders.tsx';
import { Development } from 'components/views/development/Development';
import { SignIn } from 'components/views/sign_in/SignIn';
import { connect } from 'react-redux';

const mapStateToProps = (state: any) => ({
	isSignedIn: state.api.isSignedIn,
});

interface RouterProps {
	isSignedIn: boolean;
}

// Function to normalize route to camelCase
const normalizeRoute = (route: string) => {
	return route
		.toLowerCase()
		.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
};

// Custom component to handle normalized routes
const NormalizedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
	const location = useLocation();
	const normalizedPath = normalizeRoute(location.pathname);

	if (normalizedPath !== location.pathname) {
		return <Navigate to={normalizedPath} />;
	}

	return <>{element}</>;
};

class RouterStructure extends React.Component<RouterProps> {
	render() {
		const { isSignedIn } = this.props;

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
					<Route path="/" element={<Navigate to="/orders" />} />
					<Route path="/home" element={<Navigate to="/" />} />
					<Route path="/orders" element={<NormalizedRoute element={isSignedIn ? <Orders /> : <Navigate to="/signIn" />} />} />

					{/*
						Development
					*/}
					<Route path="/development" element={<NormalizedRoute element={isSignedIn ? <Development /> : <Navigate to="/signIn" />} />} />

					{/*
						Redirect unknown routes
					*/}
					<Route
						path="*"
						element={<NormalizedRoute element={isSignedIn ? <Navigate to="/" /> : <Navigate to="/signIn" />} />}
					/>
				</Routes>
			</BrowserRouter>
		);
	}
}

export const Router = connect(mapStateToProps)(RouterStructure);

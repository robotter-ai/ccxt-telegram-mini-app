import React from 'react';
import { Navigate } from 'react-router';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Orders from 'components/views/orders/Orders.tsx';
import DevelopmentHome from 'components/views/development/Development';
import SignIn from 'components/views/sign_in/SignIn';

/**
 *
 */
export class Router extends React.Component {

	/**
	 *
	 */
	render() {
		return (
			<BrowserRouter>
				<div>
					<Routes>
						{/*
								Public
						*/}
						<Route path="/signIn" element={<SignIn/>} />
						<Route path="/sigin" element={<Navigate to="/signIn" />} />
						<Route path="/login" element={<Navigate to="/signIn" />} />

						{/*
								User
						*/}
						<Route path="/" element={<Orders/>} />
						<Route path="/home" element={<Navigate to="/" />} />

						{/*
								Development
						*/}
						<Route path="/development" element={<DevelopmentHome/>} />
					</Routes>
				</div>
			</BrowserRouter>
		);
	}
}

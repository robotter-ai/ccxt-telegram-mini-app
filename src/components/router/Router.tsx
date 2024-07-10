import React from 'react';
import { Navigate } from 'react-router';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Orders from 'components/views/orders/Orders.tsx';
import DevelopmentHome from 'components/views/development/Development';

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

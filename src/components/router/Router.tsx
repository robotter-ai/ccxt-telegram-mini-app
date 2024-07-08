import React from 'react';
import { Navigate } from 'react-router';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
								Development
						*/}
						<Route path="/development" element={<DevelopmentHome />} />
						<Route path="/" element={<Navigate to="/development" />} />
						<Route path="/development/home" element={<Navigate to="/development" />} />
					</Routes>
				</div>
			</BrowserRouter>
		);
	}
}

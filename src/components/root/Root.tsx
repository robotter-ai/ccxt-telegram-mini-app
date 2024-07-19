// import React from 'react';
import ReactDOM from 'react-dom/client';
import './Root.css';
import 'model/initializer';
import { Router } from 'components/router/Router';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// noinspection UnnecessaryLocalVariableJS
const reduxStore = (await import('model/state/redux/store')).reduxStore;

ReactDOM.createRoot(document.getElementById('root')!)
	.render(
		// <React.StrictMode>
			<Provider store={reduxStore}>
				<ToastContainer/>
				<Router/>
			</Provider>
		// </React.StrictMode>,
	);

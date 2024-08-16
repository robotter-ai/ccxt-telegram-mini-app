import '@telegram-apps/telegram-ui/dist/styles.css';
import './Root.css';
import 'react-toastify/dist/ReactToastify.css';
import 'model/initializer';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { AppContext } from 'model/contexts/AppContext';
import { Router } from 'components/router/Router';
import { AppRoot as TelegramUI } from '@telegram-apps/telegram-ui';
// import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized.ts';

const initialize = async () => {
	// noinspection UnnecessaryLocalVariableJS
	const reduxStore = (await import('model/state/redux/store')).reduxStore;

	ReactDOM.createRoot(document.getElementById('root')!)
		.render(
			// <React.StrictMode>
				<Provider store={reduxStore}>
					<AppContext.Provider value={{}}>
						<TelegramUI id='telegramUI'>
							<ToastContainer/>
							<Router/>
						</TelegramUI>
					</AppContext.Provider>
				</Provider>
			// </React.StrictMode>
		);
}

initialize()

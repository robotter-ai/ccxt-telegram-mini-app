import '@telegram-apps/telegram-ui/dist/styles.css';
import './Root.css';
import 'react-toastify/dist/ReactToastify.css';
import 'model/initializer';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRoot as TelegramUI } from '@telegram-apps/telegram-ui';
import { AppContext } from 'model/contexts/AppContext';
import { Router } from 'components/router/Router';
import { MaterialUITheme } from 'model/theme/MaterialUI';

const initialize = async () => {
	// noinspection UnnecessaryLocalVariableJS
	const reduxStore = (await import('model/state/redux/store')).reduxStore;

	ReactDOM.createRoot(document.getElementById('root')!)
		.render(
			// <React.StrictMode>
				<Provider store={reduxStore}>
					<AppContext.Provider value={{}}>
						<ThemeProvider theme={MaterialUITheme}>
							<CssBaseline />
							<TelegramUI id='telegramUI' appearance='dark'>
									<ToastContainer/>
									<Router/>
							</TelegramUI>
						</ThemeProvider>
					</AppContext.Provider>
				</Provider>
			// </React.StrictMode>
		);
}

initialize()

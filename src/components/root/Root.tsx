import React from 'react'
import ReactDOM from 'react-dom/client'
import './Root.css'
import App from 'components/app/App.tsx'
// import { Provider } from 'react-redux'
// import { Router } from 'react-router'
// import { reduxStore } from 'model/state/redux/store'

ReactDOM.createRoot(document.getElementById('root')!)
	.render(
		<React.StrictMode>
			{/* <Provider store={reduxStore}>
				<Router/>
			</Provider> */}
			<App/>
		</React.StrictMode>,
	);

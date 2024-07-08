import React from 'react'
import ReactDOM from 'react-dom/client'
import './Root.css'
import App from 'components/app/App.tsx'

ReactDOM.createRoot(document.getElementById('root')!)
	.render(
		<React.StrictMode>
			<Provider store={reduxStore}>
				<Router/>
			</Provider>
		</React.StrictMode>,
	);

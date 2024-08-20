import './Main.css';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Main = (props: any) => {
	return <main>
		<Suspense
			fallback={<Spinner/>}
		>
			<Outlet/>
		</Suspense>
	</main>;
}

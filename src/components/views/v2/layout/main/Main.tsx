import { styled } from '@mui/material/styles';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled('main')(({ theme }) => ({
	flexGrow: 1,
	'@apply w-full h-16': {},
	overflowY: 'auto',
	backgroundColor: 'var(--palete-background-default)',
	display: 'flex',
	flexDirection: 'column',
}));

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Main = (props: any) => {
	return (
		<Style>
			<Suspense fallback={<Spinner />}>
				<Outlet />
			</Suspense>
		</Style>
	);
};

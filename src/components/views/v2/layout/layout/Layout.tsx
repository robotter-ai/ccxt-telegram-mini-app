import { styled } from '@mui/material';
import { Menu } from 'components/views/v2/layout/menu/Menu';
import { SimpleHeader as Header } from 'components/views/v2/layout/header/SimpleHeader';
import { Main } from 'components/views/v2/layout/main/Main';
import { Footer } from 'components/views/v2/layout/footer/Footer';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled('div')(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	height: '100vh',
}));

export const Layout = (props: any = {}) => {
	return (
		<Style
			id="layout"
		>
			<Menu {...props}/>
			<Header {...props}/>
			<Main {...props}/>
			<Footer {...props}/>
		</Style>
	);
};

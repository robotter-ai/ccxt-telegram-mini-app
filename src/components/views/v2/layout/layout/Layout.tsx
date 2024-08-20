import './Layout.css';
import { Menu } from 'components/views/v2/layout/menu/Menu';
import { Header } from 'components/views/v2/layout/header/Header';
import { Main } from 'components/views/v2/layout/main/Main';
import { Footer } from 'components/views/v2/layout/footer/Footer';

export const Layout = (props: any = {}) => {
	return (
		<div
			id="layout"
		>
			<Menu {...props}/>
			<Header {...props}/>
			<Main {...props}/>
			<Footer {...props}/>
		</div>
	);
};

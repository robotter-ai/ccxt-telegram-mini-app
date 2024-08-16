// @ts-nocheck
import './Layout.css';
import logo from 'src/assets/images/logo/exchange.png';
import React, { Suspense, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Drawer, IconButton, List, ListItemButton, ListItemText } from '@mui/material';
import { Menu as MUIMenu } from '@mui/icons-material';
import { Spinner } from 'components/views/v2/spinner/Spinner';
import { SignOut } from 'components/views/v2/sign_out/SignOut';
import { Constant } from 'model/enum/constant.ts';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized.ts';

const getTitle = () => {
	switch (location.pathname) {
	case Constant.signInPath.value:
		return 'Sign In';
	case Constant.marketsPath.value:
		return 'Markets';
	case Constant.marketPath.value:
		return 'Market';
	case Constant.ordersPath.value:
		return 'Orders';
	case Constant.createOrderPath.value:
		return 'Create Order';
	case Constant.balancesPath.value:
		return 'Balance';
	default:
		return 'Home';
	}
};

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Menu = (props: any) => {
	const [ drawerOpen, setDrawerOpen ] = useState(true);

	const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
			return;
		}

		setDrawerOpen(open);
	};

	return <Drawer
		id='drawer'
		anchor="left"
		open={drawerOpen}
		onClose={toggleDrawer(false)}
	>
		<div
			id='menu'
			role="presentation"
			onClick={toggleDrawer(false)}
			onKeyDown={toggleDrawer(false)}
		>
			<List>
				<ListItemButton component={Link} to="/markets">
					<ListItemText primary="Markets" />
				</ListItemButton>
				<ListItemButton component={Link} to="/orders">
					<ListItemText primary="Orders" />
				</ListItemButton>
				<ListItemButton component={Link} to="/createOrder">
					<ListItemText primary="Create Order" />
				</ListItemButton>
				<SignOut />
			</List>
		</div>
	</Drawer>
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Header = (props: any) => {
	const [ _, setDrawerOpen ] = useState(false);

	const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
			return;
		}

		setDrawerOpen(open);
	};

	const handleLogoClick = (event: React.MouseEvent) => {
		event.stopPropagation();

		props.navigate(Constant.rootPath.value);
	};

	return <header
		className="flex items-center justify-between p-4">
		<div className="flex items-center" onClick={handleLogoClick}>
			<img src={logo} alt="Logo" className="h-10 w-10 mr-2"/>
		</div>
		<h1 className="text-xl font-bold">{getTitle()}</h1>
		<IconButton onClick={toggleDrawer(true)} className="text-white">
			<MUIMenu/>
		</IconButton>
	</header>;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Main = (props: any) => {
	return <main></main>

	// return <main className="flex-grow p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
	// 	<Suspense fallback={<Spinner/>}>
	// 		<Outlet/>
	// 	</Suspense>
	// </main>;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Footer = (props: any) => {
	return <footer
		className="flex justify-around p-4"
	>
		<Link to="/markets">
			Markets
		</Link>
		<Link to="/orders">
			Orders
		</Link>
		<Link to="/createOrder">
			Create Order
		</Link>
		<Link to="/balance">
			Balance
		</Link>
	</footer>;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Layout = (props: any = {}) => {
	// props.location = useLocation();
	// props.navigate = useNavigate();
	// props.params = useParams();
	// props.params.queryParams = new URLSearchParams(location.search);
	// const [searchParams] = useSearchParams();
	// props.searchParams = searchParams;
	// props.params.handleUnAuthorized = useHandleUnauthorized();

	return (
		<div
			id="layout"
			// className="flex flex-col min-h-screen"
		>
			<Menu {...props}/>
			<Header {...props}/>
			<Main {...props}/>
			<Footer {...props}/>
		</div>
	);
};

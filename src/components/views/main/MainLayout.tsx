import React, { Suspense, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from '@mui/icons-material';
import { Drawer, IconButton, List, ListItem, ListItemText } from '@mui/material';
import logo from 'src/assets/images/logo/exchange.png';
import Spinner from 'components/views/spinner/Spinner';
import SignOut from 'components/views/sign_out/SignOut';  // Import the SignOut component

const MainLayout = () => {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const handleLogoClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		navigate('/');
	};

	const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
			return;
		}
		setDrawerOpen(open);
	};

	const getTitle = () => {
		switch (location.pathname) {
			case '/signIn':
				return 'Sign In';
			case '/markets':
				return 'Markets';
			case '/market':
			case '/market/:marketId':
				return 'Market';
			case '/orders':
				return 'Orders';
			case '/createOrder':
				return 'Create Order';
			default:
				return 'Home';
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<div className="flex items-center justify-between p-4 bg-gray-800">
				<div className="flex items-center" onClick={handleLogoClick}>
					<img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
				</div>
				<h1 className="text-xl font-bold flex-grow text-center">{getTitle()}</h1>
				<IconButton onClick={toggleDrawer(true)} className="text-white">
					<Menu />
				</IconButton>
			</div>
			<Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
				<div
					className="w-64 bg-gray-900 text-white h-full"
					role="presentation"
					onClick={toggleDrawer(false)}
					onKeyDown={toggleDrawer(false)}
				>
					<List>
						<ListItem button component={Link} to="/markets" className="hover:bg-gray-700">
							<ListItemText primary="Markets" />
						</ListItem>
						<ListItem button component={Link} to="/orders" className="hover:bg-gray-700">
							<ListItemText primary="Orders" />
						</ListItem>
						<ListItem button component={Link} to="/createOrder" className="hover:bg-gray-700">
							<ListItemText primary="Create Order" />
						</ListItem>
						<SignOut />
					</List>
				</div>
			</Drawer>
			<main className="p-4">
				<Suspense fallback={<Spinner />}>
					<Outlet />
				</Suspense>
			</main>
		</div>
	);
};

export default MainLayout;

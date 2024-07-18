import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu } from '@mui/icons-material';
import { IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';

const MainLayout = () => {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const location = useLocation();

	const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
			return;
		}
		setDrawerOpen(open);
	};

	const getTitle = () => {
		switch (location.pathname) {
			case '/orders':
				return 'Orders';
			case '/markets':
				return 'Markets';
			case '/market':
			case '/market/:marketId':
				return 'Market';
			case '/development':
				return 'Development';
			case '/signIn':
				return 'Sign In';
			default:
				return 'Home';
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<div className="flex items-center justify-between p-4 bg-gray-800">
				<IconButton onClick={toggleDrawer(true)}>
					<Menu className="text-white" />
				</IconButton>
				<h1 className="text-xl font-bold">{getTitle()}</h1>
			</div>
			<Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
				<div
					className="w-64"
					role="presentation"
					onClick={toggleDrawer(false)}
					onKeyDown={toggleDrawer(false)}
				>
					<List>
						<ListItem button component={Link} to="/orders">
							<ListItemText primary="Orders" />
						</ListItem>
						<ListItem button component={Link} to="/markets">
							<ListItemText primary="Markets" />
						</ListItem>
						<ListItem button component={Link} to="/development">
							<ListItemText primary="Development" />
						</ListItem>
					</List>
				</div>
			</Drawer>
			<main className="p-4">
				<Outlet />
			</main>
		</div>
	);
};

export default MainLayout;

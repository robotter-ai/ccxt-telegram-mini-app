import './Menu.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { SignOut } from 'components/views/v2/sign_out/SignOut';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Menu = (props: any) => {
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
				<ListItemButton component={Link} to="/balances">
					<ListItemText primary="Balances" />
				</ListItemButton>
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

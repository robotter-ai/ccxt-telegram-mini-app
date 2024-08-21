import './Menu.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { SignOut } from 'components/views/v2/sign_out/SignOut';
import { connect } from 'react-redux';
import { dispatch } from 'model/state/redux/store';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	isMenuOpen: state.app.menu.isOpen,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const MenuStructure = (props: any) => {
	const toggleMenu = () => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
			return;
		}

		dispatch('app.toggleMenu', !props.isMenuOpen);
	};

	return <Drawer
		id='drawer'
		anchor="left"
		open={props.isMenuOpen}
		onClose={toggleMenu()}
	>
		<div
			id='menu'
			role="presentation"
			onClick={toggleMenu()}
			onKeyDown={toggleMenu()}
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
};

export const Menu = connect(mapStateToProps)(MenuStructure);

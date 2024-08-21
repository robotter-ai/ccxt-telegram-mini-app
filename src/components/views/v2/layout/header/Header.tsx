import './Header.css';
import logo from 'src/assets/images/logo/exchange.png';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu } from '@mui/icons-material';
import { Constant } from 'model/enum/constant.ts';
import { connect } from 'react-redux';
import { dispatch } from 'model/state/redux/store';

const getTitle = () => {
	switch (location.pathname) {
	case Constant.signInPath.value:
		return Constant.signInPath.title;
	case Constant.marketsPath.value:
		return Constant.marketsPath.title;
	case Constant.marketPath.value:
		return Constant.marketPath.title;
	case Constant.ordersPath.value:
		return Constant.ordersPath.title;
	case Constant.createOrderPath.value:
		return Constant.createOrderPath.title;
	case Constant.balancesPath.value:
		return Constant.balancesPath.title;
	default:
		return Constant.homePath.title;
	}
};

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	isMenuOpen: state.app.menu.isOpen,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const HeaderStructure = (props: any) => {
	const navigate = useNavigate();

	const toggleMenu = () => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
			return;
		}

		dispatch('app.toggleMenu', !props.isMenuOpen);
	};

	const handleLogoClick = (event: React.MouseEvent) => {
		event.stopPropagation();

		navigate(Constant.rootPath.value);
	};

	return (
		<AppBar position="static">
			<Toolbar
				className="flex items-center justify-between p-4"
				sx={{ justifyContent: 'space-between' }}
			>
				<div className="flex items-center" onClick={handleLogoClick}>
					<img src={logo} alt="Logo" className="h-10 w-10 mr-2"/>
				</div>
				<Typography
					variant="h6"
					component="div"
					sx={{
						flexGrow: 1,
						textAlign: 'center',
						position: 'absolute',
						left: '50%',
						transform: 'translateX(-50%)'
					}}
				>
					{getTitle()}
				</Typography>
				<IconButton
					size="large"
					edge="end"
					color="inherit"
					aria-label="menu"
					sx={{ ml: 'auto' }}
					onClick={toggleMenu()}
				>
					<Menu />
				</IconButton>
			</Toolbar>
		</AppBar>
	);
}

export const Header = connect(mapStateToProps)(HeaderStructure);

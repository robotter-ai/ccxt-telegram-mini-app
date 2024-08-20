import './Header.css';
import logo from 'src/assets/images/logo/exchange.png';
import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { Menu as MUIMenu } from '@mui/icons-material';
import { Constant } from 'model/enum/constant.ts';

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
export const Header = (props: any) => {
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

import './Footer.css';
import { Link } from '@mui/material';
import { Constant } from 'model/enum/constant';

import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import React from 'react';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Footer = (props: any) => {
	const [value, setValue] = React.useState(0);

	return <footer
		className="flex justify-around p-4"
	>
		<BottomNavigation
		showLabels
		value={value}
		onChange={(_event, newValue) => {
			setValue(newValue);
		}}
	>
		<BottomNavigationAction label={Constant.balancesPath.title} icon={<RestoreIcon />} />
		<BottomNavigationAction label={Constant.marketsPath.title} icon={<FavoriteIcon />} />
		<BottomNavigationAction label={Constant.ordersPath.title} icon={<LocationOnIcon />} />
		<BottomNavigationAction label={Constant.createOrderPath.title} icon={<LocationOnIcon />} />
		<BottomNavigationAction label={Constant.rewardsPath.title} icon={<LocationOnIcon />} />
	</BottomNavigation>
	</footer>;

	// return <footer
	// 	className="flex justify-around p-4"
	// >
	// 	<Link href={Constant.balancesPath.value}>
	// 		{Constant.balancesPath.title}
	// 	</Link>
	// 	<Link href={Constant.marketsPath.value}>
	// 		{Constant.marketsPath.title}
	// 	</Link>
	// 	<Link href={Constant.ordersPath.value}>
	// 		{Constant.ordersPath.title}
	// 	</Link>
	// 	<Link href={Constant.createOrderPath.value}>
	// 		{Constant.createOrderPath.title}
	// 	</Link>
	// </footer>;
}

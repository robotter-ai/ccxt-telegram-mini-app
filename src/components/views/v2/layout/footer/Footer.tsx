import './Footer.css';
import React from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { EmojiEvents, Toc, TrendingUp, Wallet } from '@mui/icons-material';
import { Constant } from 'model/enum/constant';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Footer = (props: any) => {
	const [value, setValue] = React.useState(0);

	return (
		<footer>
			<BottomNavigation
				showLabels
				value={value}
				onChange={(_event, newValue) => {
					setValue(newValue);
				}}
			>
				<BottomNavigationAction
					label={Constant.balancesPath.title}
					icon={<Wallet />}
					component={Link}
					to={Constant.balancesPath.value}
				/>
				<BottomNavigationAction
					label={Constant.marketsPath.title}
					icon={<TrendingUp />}
					component={Link}
					to={Constant.marketsPath.value}
				/>
				<BottomNavigationAction
					label={Constant.ordersPath.title}
					icon={<Toc />}
					component={Link}
					to={Constant.ordersPath.value}
				/>
				{/* <BottomNavigationAction */}
				{/* 	label={Constant.createOrderPath.title} */}
				{/* 	icon={<PlaylistAdd />} */}
				{/* 	component={Link} */}
				{/* 	to={Constant.createOrderPath.value} */}
				{/* /> */}
				<BottomNavigationAction
					label={Constant.rewardsPath.title}
					icon={<EmojiEvents />}
					component={Link}
					to={Constant.rewardsPath.value}
				/>
			</BottomNavigation>
		</footer>
	);
};

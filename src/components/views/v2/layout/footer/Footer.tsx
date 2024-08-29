import React from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { EmojiEvents, Toc, TrendingUp, Wallet } from '@mui/icons-material';
import { styled } from '@mui/material';
import { Constant } from 'model/enum/constant';
import { getCurrentRouteOrder } from 'components/views/v2/utils/utils';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled('footer')(({ theme }) => ({
	'@apply w-full h-16': {},
}));

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Footer = (props: any) => {
	const [value, setValue] = React.useState(getCurrentRouteOrder());

	return (
		<Style>
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
		</Style>
	);
};

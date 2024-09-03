import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { styled } from '@mui/material';
import { Constant } from 'model/enum/constant';
import { getCurrentRouteOrder } from 'components/views/v2/utils/utils';
import Home from 'assets/images/home.svg';
import Graph from 'assets/images/graph.svg';
import Orders from 'assets/images/orders.svg';
// import Rewards from 'assets/images/rewards.svg';
import SignOutIcon from 'assets/images/signout.svg';
import { apiPostAuthSignOut } from 'model/service/api';
import { dispatch } from 'model/state/redux/store';
import { toast } from 'react-toastify';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled('footer')(({ theme }) => ({
	'@apply w-full h-16': {},
	position: 'relative',
	borderTop: '1px solid #444',
	backgroundColor: theme.palette.background.paper,
}));

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const Footer = (props: any) => {
	const [value, setValue] = React.useState(getCurrentRouteOrder());
	const navigate = useNavigate();

	const handleSignOut = async () => {
		try {
			await apiPostAuthSignOut();
			dispatch('api.signOut', null);
			toast.success('Signed out successfully!');
			navigate(Constant.homePath.value as string);
		} catch (exception) {
			console.error(exception);
			toast.error('An error occurred during sign out.');
		}
	};

	return (
		<Style>
			<BottomNavigation
				showLabels
				value={value}
				onChange={(_event, _newValue) => {
					setValue(getCurrentRouteOrder());
				}}
			>
				<BottomNavigationAction
					icon={<img src={Home} alt="Home" />}
					component={Link}
					to={Constant.balancesPath.value}
				/>
				<BottomNavigationAction
					icon={<img src={Graph} alt="Markets" />}
					component={Link}
					to={Constant.marketsPath.value}
				/>
				<BottomNavigationAction
					icon={<img src={Orders} alt="Orders" />}
					component={Link}
					to={Constant.ordersPath.value}
				/>
				{/* <BottomNavigationAction */}
				{/* 	label={Constant.createOrderPath.title} */}
				{/* 	icon={<img src={CreateOrderIcon} alt="Create Order" />} */}
				{/* 	component={Link} */}
				{/* 	to={Constant.createOrderPath.value} */}
				{/* /> */}
				{/*<BottomNavigationAction
					label={Constant.rewardsPath.title}
					icon={<img src={Rewards} alt="Rewards" />}
					component={Link}
					to={Constant.rewardsPath.value}
				/>*/}
				<BottomNavigationAction
					icon={<img src={SignOutIcon} alt="Sign Out" />}
					onClick={handleSignOut}
				/>
			</BottomNavigation>
		</Style>
	);
};

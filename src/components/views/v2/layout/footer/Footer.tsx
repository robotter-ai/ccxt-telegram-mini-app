import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { styled } from '@mui/material';
import { Constant } from 'model/enum/constant';
import { getCurrentRouteOrder } from 'components/views/v2/utils/utils';
import HomeGrey from 'assets/images/homeGrey.svg';
import HomeWhite from 'assets/images/homeWhite.svg';
import GraphGrey from 'assets/images/graphGrey.svg';
import GraphWhite from 'assets/images/graphWhite.svg';
import OrdersGrey from 'assets/images/ordersGrey.svg';
import OrdersWhite from 'assets/images/ordersWhite.svg';
// import RewardsGrey from 'assets/images/rewardsGrey.svg';
// import RewardsWhite from 'assets/images/rewardsWhite.svg';
import SignOutGrey from 'assets/images/signoutGrey.svg';
import SignOutWhite from 'assets/images/signoutWhite.svg';
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
			// toast.success('Signed out successfully!');
			navigate(Constant.homePath.value as string);
		} catch (exception) {
			console.error(exception);
			toast.error('An error occurred during sign out.');
		}
	};

	const getIcon = (iconType: string, selected: boolean) => {
		switch (iconType) {
			case 'home':
				return selected ? HomeWhite : HomeGrey;
			case 'graph':
				return selected ? GraphWhite : GraphGrey;
			case 'orders':
				return selected ? OrdersWhite : OrdersGrey;
			// case 'rewards':
			// 	return selected ? RewardsWhite : RewardsGrey;
			case 'signout':
				return selected ? SignOutWhite : SignOutGrey;
			default:
				return HomeWhite;
		}
	};

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
					icon={<img src={getIcon('home', value === 0)} alt="Home" />}
					component={Link}
					to={Constant.balancesPath.value}
					onClick={() => setValue(0)}
				/>
				<BottomNavigationAction
					icon={<img src={getIcon('graph', value === 1)} alt="Markets" />}
					component={Link}
					to={Constant.marketsPath.value}
					onClick={() => setValue(1)}
				/>
				<BottomNavigationAction
					icon={<img src={getIcon('orders', value === 2)} alt="Orders" />}
					component={Link}
					to={Constant.ordersPath.value}
					onClick={() => setValue(2)}
				/>
				{/* <BottomNavigationAction */}
				{/* 	icon={<img src={getIcon('rewards', value === 3)} alt="Rewards" />} */}
				{/* 	component={Link} */}
				{/* 	to={Constant.rewardsPath.value} */}
				{/* 	onClick={() => setValue(3)} */}
				{/* /> */}
				<BottomNavigationAction
					icon={<img src={getIcon('signout', value === 3)} alt="Sign Out" />}
					onClick={handleSignOut}
				/>
			</BottomNavigation>
		</Style>
	);
};

// import logo from 'src/assets/images/logo/exchange.png';
import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { AppBar,  styled } from '@mui/material';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import ClearIcon from '@mui/icons-material/Clear';
// import { Constant } from 'model/enum/constant.ts';
import { connect } from 'react-redux';
import { dispatch } from 'model/state/redux/store';
// import { getCurrentRouteTitle } from 'components/views/v2/utils/utils';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(AppBar)(({ theme }) => ({
	'@apply w-full h-16': {},
}));

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	isMenuOpen: state.app.menu.isOpen,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
export const HeaderStructure = (props: any) => {
	// const navigate = useNavigate();

	// @ts-ignore
	const toggleMenu = () => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
			return;
		}
		dispatch('app.toggleMenu', !props.isMenuOpen);
	};

	// const handleLogoClick = (event: React.MouseEvent) => {
	// 	event.stopPropagation();
	//
	// 	navigate(Constant.rootPath.value);
	// };

	return (
		<Style position="static">
		{/*	<Toolbar*/}
		{/*		className="flex items-center justify-between p-4"*/}
		{/*		sx={{justifyContent: 'space-between'}}*/}
		{/*	>*/}
		{/*		/!*<div style={{position: 'relative', flexGrow: 1}}>*!/*/}
		{/*		/!*	<Typography*!/*/}
		{/*		/!*		component="div"*!/*/}
		{/*		/!*		sx={{*!/*/}
		{/*		/!*			fontSize: '0.8rem',*!/*/}
		{/*		/!*			textAlign: 'left',*!/*/}
		{/*		/!*			position: 'relative',*!/*/}
		{/*		/!*			left: '55%',*!/*/}
		{/*		/!*			transform: 'translateX(-50%)'*!/*/}
		{/*		/!*		}}*!/*/}
		{/*		/!*	>*!/*/}
		{/*		/!*		<ClearIcon*!/*/}
		{/*		/!*			sx={{*!/*/}
		{/*		/!*				fontSize: '1.1rem',*!/*/}
		{/*		/!*				position: 'absolute',*!/*/}
		{/*		/!*				left: '-4%',*!/*/}
		{/*		/!*				transform: 'translateX(-50%)'*!/*/}
		{/*		/!*			}}*!/*/}
		{/*		/!*		/>*!/*/}
		{/*		/!*		{getCurrentRouteTitle()}*!/*/}
		{/*		/!*	</Typography>*!/*/}
		{/*		/!*</div>*!/*/}
		{/*		<IconButton*/}
		{/*			size="large"*/}
		{/*			edge="end"*/}
		{/*			color="inherit"*/}
		{/*			aria-label="menu"*/}
		{/*			sx={{ml: 'auto'}}*/}
		{/*			onClick={toggleMenu()}*/}
		{/*		>*/}
		{/*			<MoreVertIcon/>*/}
		{/*		</IconButton>*/}
		{/*		<div*/}
		{/*			style={{*/}
		{/*				borderBottom: '1px  solid #202020',*/}
		{/*				width: '100%',*/}
		{/*				left: 0,*/}
		{/*				position: 'absolute',*/}
		{/*				bottom: 20,*/}
		{/*			}}*/}
		{/*		/>*/}
		{/*</Toolbar>*/}
</Style>
)
	;
}

export const Header = connect(mapStateToProps)(HeaderStructure);

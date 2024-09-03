import React from 'react';
import { Button as MuiButton, styled, Box } from '@mui/material';

export enum ButtonType {
	Full = 'full',
	Bordered = 'bordered',
}

interface ButtonProps {
	value: string;
	type: ButtonType;
	icon?: React.ReactNode;
	disabled?: boolean;
	fullWidth?: boolean;
	onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

const StyledBox = styled(Box)(({}) => ({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	width: '100%',
}));

const StyledButton = styled(MuiButton)<{fullwidth: boolean}>(({ theme, fullwidth }) => ({
	width: fullwidth ? '100%' : 'auto',
	padding: '8px 24px',
	borderRadius: '20px',
	textTransform: 'none',
	'& .full': {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.background.default,
		fontWeight: 'bold',
	},
	'& .bordered': {
		backgroundColor: theme.palette.background.default,
		color: theme.palette.text.primary,
		fontWeight: 'bold',
		border: `1px solid`,
	},
}));

const Button: React.FC<ButtonProps> = ({ value, type, icon, disabled, fullWidth, onClick }) => {
	return (
		<StyledBox>
			<StyledButton
				fullwidth={fullWidth ?? true}
				className={type}
				onClick={onClick}
				disabled={disabled}
				variant={type === ButtonType.Full ? 'contained' : 'outlined'}
			>
				{icon && <span style={{ marginRight: '6px' }}>{icon}</span>}
				{value}
			</StyledButton>
		</StyledBox>
	);
};

export default Button;

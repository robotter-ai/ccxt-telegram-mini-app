import { Box, Button as MuiButton, styled } from '@mui/material';
import React from 'react';

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

const StyledBox = styled(Box)({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	width: '100%',
});

const StyledButton = styled(MuiButton, {
	shouldForwardProp: (prop) => prop !== 'isfullwidth',
})<{ isfullwidth: boolean }>(({ theme, isfullwidth }) => ({
	width: isfullwidth ? '100%' : 'auto',
	fontSize: '16px',
	fontWeight: '300',
	padding: '12px',
	borderRadius: '40px',
	textTransform: 'none',
	'&.full': {
		backgroundColor: theme.palette.common.white,
		color: theme.palette.common.black,
	},
	'&.bordered': {
		backgroundColor: 'transparent',
		color: theme.palette.common.white,
		border: '1px solid',
	},
	'&.Mui-disabled': {
		backgroundColor: '#E0E0E0',
		color: '#A0A0A0',
		borderColor: '#A0A0A0',
	},
	'&.full.Mui-disabled': {
		backgroundColor: '#1F1F1F',
		color: '#ADADAD',
		borderColor: '#ADADAD',
	},
	'&.bordered.Mui-disabled': {
		backgroundColor: theme.palette.common.black,
		color: '#A0A0A0',
		borderColor: '#A0A0A0',
	}
}));

const Button: React.FC<ButtonProps> = ({ value, type, icon, disabled, fullWidth, onClick }) => {
	return (
		<StyledBox>
			<StyledButton
				isfullwidth={fullWidth ?? true}
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

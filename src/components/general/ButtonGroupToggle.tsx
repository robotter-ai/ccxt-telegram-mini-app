import { Button, ButtonGroup, styled } from '@mui/material';
import React, { useState } from 'react';

interface ButtonConfig {
	label: string;
	activeColor?: string;
	onClick: () => void;
}

interface ButtonGroupToggleProps {
	buttons: ButtonConfig[];
	defaultButton: number;
}

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
	backgroundColor: theme.palette.background.paper,
	borderRadius: '40px',
	width: '100%',
	overflow: 'hidden',
}));

const StyledButton = styled(Button)<{ activeColor?: string }>(({ theme, activeColor }) => ({
	flex: 1,
	border: 'none',
	padding: '10px 0',
	textTransform: 'uppercase',
	fontWeight: '300',
	'&.Mui-selected': {
		border: 'none',
		borderRadius: '40px',
		color: theme.palette.common.black,
		backgroundColor: activeColor ?? theme.palette.primary.main,
	},
	'&:not(.Mui-selected)': {
		border: 'none',
		borderRadius: '40px',
		color: theme.palette.text.secondary,
	},
}));

const ButtonGroupToggle: React.FC<ButtonGroupToggleProps> = ({ buttons, defaultButton }) => {
	const [activeTab, setActiveTab] = useState<number>(defaultButton);

	return (
		<StyledButtonGroup>
			{buttons.map((button, index) => (
				<StyledButton
					key={index}
					activeColor={button.activeColor}
					className={activeTab === index ? 'Mui-selected' : ''}
					onClick={() => {
						setActiveTab(index);
						button.onClick();
					}}
				>
					{button.label}
				</StyledButton>
			))}
		</StyledButtonGroup>
	);
};

export default ButtonGroupToggle;

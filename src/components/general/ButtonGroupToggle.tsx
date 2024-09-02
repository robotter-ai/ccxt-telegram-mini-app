import React, {useState} from 'react';
import {Button, ButtonGroup, styled} from '@mui/material';

interface ButtonConfig {
	label: string;
	activeColor?: string;
	onClick: () => void;
}

interface ButtonGroupToggleProps {
	buttons: ButtonConfig[];
	defaultButton: number;
}

const StyledButtonGroup = styled(ButtonGroup)(({theme}) => ({
	backgroundColor: theme.palette.secondary.main,
	padding: '0.125rem',
	borderRadius: '1.25rem',
	width: '100%',
}));

const StyledButton = styled(Button)<{ activeColor?: string }>(({theme, activeColor}) => ({
	flex: 1,
	padding: '0.5rem 1.5rem',
	borderRadius: '1.25rem',
	textTransform: 'none',
	'&.Mui-selected': {
		backgroundColor: activeColor ?? theme.palette.primary.main,
		color: theme.palette.secondary.main,
		fontWeight: 'bold',
	},
	'&:not(.Mui-selected)': {
		color: theme.palette.primary.main,
	},
}));

const ButtonGroupToggle: React.FC<ButtonGroupToggleProps> = ({buttons, defaultButton}) => {
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

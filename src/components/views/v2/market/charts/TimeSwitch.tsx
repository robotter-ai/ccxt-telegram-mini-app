import { useState } from 'react';
import { Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)<{ isSelected: boolean }>(({ isSelected }) => ({
	backgroundColor: isSelected ? '#ffffff' : '#181818',
	color: isSelected ? '#000000' : '#ffffff',
	borderRadius: '50%',
	minWidth: '48px',
	height: '48px',
	fontWeight: 'bold',
	textTransform: 'none', // This ensures the text case is not changed
	'&:hover': {
		backgroundColor: isSelected ? '#ffffff' : '#303030',
	},
}));

interface TimeSwitchProps {
	defaultGranularity: '1s' | '1m' | '1h' | '4h' | '1d';
	onGranularityChange: (time: string) => void; // Callback function prop
}

export const TimeSwitch = ({ defaultGranularity = '1h', onGranularityChange }: TimeSwitchProps) => {
	const [selectedGranularity, setSelectedGranularity] = useState<string>(defaultGranularity);

	const timeOptions = ['1s', '1m', '1h', '4h', '1d'];

	const handleGranularityChange = (time: string) => {
		setSelectedGranularity(time);
		onGranularityChange(time);
	};

	return (
		<Grid container spacing={2} justifyContent="center">
			{timeOptions.map((time) => (
				<Grid item key={time}>
					<StyledButton
						isSelected={selectedGranularity === time}
						onClick={() => handleGranularityChange(time)}
					>
						{time}
					</StyledButton>
				</Grid>
			))}
		</Grid>
	);
};

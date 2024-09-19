import React, { useState } from 'react';
import { Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

interface GranularityButtonProps {
	isSelected: boolean;
	children: React.ReactNode;
	onClick: () => void;
}

const GranularityButtonStructure = ({ isSelected, children, ...otherProps }: GranularityButtonProps) => {
	return <Button {...otherProps}>{children}</Button>;
};

// noinspection JSUnusedLocalSymbols
const GranularityButton = styled(GranularityButtonStructure)<{ isSelected: boolean }>(
	// @ts-ignore
	({ isSelected, theme }) => ({
		backgroundColor: isSelected ? '#ffffff' : '#181818',
		color: isSelected ? '#000000' : '#ffffff',
		borderRadius: '50%',
		minWidth: '3rem',
		height: '3rem',
		fontWeight: 'bold',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: isSelected ? '#ffffff' : '#303030',
		},
	})
);

interface TimeSwitchProps {
	defaultGranularity: '1s' | '1m' | '1h' | '4h' | '1d';
	onGranularityChange: (time: string) => void;
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
					<GranularityButton
						isSelected={selectedGranularity === time}
						onClick={() => handleGranularityChange(time)}
					>
						{time}
					</GranularityButton>
				</Grid>
			))}
		</Grid>
	);
};

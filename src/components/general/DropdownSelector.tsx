import React, {ReactNode} from 'react';
import {Select, MenuItem, styled, SelectChangeEvent, FormControl, InputLabel} from '@mui/material';

const StyledSelect = styled(Select)(({theme}) => ({
	'& .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.secondary.main,
	},
	'& .Mui-focused .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.primary.main,
	},
	'& .MuiSelect-select': {
		padding: '0.5rem 1.5rem',
	},
}));

const StyledMenuItem = styled(MenuItem)(({theme}) => ({
	color: theme.palette.primary.main,
	'&.Mui-selected': {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.secondary.main,
	},
}));

interface DropdownSelectorProps {
	label: string;
	options: { value: string; label: string }[];
	value: string;
	onChange: (event: SelectChangeEvent<any>, child: ReactNode) => void;
}

const DropdownSelector: React.FC<DropdownSelectorProps> = ({label, options, value, onChange}) => {
	return (
		<FormControl variant={'outlined'} fullWidth={true}>
			<InputLabel shrink={true}>{label}</InputLabel>
			<StyledSelect value={value} onChange={onChange} label={label}>
				{options.map((option) => (
					<StyledMenuItem key={option.value} value={option.value}>
						{option.label}
					</StyledMenuItem>
				))}
			</StyledSelect>
		</FormControl>
	);
};

export default DropdownSelector;

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, styled } from '@mui/material';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import React, { ReactNode } from 'react';

const StyledSelect = styled(Select)(({ theme }) => ({
	borderRadius: '14px',
	backgroundColor: theme.palette.background.default,
	borderColor: theme.palette.primary.main,
	padding: '14px 16px',
	'& .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.primary.main,
	},
	'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.primary.main,
	},
	'& .MuiSelect-select': {
		borderRadius: '14px',
		padding: '0',
	},
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
	fontSize: '15px',
	fontWeight: '300',
	lineHeight: '20px',
	backgroundColor: theme.palette.background.default,
	padding: '2px 6px',
	borderRadius: '14px',
	color: theme.palette.primary.main,
	'&.Mui-focused': {
		color: theme.palette.primary.main,
	},
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
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

const DropdownSelector: React.FC<DropdownSelectorProps> = ({ label, options, value, onChange }) => {
	return (
		<FormControl variant={'outlined'} fullWidth={true}>
			<StyledInputLabel shrink={true}>{label}</StyledInputLabel>
			<StyledSelect
				value={value}
				onChange={onChange}
				label={label}
				MenuProps={{
					PaperProps: {
						style: {
							maxHeight: '200px',
							marginTop: '6px',
							borderRadius: '6px',
						},
						sx: {
							'&::-webkit-scrollbar': {
								width: '4px',
							},
							'&::-webkit-scrollbar-thumb': {
								backgroundColor: MaterialUITheme.palette.text.secondary,
								borderRadius: '12px',
								height: '52px',
							},
							'&::-webkit-scrollbar-thumb:hover': {
								backgroundColor: MaterialUITheme.palette.text.secondary,
							},
						},
					},
					anchorOrigin: {
						vertical: 'bottom',
						horizontal: 'left',
					},
					transformOrigin: {
						vertical: 'top',
						horizontal: 'left',
					},
				}}
			>
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

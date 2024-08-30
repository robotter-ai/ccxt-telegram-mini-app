import React from 'react';
import {TextField, styled, FormControl, InputLabel} from '@mui/material';

const StyledTextField = styled(TextField)(({theme}) => ({
	backgroundColor: theme.palette.secondary.main,
	borderRadius: '1.25rem',
	'& .MuiOutlinedInput-root': {
		'& fieldset': {
			borderColor: theme.palette.secondary.main,
			borderRadius: '1.25rem',
		},
		'&:hover fieldset': {
			borderColor: theme.palette.primary.dark,
		},
		'&.Mui-focused fieldset': {
			borderColor: theme.palette.primary.main,
		},
	},
	'& .MuiInputBase-input': {
		padding: '0.5rem 1.5rem',
	},
}));

interface TextInputProps {
	label: string;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({label, value, onChange}) => {
	return (
		<FormControl variant="outlined" fullWidth={true}>
			<InputLabel shrink={true} style={{backgroundColor: 'black'}}>{label}</InputLabel>
			<StyledTextField
				variant="outlined"
				value={value}
				onChange={onChange}
			/>
		</FormControl>
	);
};

export default TextInput;

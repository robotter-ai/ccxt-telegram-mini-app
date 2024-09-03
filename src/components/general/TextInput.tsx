import { FormControl, InputAdornment, InputLabel, styled, TextField } from '@mui/material';
import React, { useRef } from 'react';

const StyledTextField = styled(TextField)(({ theme }) => ({
	borderRadius: '14px',
	'& .MuiOutlinedInput-root': {
		'& fieldset': {
			borderRadius: '14px',
			borderColor: theme.palette.primary.dark,
		},
		'&:hover fieldset': {
			borderColor: theme.palette.primary.dark,
		},
		'&.Mui-focused fieldset': {
			borderColor: theme.palette.primary.main,
		},
	},
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
	fontSize: '13px',
	fontWeight: '700',
	fontFamily: theme.fonts.primary,
	backgroundColor: theme.palette.background.default,
	padding: '0 6px',
	'&.Mui-focused': {
		color: theme.palette.primary.main,
	},
}));

interface TextInputProps {
	label: string;
	value: string;
	icon?: React.ReactNode;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, icon, onChange }) => {
	const inputLabelRef = useRef<HTMLLabelElement>(null);

	const handleFocus = () => {
		if (inputLabelRef.current) {
			inputLabelRef.current.classList.add('Mui-focused');
		}
	};

	const handleBlur = () => {
		if (inputLabelRef.current) {
			inputLabelRef.current.classList.remove('Mui-focused');
		}
	};

	return (
		<FormControl variant="outlined" fullWidth={true}>
			<StyledInputLabel ref={inputLabelRef} shrink={true}>{label}</StyledInputLabel>
			<StyledTextField
				variant="outlined"
				value={value}
				onChange={onChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				InputProps={{
					endAdornment: icon ? <InputAdornment position="end">{icon}</InputAdornment> : null,
				}}
			/>
		</FormControl>
	);
};

export default TextInput;

import React, { useRef } from 'react';
import { TextField, styled, FormControl, InputLabel } from '@mui/material';

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
	fontWeight: 'bold',
	backgroundColor: theme.palette.background.default,
	padding: '0 6px',
	'&.Mui-focused': {
		color: theme.palette.primary.main,
	},
}));

interface TextInputProps {
	label: string;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange }) => {
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
			/>
		</FormControl>
	);
};

export default TextInput;

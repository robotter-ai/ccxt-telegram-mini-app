import { FormControl, InputAdornment, InputLabel, styled, TextField } from '@mui/material';
import React, { useRef } from 'react';

const StyledTextField = styled(TextField)(({ theme }) => ({
	backgroundColor: theme.palette.background.default,
	'& .MuiOutlinedInput-root': {
		'& fieldset': {
			borderRadius: '14px',
			border: '1.8px solid',
			borderColor: theme.palette.primary.dark,
		},
		'&:hover fieldset': {
			borderColor: theme.palette.primary.dark,
		},
		'&.Mui-focused fieldset': {
			borderColor: theme.palette.primary.main,
		},
		'&.Mui-focused svg': {
			color: theme.palette.primary.main,
		},
	},
	'& .MuiOutlinedInput-input': {
		padding: '11px 16px',
		fontSize: '17px',
		height: '26px',
	},
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
	fontWeight: '300',
	fontFamily: theme.fonts.monospace,
	backgroundColor: theme.palette.background.default,
	padding: '1px 6px',
	fontSize: '14px',
	'&.Mui-focused': {
		color: theme.palette.primary.main,
	},
}));

interface TextInputProps {
	label: string;
	value: string;
	placeholder?: string;
	icon?: React.ReactNode;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FocusableIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => {
	const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
		const parent = event.currentTarget.closest('.MuiOutlinedInput-root');
		if (parent) {
			parent.classList.add('Mui-focused');
		}
	};

	const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
		const parent = event.currentTarget.closest('.MuiOutlinedInput-root');
		if (parent) {
			parent.classList.remove('Mui-focused');
		}
	};

	return (
		<div tabIndex={0} onFocus={handleFocus} onBlur={handleBlur}>
			{icon}
		</div>
	);
};

const TextInput: React.FC<TextInputProps> = ({placeholder, label, value, icon, onChange }) => {
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
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				InputProps={{
					endAdornment: icon ? (
						<InputAdornment position="end">
							<FocusableIcon icon={icon} />
						</InputAdornment>
					) : null,
				}}
			/>
		</FormControl>
	);
};

export default TextInput;

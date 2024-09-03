import React, { useRef } from 'react';
import Decimal from 'decimal.js';
import { TextField, styled, FormControl, InputLabel } from '@mui/material';

const StyledTextField = styled(TextField)(({theme}) => ({
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

const StyledInputLabel = styled(InputLabel)(({theme}) => ({
	fontSize: '13px',
	fontWeight: '700',
	fontFamily: theme.fonts.primary,
	backgroundColor: theme.palette.background.default,
	padding: '0 6px',
	'&.Mui-focused': {
		color: theme.palette.primary.main,
	},
}));

interface NumberInputProps {
	label: string;
	value: number;
	precision?: number;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({label, value, precision, onChange}) => {
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

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		const increment = new Decimal(1 / Math.pow(10, precision || 0));

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			onChange({
				...event,
				target: {...event.target, value: Decimal.sum(new Decimal(value), increment).toString()}
			} as unknown as React.ChangeEvent<HTMLInputElement>);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			onChange({
				...event,
				target: {...event.target, value: Decimal.sub(new Decimal(value), increment).toString()}
			} as unknown as React.ChangeEvent<HTMLInputElement>);
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
				onKeyDown={handleKeyDown}
				type="number"
			/>
		</FormControl>
	);
};

export default NumberInput;

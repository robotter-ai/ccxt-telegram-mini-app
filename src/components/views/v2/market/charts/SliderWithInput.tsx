import { Box, Slider, styled, TextField } from '@mui/material';
import { BaseProps, withHooks } from 'components/base/Base';
import { dispatch } from 'model/state/redux/store';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

const roundWithPrecision = (value: number, precision: number) => {
	const factor = Math.pow(10, precision);
	return Math.round(value * factor) / factor;
};

interface Props extends BaseProps {
	min: number;
	max: number;
	value: number;
	defaultValue: number;
	precision: number;
	step: number;
	updateValue: (value: number) => void;
	onValueChange: (value: number) => void;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: Props | any) => ({
	value: state.api.market.orderBook.granularity,
	precision: state.api.market.market.precision.amount,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapDispatchToProps = (reduxDispatch: any) => ({
	updateValue(value: number) {
		dispatch('api.updateMarketOrderBookGranularity', value as number);
	}
});

const Structure: React.FC<Props> = ({
	min,
	max,
	value: reduxValue,
	defaultValue,
	precision,
	step,
	updateValue,
	onValueChange = () => {}
}) => {
	step = roundWithPrecision(Math.pow(10, -precision), precision) || 0;
	min = min || step || 0;
	max = max || 1000;
	defaultValue = 1;

	const [localValue, setLocalValue] = useState<number>(defaultValue);

	useEffect(() => {
		if (reduxValue !== localValue && reduxValue > 0) {
			setLocalValue(reduxValue);
		}
	}, [reduxValue]);

	const handleSliderChange = (_: Event, newValue: number | number[]) => {
		const newLocalValue = newValue as number;
		setLocalValue(newLocalValue);
		updateValue(newLocalValue);
		onValueChange(newLocalValue);
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value === '' ? 0 : Number(event.target.value);
		if (newValue >= 0 && newValue >= min && newValue <= max) {
			setLocalValue(newValue);
			updateValue(newValue);
			onValueChange(newValue);
		}
	};

	const handleBlur = () => {
		let newValue = localValue;
		if (newValue < min) {
			newValue = min as number;
		} else if (newValue > max) {
			newValue = max as number;
		}

		setLocalValue(newValue);
		updateValue(newValue);
		onValueChange(newValue);
	};

	return (
		<Box className="flex px-4 w-full items-center gap-2 ">
			<Slider
				value={localValue}
				min={min}
				max={max}
				onChange={handleSliderChange}
				className="flex-grow slider"
			/>
			<TextField
				value={localValue}
				onChange={handleInputChange}
				onBlur={handleBlur}
				inputProps={{
					step: step,
					min: min,
					max: max,
					type: 'number',
					'aria-labelledby': 'input-slider',
				}}
				className="text-field w-2/6"
			/>
		</Box>
	);
};

const Style = styled(Structure)(({ theme }) => `
	.flex {
		display: flex;
	}
	.w-full {
		width: 100%;
	}
	.items-center {
		align-items: center;
	}
	.gap-4 {
		gap: ${theme.spacing(2)};
	}
	.flex-grow {
		flex-grow: 1;
	}
	.slider {
	}
	.text-field {
	}
`);

const Behavior = connect(mapStateToProps, mapDispatchToProps)(withHooks(Style));

export const SliderWithInput = Behavior;

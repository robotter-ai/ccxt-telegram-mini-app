import React from 'react';
import { Box, Slider, styled, TextField } from '@mui/material';
import { connect } from 'react-redux';
import { BaseProps, withHooks } from 'components/base/Base.tsx';
import { dispatch } from 'model/state/redux/store';

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

const Structure: React.FC<Props> = (props: Props) => {
	props.step = roundWithPrecision(Math.pow(10, -props.precision), props.precision);
	props.min = props.step || 0;
	props.defaultValue = 1;
	props.value = props.defaultValue;

	const handleSliderChange = (_: Event, newValue: number | number[]) => {
		props.updateValue(newValue as number);
		props.onValueChange(props.value);
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value === '' ? 0 : Number(event.target.value);
		if (newValue >= 0 && newValue >= props.min && newValue <= props.max) {
			props.updateValue(newValue as number);
			props.onValueChange(props.value);
		}
	};

	const handleBlur = () => {
		if (props.value < props.min) {
			props.updateValue(props.min as number);
		} else if (props.value > props.max) {
			props.updateValue(props.max as number);
		}

		props.onValueChange(props.value);
	};

	return (
		<Box className="flex w-full items-center gap-4">
			<Slider
				value={props.value}
				min={props.min}
				max={props.max}
				onChange={handleSliderChange}
				className="flex-grow slider"
			/>
			<TextField
				value={props.value}
				onChange={handleInputChange}
				onBlur={handleBlur}
				inputProps={{
					step: props.step,
					min: props.min,
					max: props.max,
					type: 'number',
					'aria-labelledby': 'input-slider',
				}}
				className="text-field"
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

import { Box, styled } from '@mui/material';

const Structure = (props: any) => {
	return (
		<Box className={props.className}>
		</Box>
	);
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Structure)(({ theme }) => `
	height: 2rem;
`);

// noinspection UnnecessaryLocalVariableJS
const Behavior = Style;

export const SimpleHeader = Behavior;

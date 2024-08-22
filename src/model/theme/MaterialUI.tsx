import { createTheme } from '@mui/material/styles';

export const MaterialUITheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#FFFFFF',
		},
		secondary: {
			main: '#191919',
		},
		background: {
			default: '#000000',
			paper: '#232322',
		},
		text: {
			secondary: '#949494',
			primary: '#ffffff',
			disabled: '#595959',
		},
		error: {
			main: '#f32d54',
		},
		success: {
			main: '#1fce79',
		},
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
					backgroundColor: '#000000',
				},
			},
		},
		MuiBottomNavigation: {
			styleOverrides: {
				root: {
					backgroundColor: '#000000',
				},
			},
		},
	},
});

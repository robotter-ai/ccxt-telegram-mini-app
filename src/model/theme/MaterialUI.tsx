import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
	// noinspection JSUnusedGlobalSymbols
	interface Theme {
		fonts: {
			primary: string;
			secondary: string;
			monospace: string;
		};
	}

	// noinspection JSUnusedGlobalSymbols
	interface ThemeOptions {
		fonts?: {
			primary?: string;
			secondary?: string;
			monospace?: string;
		};
	}
}

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
			paper: '#1F1F1F',
		},
		text: {
			secondary: '#ADADAD',
			primary: '#ffffff',
			disabled: '#595959',
		},
		error: {
			main: '#F42443',
		},
		success: {
			main: '#00DD1D',
		},
	},
	typography: {
		fontFamily: '"GT America Light", sans-serif',
	},
	fonts: {
		primary: '"GT America Light", sans-serif',
		secondary: '"PP Editorial New Light", serif',
		monospace: '"GT America Mono Light", monospace',
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
		MuiSelect: {
			styleOverrides: {
				root: {
					backgroundColor: '#191919',
					borderRadius: '1.25rem',
					padding: '0.5rem 1.5rem',
					color: '#FFFFFF',
				},
			}
		},
	},
});

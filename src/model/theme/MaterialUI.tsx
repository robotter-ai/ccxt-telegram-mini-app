import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
	interface Theme {
		fonts: {
			primary: string;
			secondary: string;
		};
	}

	interface ThemeOptions {
		fonts?: {
			primary?: string;
			secondary?: string;
			tertiary?: string;
			quaternary?: string;
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
	typography: {
		fontFamily: '"GT America Light", sans-serif',
	},
	fonts: {
		primary: '"Work Sans", sans-serif',
		secondary: '"Cormorant", sans-serif',
		tertiary: '"Libre Franklin", sans-serif',
		quaternary: '"Cinzel", serif',
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

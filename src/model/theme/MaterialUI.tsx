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
		h1: {
			fontFamily: '"PP Editorial New Light", sans-serif'
		},
		h2: {
			fontFamily: '"PP Editorial New Light", sans-serif'
		},
		h3: {
			fontFamily: '"PP Editorial New Light", sans-serif'
		},
		h4: {
			fontFamily: '"PP Editorial New Light", sans-serif'
		},
		h5: {
			fontFamily: '"PP Editorial New Light", sans-serif'
		},
		h6: {
			fontFamily: '"PP Editorial New Light", sans-serif'
		},
		subtitle1: {
			fontFamily: '"PP Editorial New Light", sans-serif'
		},
		subtitle2: {
			fontFamily: '"PP Editorial New Light", sans-serif'
		},
		// body1: {
		// 	fontFamily: '"PP Editorial New Light", sans-serif'
		// },
		// body2: {
		// 	fontFamily: '"PP Editorial New Light", sans-serif'
		// },
		// button: {
		// 	fontFamily: '"PP Editorial New Light", sans-serif'
		// },
		// caption: {
		// 	fontFamily: '"PP Editorial New Light", sans-serif'
		// },
		// overline: {
		// 	fontFamily: '"PP Editorial New Light", sans-serif'
		// },
	},
	fonts: {
		primary: '"Work Sans", sans-serif',
		secondary: '"Cormorant", sans-serif',
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

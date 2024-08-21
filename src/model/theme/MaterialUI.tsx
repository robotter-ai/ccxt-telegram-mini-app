import { createTheme } from '@mui/material/styles';

export const MaterialUITheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#181818',
		},
		secondary: {
			main: '#F18503',
		},
		background: {
			default: '#212121',
			paper: '#393939',
		},
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: '#181818',
					backgroundImage: 'none',
				},
			},
		},
		MuiBottomNavigation: {
			styleOverrides: {
				root: {
					backgroundColor: '#181818',
				},
			},
		},
		MuiBottomNavigationAction: {
			styleOverrides: {
				root: {
					'&.Mui-selected': {
						color: '#FF9800',
					},
				},
			},
		},
	},
});

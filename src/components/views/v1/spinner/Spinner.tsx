import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		primary: {
			main: '#FE8A00',
		},
	},
});

export function Spinner() {
	return (
		<ThemeProvider theme={theme}>
			<Stack sx={{ color: 'grey.500' }} spacing={2} direction="row" justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
				<CircularProgress color="primary" />
			</Stack>
		</ThemeProvider>
	);
}

import { connect } from 'react-redux';
import { Box, Button, Container, CssBaseline, Typography, Link } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import logo from 'src/assets/images/logo/cube.png';
import googleLogo from 'src/assets/images/google.svg';

const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: { main: '#FFA500' },
		background: { default: '#121212', paper: 'transparent' },
	},
});

interface GoogleSignInProps extends BaseProps {}

interface GoogleSignInState extends BaseState {}

class GoogleSignInStructure extends Base<GoogleSignInProps, GoogleSignInState> {
	constructor(props: GoogleSignInProps) {
		super(props);
		this.state = {
			isLoading: false,
			error: undefined,
		};
	}

	handleGoogleSignIn = () => {
		console.log("Google sign-in initiated");
		this.props.navigate('/');
	};

	render() {
		const { isLoading, error } = this.state;

		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Container
					maxWidth="sm"
					sx={{
						height: '100vh',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						bgcolor: 'background.default',
						position: 'relative',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							mb: 4,
						}}
					>
						<img
							src={logo}
							alt="Logo"
							style={{
								height: '50px',
								marginBottom: '20px',
								borderRadius: '10%',
							}}
						/>
						<Button
							variant="contained"
							color="primary"
							sx={{
								mt: 4,
								borderRadius: '50px',
								fontWeight: 'bold',
							}}
							onClick={this.handleGoogleSignIn}
							disabled={isLoading}
						>
							<img
								src={googleLogo}
								alt="Google Logo"
								style={{
									height: '20px',
									marginRight: '10px',
								}}
							/>
							Sign in with Google
						</Button>
						{error && (
							<Typography color="error" sx={{ mt: 2 }}>
								{error}
							</Typography>
						)}
					</Box>
					<Box
						sx={{
							position: 'absolute',
							bottom: 0,
							width: '100%',
							textAlign: 'center',
							mb: 2,
						}}
					>
						<Link
							component={RouterLink}
							to="/sign-in"
							variant="body2"
							sx={{
								color: 'primary.main',
							}}
						>
							Login with Cube Account
						</Link>
					</Box>
				</Container>
			</ThemeProvider>
		);
	}
}

const mapStateToProps = (state: any) => ({
	isSignedIn: state.api.isSignedIn,
});

const GoogleSignInBehavior = (props: any) => {
	const navigate = useNavigate();

	return <GoogleSignInStructure {...props} navigate={navigate} />;
};

export const GoogleSignIn = connect(mapStateToProps)(GoogleSignInBehavior);

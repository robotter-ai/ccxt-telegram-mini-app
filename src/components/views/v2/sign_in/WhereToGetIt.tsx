import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const WhereToGetIt: React.FC = () => {
	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				bgcolor: 'background.default',
				width: '100%',
				paddingY: 4,
			}}
		>
			<Container component="main" maxWidth="md" sx={{ mb: 6 }}>
				<Paper
					elevation={3}
					sx={{
						padding: 4,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						width: '100%',
					}}
				>
					<Typography variant="h4" gutterBottom align="center" sx={{ width: '100%' }}>
						How to Get Your API Credentials
					</Typography>
					<Typography variant="body1" paragraph>
						Follow these steps to get your API Key, API Secret Key, and Sub Account ID:
					</Typography>
					<ol style={{ paddingLeft: '20px', margin: 0 }}>
						<li>
							<Typography variant="body2" paragraph>
								1. Go to <a href="https://www.cube.exchange" target="_blank" rel="noopener noreferrer">https://www.cube.exchange</a>, log in, and complete your KYC verification if you haven't already done so.
							</Typography>
						</li>
						<li>
							<Typography variant="body2" paragraph>
								2. Click on your avatar and navigate to "Settings".
							</Typography>
						</li>
						<li>
							<Typography variant="body2" paragraph>
								3. In the "Subaccounts" tab, locate your SubAccount ID. It's the number enclosed in parentheses.
							</Typography>
						</li>
						<li>
							<Typography variant="body2" paragraph>
								4. In the "API" tab, delete the current key by clicking on the red X icon.
							</Typography>
						</li>
						<li>
							<Typography variant="body2" paragraph>
								5. Click on "Add another API", select your avatar, choose "Read" permissions, and then create the new API keys.
							</Typography>
						</li>
						<li>
							<Typography variant="body2" paragraph>
								6. Finally, copy the newly generated keys and use them on our sign-in page.
							</Typography>
						</li>
					</ol>

					<Button
						fullWidth
						variant="contained"
						sx={{
							mt: 4,
							borderRadius: '50px',
							backgroundColor: 'black',
							color: 'white',
							border: '2px solid white',
							'&:hover': {
								backgroundColor: '#333',
								borderColor: '#FFA500',
							},
						}}
						component={RouterLink}
						to="/sign-in"
					>
						Return to Sign In
					</Button>
				</Paper>
			</Container>
		</Box>
	);
};

export default WhereToGetIt;

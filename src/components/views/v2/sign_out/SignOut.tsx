import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiPostAuthSignOut } from 'model/service/api';
import { dispatch } from 'model/state/redux/store';
import { Constant } from 'model/enum/constant';

export const SignOut = () => {
	const navigate = useNavigate();

	const handleSignOut = async () => {
		try {
			await apiPostAuthSignOut();
			dispatch('api.signOut', null);
			toast.success('Signed out successfully!');
			navigate(Constant.homePath.value as string);
		} catch (exception) {
			console.error(exception);
			toast.error('An error occurred during sign out.');
		}
	};

	return (
		<button onClick={handleSignOut}>
			Sign Out
		</button>
	);
};

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiPostAuthSignOut } from 'model/service/api';
import { dispatch } from 'model/state/redux/store';
import { Constant } from 'model/enum/constant';

const SignOut = () => {
	const navigate = useNavigate();

	const handleSignOut = async () => {
		try {
			await apiPostAuthSignOut();
			dispatch('api.signOut', null);
			toast.success('Signed out successfully!');
			navigate(Constant.signInPath.value as string);
		} catch (exception) {
			console.error(exception);
			toast.error('An error occurred during sign out.');
		}
	};

	return (
		<button onClick={handleSignOut} className="hover:bg-gray-700 text-white w-full text-left p-4">
			Sign Out
		</button>
	);
};

export default SignOut;

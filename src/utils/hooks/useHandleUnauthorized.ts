// import { useNavigate } from 'react-router-dom';
// import { Constant } from 'model/enum/constant';
import { dispatch } from 'model/state/redux/store';

export const useHandleUnauthorized = () => {
	// const navigate = useNavigate();

	return () => {
		dispatch('api.signOut', undefined);
		// navigate(Constant.signInPath.value as string);
	};
};

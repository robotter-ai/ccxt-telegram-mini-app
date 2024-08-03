import { Constant } from 'model/enum/constant';
import { dispatch } from 'model/state/redux/store';
import { clearAllIntervals } from 'model/service/recurrent';

export const useHandleUnauthorized = () => {
	return async () => {
		clearAllIntervals();
		dispatch('api.signOut', true);
		if (window.location.pathname !== Constant.signInPath.value)
			window.location.href = Constant.signInPath.value as string;
	};
};

import { Constant } from 'model/enum/constant';

export const getCurrentRoute = () => {
	switch (location.pathname.replace(Constant.currentRoutePath.value, '')) {
		case Constant.signInPath.value:
			return Constant.signInPath;
		case Constant.balancesPath.value:
			return Constant.balancesPath;
		case Constant.marketsPath.value:
			return Constant.marketsPath;
		case Constant.marketPath.value:
			return Constant.marketPath;
		case Constant.ordersPath.value:
			return Constant.ordersPath;
		case Constant.createOrderPath.value:
			return Constant.createOrderPath;
		case Constant.rewardsPath.value:
			return Constant.rewardsPath;
		default:
			return Constant.homePath;
	}
};

// This is used by the Footer.
export const getCurrentRouteOrder = () => {
	switch (getCurrentRoute().value) {
	case Constant.signInPath.value:
		return null;
	case Constant.balancesPath.value:
		return 0;
	case Constant.marketsPath.value:
		return 1;
	case Constant.marketPath.value:
		return 1;
	case Constant.ordersPath.value:
		return 2;
	case Constant.createOrderPath.value:
		return null;
	case Constant.rewardsPath.value:
		return 2;
	default:
		return null;
	}
};

// This is used by the Header.
export const getCurrentRouteTitle = () => {
	switch (getCurrentRoute().value) {
		case Constant.signInPath.value:
			return Constant.signInPath.title;
		case Constant.balancesPath.value:
			return Constant.balancesPath.title;
		case Constant.marketsPath.value:
			return Constant.marketsPath.title;
		case Constant.marketPath.value:
			return Constant.marketPath.title;
		case Constant.ordersPath.value:
			return Constant.ordersPath.title;
		case Constant.createOrderPath.value:
			return Constant.createOrderPath.title;
		case Constant.rewardsPath.value:
			return Constant.rewardsPath.title;
		default:
			return Constant.homePath.title;
	}
};

export const formatPrice = (price: number, precision?: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision ?? 2,
        maximumFractionDigits: precision ?? 2,
    }).format(price);
}

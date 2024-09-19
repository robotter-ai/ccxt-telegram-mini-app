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

export const formatPrice = (price: number | string, precision?: number): string => {
	const priceString = typeof price === 'string' ? price : price.toString();
	const actualPrecision = priceString.includes('.') ? priceString.split('.')[1].length : 0;
	const finalPrecision = Math.max(actualPrecision, precision ?? 2);

	const formattedPrice = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: finalPrecision,
		maximumFractionDigits: finalPrecision,
	}).format(typeof price === 'string' ? Number(price) : price);

	const cleanedPrice = formattedPrice.replace(/(\.\d*?[1-9])0+$/, '$1');

	if (cleanedPrice.includes('.')) {
		const decimalPart = cleanedPrice.split('.')[1];

		if (decimalPart.length < 2) {
			return cleanedPrice + '0';
		} else if (/^0+$/.test(decimalPart)) {
			return cleanedPrice.split('.')[0] + '.00';
		} else {
			return cleanedPrice;
		}
	} else {
		return cleanedPrice + '.00';
	}
};


export const removeLeadingZeroes = (value: string) => {
	return value.replace(/^0+(?=\d)/, '');
};

export const formatVolume = (value: number) => {
	return value.toFixed(2);
}

export const getPrecision = (price: number | string) => {
	return String(price).replace('$', '').split('.')[1]?.length
}

export const generateMarketMockData = (marketPrecision: number) => {
	const generateValue =
		() => Number((Math.random() * (100000 - 10) + 10).toFixed(marketPrecision));

	return {
		close: generateValue(),
		high: generateValue(),
		low: generateValue(),
		open: generateValue(),
		info: {
			timestamp: Date.now(),
			open: generateValue(),
			last_price: generateValue(),
			high: generateValue(),
			low: generateValue(),
		},
		timestamp: Date.now(),
	};
}

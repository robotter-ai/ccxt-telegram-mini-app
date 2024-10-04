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

/**
 * Usage:
 * 	formatPrice('123456.789') => 123,456.789
 * 	formatPrice('123456.789', 2, true) => $123,456.79
 * 	formatPrice(123456.789, 2, true) => $123,456.79
 * 	formatPrice(123456.789, 2) => 123,456.79
 * 	formatPrice(123456.7) => 123,456.70
 * 	formatPrice(123456, null, true) => $123,456.00
 *
 * @param price
 * @param precision
 * @param shouldDisplayCurrency
 * @param maxPrecision
 */
export const formatPrice = (
	price: number | string,
	precision?: number | null,
	shouldDisplayCurrency: boolean = false,
	maxPrecision?: number
): string => {
	if (isNaN(Number.parseFloat(price?.toString()))) {
		return '-';
	}

	const priceString = typeof price === 'string' ? price : price.toString();

	const actualPrecision = priceString.includes('.') ? priceString.split('.')[1].length : 0;

	let finalPrecision = Math.max(actualPrecision, precision ?? 2);
	if (maxPrecision !== undefined) {
		finalPrecision = Math.min(finalPrecision, maxPrecision);
	}

	const options: Intl.NumberFormatOptions = {
		minimumFractionDigits: finalPrecision,
		maximumFractionDigits: finalPrecision,
	};

	if (shouldDisplayCurrency) {
		options.style = 'currency';
		options.currency = 'USD';
	}

	const formattedPrice = new Intl.NumberFormat('en-US', options).format(Number.parseFloat(priceString));

	return formattedPrice;
};


export const removeLeadingZeroes = (value: string | number) => {
	const stringValue = typeof value === 'number' ? value.toString() : value;
	if (stringValue) {
		stringValue.replace(/^0+(?=\d)/, '');
	}
	return value;
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

import {useSelector} from 'react-redux';
import {Order} from 'api/types/orders';
import {styled, Box, Typography} from '@mui/material';

const StyledOrderDetails = styled(Box)(({theme}) => ({
	flexGrow: 1,
	textAlign: 'left',
	fontFamily: theme.fonts.primary,
}));

const StyledOrderId = styled(Typography)(({theme}) => ({
	fontSize: '13px',
	fontWeight: '300',
	fontFamily: 'inherit',
	color: theme.palette.text.secondary,
}));

const StyledOrderAmount = styled(Typography)(({theme}) => ({
	fontSize: '17px',
	fontWeight: '300',
	fontFamily: 'inherit',
	color: theme.palette.text.primary,
}));

const StyledOrderMarket = styled(Typography)(({theme}) => ({
	fontSize: '13px',
	fontWeight: '300',
	fontFamily: 'inherit',
	color: theme.palette.text.secondary,
}));

const StyledOrderDate = styled(Typography)(({theme}) => ({
	fontSize: '13px',
	fontWeight: '300',
	fontFamily: 'inherit',
	color: theme.palette.text.secondary,
}));

function OrderInfo(props: { order: Order, bgColor?: string }) {
	const getOrderMarket = (market: string) => {
		const markets = useSelector((state: any) => state.api.markets);
		const marketData = markets.find((m: any) => m.symbol === market);
		return {
			base: marketData.base,
			quote: marketData.quote,
		};
	};

	const formatDate = (datetime: string | number): string => {
		const date = new Date(datetime);

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');

		return `${year}-${month}-${day} • ${hours}:${minutes}:${seconds}`;
	};

	return (
		<StyledOrderDetails>
			<StyledOrderId>ORDER ID: {props.order.id}</StyledOrderId>
			<StyledOrderAmount>{props.order.amount} {getOrderMarket(props.order.market).base}</StyledOrderAmount>
			<StyledOrderMarket>{getOrderMarket(props.order.market).base} / {getOrderMarket(props.order.market).quote}</StyledOrderMarket>
			<StyledOrderDate>{formatDate(props.order.datetime)}</StyledOrderDate>
		</StyledOrderDetails>
	);
}

export default OrderInfo;

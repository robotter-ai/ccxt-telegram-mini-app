import {formatPrice} from "components/views/v2/utils/utils";
import {Order, OrderSide} from 'api/types/orders';
import {styled, Box, Typography} from '@mui/material';

const OrderSideLabelMapper = {[OrderSide.BUY]: 'BUY', [OrderSide.SELL]: 'SELL'};

const StyledBox = styled(Box)(({theme}) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'right',
	justifyContent: 'center',
	textAlign: 'right',
	fontFamily: theme.fonts.primary,
}));

const StyledOrderPrice = styled(Typography)(({theme}) => ({
	fontSize: '17px',
	fontWeight: '300',
	fontFamily: 'inherit',
	color: theme.palette.primary.main,
}));

const StyledOrderSide = styled(Typography)<{ side: OrderSide }>(({theme, side}) => ({
	fontSize: '13px',
	fontWeight: '300',
	fontFamily: 'inherit',
	color: side === OrderSide.BUY ? theme.palette.success.main : theme.palette.error.main,
}));

function OrderPrice(props: { order: Order }) {
	return (
		<StyledBox>
			<StyledOrderPrice>{formatPrice(props.order.price)}</StyledOrderPrice>
			<StyledOrderSide side={props.order.side}>
				{OrderSideLabelMapper[props.order.side]}
			</StyledOrderSide>
		</StyledBox>
	);
}

export default OrderPrice;

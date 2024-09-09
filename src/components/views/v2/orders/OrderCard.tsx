import {useState} from 'react';
import OrderInfo from "components/views/v2/orders/OrderInfo";
import {Order} from 'api/types/orders';
import Button, {ButtonType} from "components/general/Button";
import OrderPrice from "components/views/v2/orders/OrderPrice";
import {styled, Box, Typography, Modal} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const StyledOrderCard = styled(Box)({
	padding: '12px 0',
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
});

const StyledOrderInfoContainer = styled(Box)({
	alignItems: 'left',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	gap: '12px',
});

const StyledButtonContainer = styled(Box)({
	display: 'inline-flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	alignSelf: 'flex-start',
	width: '128px',
});

const StyledModal = styled(Modal)(({theme}) => ({
	display: 'flex',
	alignItems: 'flex-end',
	justifyContent: 'center',
	backgroundColor: `${theme.palette.background.default} opacity(0.5)`,
}));

const StyledModalContent = styled(Box)(({theme}) => ({
	backgroundColor: theme.palette.background.paper,
	width: '100%',
	height: '360px',
	borderTopLeftRadius: '16px',
	borderTopRightRadius: '16px',
}));

const StyledModalTitle = styled(Typography)(({theme}) => ({
	padding: '24px 0',
	fontWeight: '400',
	fontSize: '16px',
	fontFamily: theme.fonts.primary,
	textAlign: 'center',
	width: '100%',
}));

const StyledModalOrderCard = styled(Box)(({theme}) => ({
	padding: '16px 24px',
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	backgroundColor: theme.palette.background.default,
}));

const StyledModalButtonContainer = styled(Box)({
	padding: '32px 24px',
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	width: '100%',
	gap: '16px',
});

function OrderCard(props: {
	order: Order,
	handleCancelOrder: (order: Order) => Promise<void>
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const confirmCancelOrder = () => {
		props.handleCancelOrder(props.order);
		closeModal();
	};

	return (
		<StyledOrderCard>
			<StyledOrderInfoContainer>
				<OrderInfo order={props.order}/>
				<StyledButtonContainer>
					<Button icon={<CloseIcon sx={{marginTop: '-4px'}}/>} value={"Cancel"} type={ButtonType.Bordered}
									fullWidth={true} onClick={openModal}/>
				</StyledButtonContainer>
			</StyledOrderInfoContainer>
			<OrderPrice order={props.order}/>
			<StyledModal open={isModalOpen} onClose={closeModal}>
				<StyledModalContent>
					<StyledModalTitle>CANCEL ORDER?</StyledModalTitle>
					<StyledModalOrderCard>
						<StyledOrderInfoContainer>
							<OrderInfo order={props.order}/>
						</StyledOrderInfoContainer>
						<OrderPrice order={props.order}/>
					</StyledModalOrderCard>
					<StyledModalButtonContainer>
						<Button value={"Yes, cancel"} type={ButtonType.Bordered} onClick={confirmCancelOrder}/>
						<Button value={"No, back"} type={ButtonType.Full} onClick={closeModal}/>
					</StyledModalButtonContainer>
				</StyledModalContent>
			</StyledModal>
		</StyledOrderCard>
	);
}

export default OrderCard;

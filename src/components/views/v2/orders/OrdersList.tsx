import { Box, Modal, styled, Typography } from '@mui/material';
import { Order } from "api/types/orders";
import Button, { ButtonType } from "components/general/Button";
import OrderCard from 'components/views/v2/orders/OrderCard';
import { useState } from 'react';

const StyledOrdersHeader = styled(Box)({
	display: 'flex',
	justifyContent: 'space-between',
	marginTop: '18px',
	marginBottom: '2px',
});

const StyledOrdersTitle = styled(Typography)(({ theme }) => ({
	fontSize: '17px',
	fontWeight: '300',
	fontFamily: theme.fonts.primary,
	color: theme.palette.text.secondary,
}));

const StyledOrdersEmpty = styled(Box)(({ theme }) => ({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	height: '40vh',
	fontSize: '17px',
	fontWeight: '300',
	fontFamily: theme.fonts.primary,
}));

const StyledButtonContainer = styled(Box)({
	paddingTop: '16px',
	paddingBottom: '24px',
	display: 'flex',
	justifyContent: 'space-between',
	width: '100%',
});

const StyledModal = styled(Modal)(({ theme }) => ({
	display: 'flex',
	alignItems: 'flex-end',
	justifyContent: 'center',
	backgroundColor: `${theme.palette.background.default} opacity(0.5)`,
}));

const StyledModalContent = styled(Box)(({ theme }) => ({
	border: '1px solid red',
	backgroundColor: theme.palette.background.paper,
	width: '100%',
	height: '218px',
	borderTopLeftRadius: '16px',
	borderTopRightRadius: '16px',
}));

const StyledModalTitle = styled(Typography)(({ theme }) => ({
	marginTop: '24px',
	fontWeight: '400',
	fontSize: '16px',
	fontFamily: theme.fonts.primary,
	textAlign: 'center',
	width: '100%',
}));

const StyledModalButtonContainer = styled(Box)({
	display: 'flex',
	justifyContent: 'space-between',
	width: '100%',
	padding: '32px 24px',
	gap: '16px',
});

type OrderListProps = {
	orders: Order[];
	handleCancelAllOpenOrders: (orders: Order[]) => Promise<void>;
	handleCancelOrder: (order: Order) => Promise<void>;
	hasMarketPath: boolean;
}

function OrdersList(props: OrderListProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const confirmCancelOrder = async () => {
		await props.handleCancelAllOpenOrders(props.orders);
		closeModal();
	};

	return (
		<Box>
			{(props.hasMarketPath) ? (
				<StyledOrdersHeader>
					<StyledOrdersTitle>Orders</StyledOrdersTitle>
				</StyledOrdersHeader>
			) : (
				(!props.orders || props.orders.length === 0) ? (
					<></>
				) : (
					<StyledOrdersHeader>
						<StyledOrdersTitle>Orders</StyledOrdersTitle>
					</StyledOrdersHeader>
				)
			)}
			<div>
				{(!props.orders || props.orders.length === 0) ? (
					<StyledOrdersEmpty>
						You have no orders...
					</StyledOrdersEmpty>
				) : (
					<div>
						<div>
							{props.orders.map(order => (
								<OrderCard
									key={order.id}
									order={order}
									handleCancelOrder={props.handleCancelOrder}
								/>
							))}
						</div>
						<StyledButtonContainer>
							<Button value={"Cancel all"} type={ButtonType.Full} onClick={openModal} />
						</StyledButtonContainer>
						<StyledModal open={isModalOpen} onClose={closeModal}>
							<StyledModalContent>
								<StyledModalTitle>CANCEL ALL ORDERS?</StyledModalTitle>
								<StyledModalButtonContainer>
									<Button value={"Yes, cancel"} type={ButtonType.Bordered} onClick={confirmCancelOrder} />
									<Button value={"No, back"} type={ButtonType.Full} onClick={closeModal} />
								</StyledModalButtonContainer>
							</StyledModalContent>
						</StyledModal>
					</div>
				)}
			</div>
		</Box>
	);
}

export default OrdersList;

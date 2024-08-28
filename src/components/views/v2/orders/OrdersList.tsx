import { useState } from "react";
import Button, { ButtonType } from "components/views/v2/orders/Button.tsx";
import { Order } from "components/views/v2/orders/Order.tsx";
import OrderCard from 'components/views/v2/orders/OrderCard.tsx';

type OrderListProps = {
	orders: Order[];
	cancelAllOpenOrders: (orders: Order[]) => Promise<void>;
	canceledOrdersRef: Set<string>;
	fetchData: () => Promise<void>;
}

function OrdersList(props: OrderListProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const confirmCancelOrder = async() => {
		await props.cancelAllOpenOrders(props.orders)
		closeModal();
	};

	return (
		<div>
			<div className="flex justify-between mt-5 mb-1 px-6">
				<h1 className="font-bold">Orders</h1>
				<div className="font-normal text-[#A2ACB0]">Price(USDC)</div>
			</div>
			<div>
				{(!props.orders || props.orders.length === 0) ?  <div className="flex justify-center items-center h-40">You have no orders...</div> :
					<div>
						<div>
							{props.orders.map(order => (
								<OrderCard key={order.id} order={order} canceledOrdersRef={props.canceledOrdersRef}
													 fetchData={props.fetchData}/>
							))}
						</div>
						<div className="py-4 flex justify-center items-center">
							<Button value={"Cancel all"} type={ButtonType.Full} onClick={openModal}/>

							{isModalOpen && (
								<div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50">
									<div className="bg-black w-full h-1/4 p-6 rounded-t-lg border-t border-white">
										<p className="font-bold text-2xl text-center w-full">Cancel all orders?</p>
										<div className="mt-4 flex flex-row justify-between w-full">
											<Button value={"Yes, cancel"} type={ButtonType.Bordered} onClick={confirmCancelOrder}/>
											<Button value={"No, back"} type={ButtonType.Full} onClick={closeModal}/>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>}
			</div>
		</div>

	);
}

export default OrdersList;

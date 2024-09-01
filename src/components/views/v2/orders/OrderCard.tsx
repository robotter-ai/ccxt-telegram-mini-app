import {useState} from 'react';
import Order from "components/views/v2/orders/Order";
import {Order as IOrder} from 'api/types/orders';
import Button, {ButtonType} from "components/general/Button";

function OrderCard(props: { order: IOrder, canceledOrdersRef: Set<string>, handleCancelOrder: (order: Order) => Promise<void> }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const confirmCancelOrder = () => {
		props.handleCancelOrder(props.order);
		closeModal();
	};

	return (
		<div className="py-4 border-t border-white flex flex-col">
			<Order order={props.order}/>
			<div className="flex">
				<div className="text-left">
					<Button icon={"⤬"} value={"Cancel"} type={ButtonType.Bordered} onClick={openModal} />
				</div>

				{isModalOpen && (
					<div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50">
						<div className="p-2 bg-black w-full h-2/5 rounded-t-lg border-t border-white">
							<p className="p-3 font-bold text-2xl text-center w-full">Cancel order?</p>
							<div className="-m-2">
								<Order order={props.order} bgColor={"bg-gray-600"}/>
							</div>
							<div className="mt-4 flex flex-row justify-between w-full">
								<Button value={"Yes, cancel"} type={ButtonType.Bordered} onClick={confirmCancelOrder} />
								<Button value={"No, back"} type={ButtonType.Full} onClick={closeModal} />
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default OrderCard;

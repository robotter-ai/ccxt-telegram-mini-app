import {useState} from 'react';
import {apiDeleteCancelOrder} from "model/service/api";
import {toast} from "react-toastify";
import {useHandleUnauthorized} from "model/hooks/useHandleUnauthorized";
import Order, {Order as IOrder} from "components/views/v2/orders/Order";
import Button, { ButtonType} from "components/views/v2/orders/Button";


const handleUnAuthorized = useHandleUnauthorized();

function OrderCard(props: { order: IOrder, canceledOrdersRef: Set<string>, fetchData: () => Promise<void> }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleCancelOrder = async (order: IOrder) => {
		console.log(order);
		try {
			const response = await apiDeleteCancelOrder(
				{
						id: order.id,
						symbol: order.market,
				},
				handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			props.canceledOrdersRef.add(order.id);

			toast.success(`Order ${order.id} canceled successfully!`);

			await props.fetchData();
		} catch (error) {
			console.error('Failed to cancel order:', error);
			toast.error(`Failed to cancel order ${order.id}.`);
			throw error;
		}
	}

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const confirmCancelOrder = () => {
		handleCancelOrder(props.order);
		closeModal();
	};

	return (
		<div className="py-4 border-t border-white flex flex-col">
			<Order
				order={props.order}
				canceledOrdersRef={props.canceledOrdersRef}
				fetchData={props.fetchData}
			/>
			<div className="flex">
				<div className="text-left">
					<Button icon={"⤬"} value={"Cancel"} type={ButtonType.Bordered} onClick={openModal} />
				</div>

				{isModalOpen && (
					<div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50">
						<div className="p-2 bg-black w-full h-2/5 rounded-t-lg border-t border-white">
							<p className="p-3 font-bold text-2xl text-center w-full">Cancel order?</p>
							<div className="-m-2">
								<Order
									bgColor={"bg-gray-600"}
									order={props.order}
									canceledOrdersRef={props.canceledOrdersRef}
									fetchData={props.fetchData}
								/>
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

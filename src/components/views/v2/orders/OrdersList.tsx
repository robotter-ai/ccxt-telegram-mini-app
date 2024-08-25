import OrderCard, { Order } from './OrderCard.tsx';

type OrderListProps = {
	orders: Order[];
	cancelAllOpenOrders: (orders: Order[]) => Promise<void>;
	canceledOrdersRef: Set<string>;
	fetchData: () => Promise<void>;
}

function OrdersList(props: OrderListProps) {
	return (
		<div>
			<div className="flex justify-between mt-5 mb-1 px-5">
				<h1 className="font-bold text-orange-primary">Orders</h1>
				<p className="text-xs font-normal text-[#A2ACB0]">Price(USDC)</p>
			</div>
			<div>
				{props.orders.map(order => (
					<OrderCard key={order.id} order={order} canceledOrdersRef={props.canceledOrdersRef} fetchData={props.fetchData}/>
				))}
			</div>
			<div className="py-4 mx-4 flex justify-center">
				<button
					className="max-w-xs w-full bg-orange-primary py-3 px-4 rounded-3xl text-black font-bold"
					onClick={async() => await props.cancelAllOpenOrders(props.orders)}
				>Cancel all</button>
			</div>
		</div>

	);
}

export default OrdersList;

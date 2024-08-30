import { useSelector } from 'react-redux';
import { formatPrice } from "components/views/v2/utils/utils.tsx";

export type Order = {
	id: string;
	market: string;
	amount: string;
	price: number;
	datetime: string;
	side: "buy" | "sell";
	status: number | null;
}

function Order(props: { order: Order, canceledOrdersRef: Set<string>, fetchData: () => Promise<void>, bgColor?: string }) {
	const getOrderMarket = (market: string) => {
		const markets = useSelector((state: any) => state.api.markets);
		const marketData = markets.find((m: any) => m.symbol === market);
		return {
			base: marketData.base,
			quote: marketData.quote,
		}
	}



	const formatDate = (datetime: string): string => {
		const date = new Date(datetime);

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');

		return `${year}-${month}-${day} • ${hours}:${minutes}:${seconds}`;
	}

	return (
		<div className={`flex ${props.bgColor ? props.bgColor : 'bg-black'} p-6`}>
			<div className="flex-grow text-left">
				<p className="py-0.5 text-xs font-normal text-[#707579]">Order ID: {props.order.id}</p>
				<p className="py-1 text-white font-normal text-xl">{props.order.amount} {getOrderMarket(props.order.market).base}</p>
				<p className="py-0.5 text-xs font-normal text-[#A2ACB0]">{getOrderMarket(props.order.market).base} / {getOrderMarket(props.order.market).quote}</p>
				<p className="py-0.5 text-xs font-normal text-[#707579]">{formatDate(props.order.datetime)}</p>
			</div>
			<div className="flex flex-col items-center justify-center text-right">
				<p className="text-xl font-normal text-white">{formatPrice(props.order.price)}</p>
				<span className={`flex items-center justify-center rounded-[20px] text-[13px] font-semibold h-5 w-14 py-0 px-1 ${props.order.side === 'buy' ? "bg-[#3A9F20]" : "bg-[#E53935]"}`}>
					{props.order.side}
				</span>
			</div>
		</div>
	);
}

export default Order;

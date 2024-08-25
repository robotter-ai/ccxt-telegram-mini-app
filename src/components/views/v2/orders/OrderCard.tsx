import { useSelector } from 'react-redux';
// import * as React from 'react';
// import Select from 'react-select';
// import { toast } from 'react-toastify';

import {apiPostRun} from "model/service/api";
import {toast} from "react-toastify";
import {useHandleUnauthorized} from "model/hooks/useHandleUnauthorized.ts";

export type Order = {
	id: string;
	market: string;
	amount: string;
	price: number;
	datetime: Date;
	side: "buy" | "sell";
	status: number | null;
}

const handleUnAuthorized = useHandleUnauthorized();


function OrderCard(props: { order: Order, canceledOrdersRef: Set<string>, fetchData: () => Promise<void> }) {
	const getOrderMarket = (market: string) => {
		const markets = useSelector((state: any) => state.api.markets);
		const marketData = markets.find((m: any) => m.symbol === market);
		return {
			base: marketData.base,
			quote: marketData.quote,
		}
	}

	const handleCancelOrder = async (order: Order) => {
		console.log(order);
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'cancel_order',
					parameters: {
						id: order.id,
						symbol: order.market,
					},
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

	return (
		<div className="px-6 py-4 border-t border-[#606060] bg-white-500 flex">
			<div className="flex-grow text-left">
				<p className="py-0.5 text-xs font-normal text-[#707579]">Order ID: {props.order.id}</p>
				<p className="py-1 text-white font-normal text-xl">{props.order.amount} {getOrderMarket(props.order.market).base}</p>
				<p className="py-0.5 text-xs font-normal text-[#A2ACB0]">{getOrderMarket(props.order.market).base} / {getOrderMarket(props.order.market).quote}</p>
				<p className="py-0.5 text-xs font-normal text-[#707579]">{new Date(props.order.datetime).toLocaleString()}</p>
				<button
					className="my-2 px-4 py-2 border border-orange-primary rounded-3xl text-orange-primary"
					onClick={() => handleCancelOrder(props.order)}
				>X Cancel
				</button>
			</div>
			<div className="flex flex-col items-center justify-center text-right">
				<p className="text-xl font-normal text-white">{props.order.price}</p>
				<p className="text-xl font-normal text-white">{props.order.side}</p>
			</div>
		</div>
	);
}

export default OrderCard;

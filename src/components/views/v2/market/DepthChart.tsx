import {
	ResponsiveContainer,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	AreaChart,
	Area
} from 'recharts';
import {MaterialUITheme} from 'model/theme/MaterialUI';
import {BaseProps, BaseState, withHooks} from "components/base/Base";
import {connect} from "react-redux";
import {OrderBook} from "api/types/orderBook";

interface Props extends BaseProps {
	orderBook: OrderBook;
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
	api: { market: {orderBook: {chart: OrderBook}} };
}

const mapStateToProps = (state: State) => ({
	orderBook: state.api.market.orderBook.chart,
});

function transformOrderBookData(orderBookData: OrderBook) {
	type DataType = { price: number, bidAmount: number | null, askAmount: number | null, operation: string };
	let data: DataType[] = [];

	const bids = orderBookData.bids.map((bid: [string, string]) => ({
		price: parseFloat(bid[0]),
		bidAmount: parseFloat(bid[1]),
		askAmount: null,
		operation: 'bid'
	}));

	const asks = orderBookData.asks.map((ask: [string, string]) => ({
		price: parseFloat(ask[0]),
		bidAmount: null,
		askAmount: parseFloat(ask[1]),
		operation: 'ask'
	}));

	bids.sort((a: DataType, b: DataType) => a.price - b.price);
	asks.sort((a: DataType, b: DataType) => a.price - b.price);

	let cumulativeBidAmount = 0;
	let cumulativeAskAmount = 0;

	const cumulativeBids = [...bids].reverse().map((bid: DataType) => {
		cumulativeBidAmount += bid.bidAmount!;
		return {
			...bid,
			bidAmount: cumulativeBidAmount
		};
	}).reverse();

	const cumulativeAsks = asks.map((ask: DataType) => {
		cumulativeAskAmount += ask.askAmount!;
		return {
			...ask,
			askAmount: cumulativeAskAmount
		};
	});

	data = [...cumulativeBids, ...cumulativeAsks];

	return data;
}


const Structure = ({ orderBook }: Props) => {
	// const orderBookMock = {
	// 		"symbol": "BTCUSDC",
	// 		"bids": [
	// 			[
	// 				"60910.0",
	// 				"0.036"
	// 			],
	// 			[
	// 				"60909.1",
	// 				"0.1272"
	// 			],
	// 			[
	// 				"60905.6",
	// 				"0.157"
	// 			],
	// 			[
	// 				"60898.0",
	// 				"0.64595"
	// 			],
	// 			[
	// 				"60880.2",
	// 				"0.189"
	// 			],
	// 			[
	// 				"60872.1",
	// 				"0.02"
	// 			],
	// 			[
	// 				"60870.6",
	// 				"0.189"
	// 			],
	// 			[
	// 				"60868.0",
	// 				"0.31579"
	// 			],
	// 			[
	// 				"60861.9",
	// 				"0.2378"
	// 			],
	// 			[
	// 				"60851.1",
	// 				"0.04"
	// 			],
	// 			[
	// 				"60838.6",
	// 				"0.236"
	// 			],
	// 			[
	// 				"60758.1",
	// 				"0.4959"
	// 			],
	// 			[
	// 				"59100.0",
	// 				"0.00051"
	// 			],
	// 			[
	// 				"54000.0",
	// 				"0.19822"
	// 			],
	// 			[
	// 				"53150.0",
	// 				"0.00309"
	// 			],
	// 			[
	// 				"53000.0",
	// 				"0.00037"
	// 			],
	// 			[
	// 				"52500.0",
	// 				"0.00029"
	// 			],
	// 			[
	// 				"52000.0",
	// 				"0.02031"
	// 			],
	// 			[
	// 				"51768.0",
	// 				"0.03863"
	// 			],
	// 			[
	// 				"51600.0",
	// 				"0.007"
	// 			],
	// 			[
	// 				"51510.0",
	// 				"0.00168"
	// 			],
	// 			[
	// 				"51500.0",
	// 				"0.00029"
	// 			],
	// 			[
	// 				"51000.0",
	// 				"0.00029"
	// 			],
	// 			[
	// 				"50500.0",
	// 				"0.0003"
	// 			],
	// 			[
	// 				"50000.0",
	// 				"0.0023"
	// 			],
	// 			[
	// 				"49123.0",
	// 				"0.08629"
	// 			],
	// 			[
	// 				"49000.0",
	// 				"0.02033"
	// 			],
	// 			[
	// 				"48600.0",
	// 				"0.00168"
	// 			],
	// 			[
	// 				"45000.0",
	// 				"0.00222"
	// 			],
	// 			[
	// 				"44600.0",
	// 				"0.00168"
	// 			],
	// 			[
	// 				"42600.0",
	// 				"0.00168"
	// 			],
	// 			[
	// 				"39398.8",
	// 				"0.00556"
	// 			]
	// 		],
	// 		"asks": [
	// 			[
	// 				"60915.0",
	// 				"1.97345"
	// 			],
	// 			[
	// 				"60915.4",
	// 				"0.1202"
	// 			],
	// 			[
	// 				"60918.5",
	// 				"0.157"
	// 			],
	// 			[
	// 				"60927.0",
	// 				"0.46284"
	// 			],
	// 			[
	// 				"60936.0",
	// 				"0.189"
	// 			],
	// 			[
	// 				"60941.1",
	// 				"0.31579"
	// 			],
	// 			[
	// 				"60948.4",
	// 				"0.236"
	// 			],
	// 			[
	// 				"60949.9",
	// 				"0.04"
	// 			],
	// 			[
	// 				"60962.1",
	// 				"0.2432"
	// 			],
	// 			[
	// 				"60965.8",
	// 				"0.04"
	// 			],
	// 			[
	// 				"60978.7",
	// 				"0.236"
	// 			],
	// 			[
	// 				"60998.0",
	// 				"0.31579"
	// 			],
	// 			[
	// 				"61500.0",
	// 				"0.01626"
	// 			],
	// 			[
	// 				"62008.5",
	// 				"0.00002"
	// 			],
	// 			[
	// 				"62109.0",
	// 				"0.00003"
	// 			],
	// 			[
	// 				"62209.5",
	// 				"0.00002"
	// 			],
	// 			[
	// 				"62500.0",
	// 				"0.016"
	// 			],
	// 			[
	// 				"63500.0",
	// 				"0.01541"
	// 			],
	// 			[
	// 				"65030.0",
	// 				"0.00502"
	// 			],
	// 			[
	// 				"70000.0",
	// 				"0.00037"
	// 			],
	// 			[
	// 				"74400.0",
	// 				"0.02781"
	// 			]
	// 		],
	// 		"timestamp": 1726701015339,
	// 		"datetime": "2024-09-18T23:10:15.339Z",
	// 		"nonce": null
	// }

	const data = transformOrderBookData(orderBook);

	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart
				width={500}
				height={400}
				data={data}
				margin={{
					top: 10,
					right: 30,
					left: 0,
					bottom: 0,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="price" />
				<YAxis />
				<Tooltip />
				<Area type="step" dataKey="bidAmount" stroke={MaterialUITheme.palette.success.main} fill={MaterialUITheme.palette.success.main} />
				<Area type="step" dataKey="askAmount" stroke={MaterialUITheme.palette.error.main} fill={MaterialUITheme.palette.error.main} />
			</AreaChart>
		</ResponsiveContainer>
	);
};

const Behavior = connect(mapStateToProps)(withHooks(Structure));

export const DepthChart = Behavior;

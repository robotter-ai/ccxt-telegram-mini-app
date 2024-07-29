import { useState, useEffect } from 'react';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { apiPostRun } from 'model/service/api';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Select from 'react-select';

const OrderForm = () => {
	const [market, setMarket] = useState('');
	const [markets, setMarkets] = useState([]);
	const [orderType, setOrderType] = useState('limit');
	const [side, setSide] = useState('buy');
	const [amount, setAmount] = useState('');
	const [price, setPrice] = useState('');
	const dispatch = useDispatch();
	const handleUnauthorized = useHandleUnauthorized();

	useEffect(() => {
		const fetchMarkets = async () => {
			try {
				const response = await apiPostRun(
					{
						exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
						environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
						method: 'fetch_markets',
						parameters: {},
					},
					handleUnauthorized
				);

				if (response.status !== 200) {
					throw new Error('Network response was not OK');
				}

				const payload = response.data.result;

				if (!Array.isArray(payload)) {
					throw new Error('Unexpected API response format');
				}

				const formattedMarkets = payload.map((market: any) => ({
					value: market.symbol,
					label: `${market.base}/${market.quote}`,
				}));

				setMarkets(formattedMarkets);
			} catch (error) {
				console.error('Failed to fetch markets:', error);
				toast.error('Failed to fetch markets.');
			}
		};

		fetchMarkets();
	}, [handleUnauthorized, toast]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'create_order',
					parameters: {
						symbol: market,
						type: orderType,
						side: side,
						amount: parseFloat(amount),
						price: parseFloat(price),
					},
				},
				handleUnauthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			const payload = response.data;

			dispatch({ type: 'api.addOrder', payload: payload.result });

			toast.success(`Order created successfully!`);
		} catch (error) {
			console.error('Failed to create order:', error);
			toast.error('Failed to create order.');
		}
	};

	const orderTypeOptions = [
		{ value: 'limit', label: 'Limit' },
		{ value: 'market', label: 'Market' },
	];

	const sideOptions = [
		{ value: 'buy', label: 'Buy' },
		{ value: 'sell', label: 'Sell' },
	];

	return (
		<div className="h-full w-full p-4 bg-gray-900 text-white">
			<h2 className="text-2xl font-bold mb-4">Create Order</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="market" className="block text-sm font-medium text-gray-300">Market</label>
					<Select
						id="market"
						value={markets.find(option => option.value === market)}
						onChange={(option) => setMarket(option?.value || '')}
						options={markets}
						className="mt-1"
						styles={{
							control: (provided) => ({
								...provided,
								backgroundColor: '#1F2937',
								borderColor: '#374151',
								color: '#FFFFFF',
								minHeight: '40px',
								height: '40px',
								fontSize: '15px',
							}),
							singleValue: (provided) => ({
								...provided,
								color: '#FFFFFF',
							}),
							menu: (provided) => ({
								...provided,
								backgroundColor: '#1F2937',
							}),
							option: (provided, state) => ({
								...provided,
								backgroundColor: state.isSelected ? '#374151' : '#1F2937',
								color: state.isSelected ? '#fff' : '#d1d5db',
								'&:hover': {
									backgroundColor: '#374151',
								},
							}),
							input: (provided) => ({
								...provided,
								color: '#FFFFFF',
							}),
						}}
					/>
				</div>
				<div>
					<label htmlFor="orderType" className="block text-sm font-medium text-gray-300">Order Type</label>
					<Select
						id="orderType"
						value={orderTypeOptions.find(option => option.value === orderType)}
						onChange={(option) => setOrderType(option?.value || 'limit')}
						options={orderTypeOptions}
						className="mt-1"
						styles={{
							control: (provided) => ({
								...provided,
								backgroundColor: '#1F2937',
								borderColor: '#374151',
								color: '#FFFFFF',
								minHeight: '40px',
								height: '40px',
								fontSize: '15px',
							}),
							singleValue: (provided) => ({
								...provided,
								color: '#FFFFFF',
							}),
							menu: (provided) => ({
								...provided,
								backgroundColor: '#1F2937',
							}),
							option: (provided, state) => ({
								...provided,
								backgroundColor: state.isSelected ? '#374151' : '#1F2937',
								color: state.isSelected ? '#fff' : '#d1d5db',
								'&:hover': {
									backgroundColor: '#374151',
								},
							}),
							input: (provided) => ({
								...provided,
								color: '#FFFFFF',
							}),
						}}
					/>
				</div>
				<div>
					<label htmlFor="side" className="block text-sm font-medium text-gray-300">Side</label>
					<Select
						id="side"
						value={sideOptions.find(option => option.value === side)}
						onChange={(option) => setSide(option?.value || 'buy')}
						options={sideOptions}
						className="mt-1"
						styles={{
							control: (provided) => ({
								...provided,
								backgroundColor: '#1F2937',
								borderColor: '#374151',
								color: '#FFFFFF',
								minHeight: '40px',
								height: '40px',
								fontSize: '15px',
							}),
							singleValue: (provided) => ({
								...provided,
								color: '#FFFFFF',
							}),
							menu: (provided) => ({
								...provided,
								backgroundColor: '#1F2937',
							}),
							option: (provided, state) => ({
								...provided,
								backgroundColor: state.isSelected ? '#374151' : '#1F2937',
								color: state.isSelected ? '#fff' : '#d1d5db',
								'&:hover': {
									backgroundColor: '#374151',
								},
							}),
							input: (provided) => ({
								...provided,
								color: '#FFFFFF',
							}),
						}}
					/>
				</div>
				<div>
					<label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
					<input
						id="amount"
						type="number"
						step="0.0001"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						required
						className="mt-1 p-2 bg-gray-800 text-white rounded-md w-full"
					/>
				</div>
				<div>
					<label htmlFor="price" className="block text-sm font-medium text-gray-300">Price</label>
					<input
						id="price"
						type="number"
						step="0.01"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						required
						className="mt-1 p-2 bg-gray-800 text-white rounded-md w-full"
					/>
				</div>
				<div>
					<button
						type="submit"
						className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 w-full"
					>
						Create Order
					</button>
				</div>
			</form>
		</div>
	);
};

export default OrderForm;

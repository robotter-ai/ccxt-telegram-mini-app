import { useState, useEffect } from 'react';
import { useHandleUnauthorized } from 'utils/hooks/useHandleUnauthorized';
import { apiPostRun } from 'model/service/api';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';
import Spinner from 'components/views/spinner/Spinner'; // Adjust the import path as needed

const OrderForm = () => {
	const [markets, setMarkets] = useState([]);
	const dispatch = useDispatch();
	const handleUnauthorized = useHandleUnauthorized();
	const navigate = useNavigate();

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

				const formattedMarkets = payload.map((market) => ({
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
	}, [handleUnauthorized]);

	const orderTypeOptions = [
		{ value: 'limit', label: 'Limit' },
		{ value: 'market', label: 'Market' },
	];

	const sideOptions = [
		{ value: 'buy', label: 'Buy' },
		{ value: 'sell', label: 'Sell' },
	];

	const handleSubmit = async (values: any, setSubmitting: any) => {
		try {
			const selectedMarket = markets.find((m: any) => m.value === values.market);
			if (!selectedMarket) {
				toast.error('Selected market is not valid.');
				setSubmitting(false);
				return;
			}

			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'create_order',
					parameters: {
						symbol: values.market,
						type: values.orderType,
						side: values.side,
						amount: parseFloat(values.amount),
						price: parseFloat(values.price),
					},
				},
				handleUnauthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			const payload = response.data;

			dispatch({ type: 'api.addOrder', payload: payload.result });

			toast.success('Order created successfully!');
			navigate('/orders');
		} catch (error) {
			console.error('Failed to create order:', error);
			toast.error('Failed to create order.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="h-full w-full p-4 bg-gray-900 text-white">
			<Formik
				initialValues={{
					market: '',
					orderType: 'limit',
					side: 'buy',
					amount: '',
					price: '',
				}}
				onSubmit={(values, { setSubmitting }) => handleSubmit(values, setSubmitting)}
			>
				{({ isSubmitting, setFieldValue, values }) => (
					<Form className="space-y-4">
						<div>
							<label htmlFor="market" className="block text-sm font-medium text-gray-300">
								Market
							</label>
							<Select
								id="market"
								name="market"
								value={markets.find((option) => option.value === values.market)}
								onChange={(option) => setFieldValue('market', option?.value || '')}
								options={markets}
								className="mt-1"
								placeholder="Select a market"
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
							<label htmlFor="orderType" className="block text-sm font-medium text-gray-300">
								Order Type
							</label>
							<Select
								id="orderType"
								name="orderType"
								value={orderTypeOptions.find((option) => option.value === values.orderType)}
								onChange={(option) => setFieldValue('orderType', option?.value || 'limit')}
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
							<label htmlFor="side" className="block text-sm font-medium text-gray-300">
								Side
							</label>
							<Select
								id="side"
								name="side"
								value={sideOptions.find((option) => option.value === values.side)}
								onChange={(option) => setFieldValue('side', option?.value || 'buy')}
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
							<label htmlFor="amount" className="block text-sm font-medium text-gray-300">
								Amount
							</label>
							<Field
								id="amount"
								name="amount"
								type="number"
								step="0.0001"
								required
								className="mt-1 p-2 bg-gray-800 text-white rounded-md w-full"
							/>
						</div>
						<div>
							<label htmlFor="price" className="block text-sm font-medium text-gray-300">
								Price
							</label>
							<Field
								id="price"
								name="price"
								type="number"
								step="0.01"
								required
								className="mt-1 p-2 bg-gray-800 text-white rounded-md w-full"
							/>
						</div>
						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 w-full flex items-center justify-center"
								style={{ minHeight: '40px', height: '40px' }}
							>
								{isSubmitting ? <Spinner /> : 'Create Order'}
							</button>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default OrderForm;

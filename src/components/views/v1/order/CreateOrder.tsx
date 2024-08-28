import { useEffect } from 'react';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import {apiPostCreateOrder} from 'model/service/api';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Field, Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import { connect } from 'react-redux';

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: any, props: any) => ({
	markets: state.api.markets,
});

const CreateOrderStructure = ({ markets, marketId }: any) => {
	const handleUnauthorized = useHandleUnauthorized();
	const navigate = useNavigate();

	useEffect(() => {}, [handleUnauthorized]);

	markets = markets.map((market: any) => ({
		value: market.symbol,
		label: `${market.base}/${market.quote}`,
	}));

	const orderTypeOptions = [
		{ value: 'limit', label: 'Limit' },
		{ value: 'market', label: 'Market' },
	];

	const sideOptions = [
		{ value: 'buy', label: 'Buy' },
		{ value: 'sell', label: 'Sell' },
	];

	const handleSubmit = async (values: any) => {
		try {
			const selectedMarket = markets.find((m: any) => m.value ? m.value.toUpperCase() === values.market.toUpperCase() : false);
			if (!selectedMarket) {
				toast.error('Selected market is not valid.');
				return;
			}

			const response = await apiPostCreateOrder(
				{
						symbol: values.market,
						type: values.orderType,
						side: values.side,
						amount: parseFloat(values.amount),
						price: values.orderType === 'market' ? null : parseFloat(values.price),
				},
				handleUnauthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			toast.success('Order created successfully!');

			navigate('/orders');
		} catch (error) {
			console.error('Failed to create order:', error);
			toast.error('Failed to create order.');
		}
	};

	return (
		<div className="h-full w-full p-4 bg-[#181818] text-white"> {/* Updated background color */}
			<Formik
				initialValues={{
					market: marketId || '',
					orderType: 'limit',
					side: 'buy',
					amount: '',
					price: '',
				}}
				onSubmit={(values) => handleSubmit(values)}
				enableReinitialize={true}
			>
				{({ isSubmitting, setFieldValue, values }) => (
					<Form
						className="space-y-4"
						onSubmit={async (e) => {
							e.preventDefault();
							e.stopPropagation();
							await handleSubmit(values);
						}}
					>
						{!marketId && (
							<div>
								<label htmlFor="market" className="block text-sm font-medium text-gray-300">
									Market
								</label>
								<Select
									id="market"
									name="market"
									value={markets.find((option: any) => option.value ? option.value.toUpperCase() === values.market.toUpperCase() : false)}
									onChange={(option) => setFieldValue('market', option?.value || '')}
									options={markets}
									className="mt-1"
									placeholder="Select a market"
									styles={{
										control: (provided) => ({
											...provided,
											backgroundColor: '#393939',
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
											backgroundColor: '#393939',
										}),
										option: (provided, state) => ({
											...provided,
											backgroundColor: state.isSelected ? '#374151' : '#393939',
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
						)}
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
										backgroundColor: '#393939',
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
										backgroundColor: '#393939',
									}),
									option: (provided, state) => ({
										...provided,
										backgroundColor: state.isSelected ? '#374151' : '#393939',
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
										backgroundColor: '#393939',
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
										backgroundColor: '#393939',
									}),
									option: (provided, state) => ({
										...provided,
										backgroundColor: state.isSelected ? '#374151' : '#393939',
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
								className="mt-1 p-2 bg-[#393939] text-white rounded-md w-full"
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
								disabled={values.orderType === 'market'}
								className={`mt-1 p-2 rounded-md w-full ${
									values.orderType === 'market' ? 'bg-gray-600' : 'bg-[#393939] text-white'
								}`}
							/>
						</div>
						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="px-4 py-2 bg-[#FE8A00] text-white rounded-md hover:bg-orange-600 w-full flex items-center justify-center"
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

export const CreateOrder = connect(mapStateToProps)(CreateOrderStructure);

import * as React from 'react';
import Select from 'react-select';

interface Data {
	checkbox: boolean;
	id: number;
	market: string;
	status: string;
	side: string;
	amount: number;
	price: number;
	datetime: string;
	actions: any;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
	order: Order,
	orderBy: Key,
): (
	a: { [key in Key]: number | string },
	b: { [key in Key]: number | string },
) => number {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
	const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) {
			return order;
		}
		return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
	align: 'center' | 'left' | 'right' | 'inherit' | 'justify' | undefined;
}

const headCells: readonly HeadCell[] = [
	{ id: 'id', label: 'ID', align: 'center', numeric: false, disablePadding: false },
	{ id: 'market', label: 'Market', align: 'center', numeric: false, disablePadding: false },
	{ id: 'status', label: 'Status', align: 'center', numeric: false, disablePadding: false },
	{ id: 'side', label: 'Side', align: 'center', numeric: false, disablePadding: false },
	{ id: 'amount', label: 'Amount', align: 'center', numeric: true, disablePadding: false },
	{ id: 'price', label: 'Price', align: 'center', numeric: true, disablePadding: false },
	{ id: 'datetime', label: 'Datetime', align: 'center', numeric: true, disablePadding: false },
	{ id: 'actions', label: 'Actions', align: 'center', numeric: false, disablePadding: false },
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
	const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
		onRequestSort(event, property);
	};

	return (
		<thead className="bg-gray-800">
		<tr>
			<th className="p-4">
				<input
					type="checkbox"
					className="form-checkbox text-orange-500"
					checked={rowCount > 0 && numSelected === rowCount}
					onChange={onSelectAllClick}
				/>
			</th>
			{headCells.map((headCell) => (
				<th
					key={headCell.id}
					className="px-2 md:px-6 py-3 text-xs font-medium text-white tracking-wider text-center"
					onClick={createSortHandler(headCell.id)}
				>
					{headCell.label}
				</th>
			))}
		</tr>
		</thead>
	);
}

interface EnhancedTableToolbarProps {
	numSelected: number;
	onCancelSelectedOpenOrdersClick: () => void;
	onCancelAllOpenOrdersClick: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	const { numSelected, onCancelSelectedOpenOrdersClick, onCancelAllOpenOrdersClick } = props;

	return (
		<div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900">
			{numSelected > 0 ? (
				<span className="text-white">{numSelected} selected</span>
			) : (
				<h2 className="text-xl font-bold text-white"></h2>
			)}
			{numSelected > 0 ? (
				<button
					className="mt-2 md:mt-0 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
					onClick={onCancelSelectedOpenOrdersClick}
				>
					Cancel selected
				</button>
			) : (
				<button
					className="mt-2 md:mt-0 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
					onClick={onCancelAllOpenOrdersClick}
				>
					Cancel All Orders
				</button>
			)}
		</div>
	);
}

interface Props {
	rows: Data[];
	cancelOpenOrder: (orderId: string | number) => void;
	cancelOpenOrders: (orderIds: (string | number)[]) => void;
	cancelAllOpenOrders: () => void;
}

export default function OrdersTable({ rows, cancelOpenOrder, cancelOpenOrders, cancelAllOpenOrders }: Props) {
	const [order, setOrder] = React.useState<Order>('asc');
	const [orderBy, setOrderBy] = React.useState<keyof Data>('market');
	const [selected, setSelected] = React.useState<readonly string[] | number[]>([]);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(100);

	const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			const newSelected = rows.map((n) => n.id);
			setSelected(newSelected);
			return;
		}
		setSelected([]);
	};

	const handleClick = (event: React.MouseEvent<unknown>, id: string | number) => {
		const selectedIndex = selected.indexOf(id);
		let newSelected: readonly (string | number)[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}
		setSelected(newSelected);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (selectedOption: any) => {
		setRowsPerPage(selectedOption.value);
		setPage(0);
	};

	const isSelected = (id: string | number) => selected.indexOf(id) !== -1;

	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const visibleRows = React.useMemo(
		() => stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[order, orderBy, page, rowsPerPage, rows]
	);

	const handleCancelOpenOrderClick = (orderId: string | number) => async (event: React.MouseEvent) => {
		event.stopPropagation();
		await cancelOpenOrder(orderId);
	};

	const handleCancelSelectedOpenOrdersClick = async () => {
		await cancelOpenOrders(selected);
		setSelected([]);
	};

	const handleCancelAllOpenOrdersClick = async () => {
		await cancelAllOpenOrders();
	};

	const rowsPerPageOptions = [
		{ value: 5, label: '5' },
		{ value: 10, label: '10' },
		{ value: 25, label: '25' },
		{ value: 50, label: '50' },
		{ value: 100, label: '100' },
		{ value: 500, label: '500' },
		{ value: 1000, label: '1000' },
	];

	return (
		<div className="h-full w-full p-4 bg-gray-900 text-white">
			<EnhancedTableToolbar
				numSelected={selected.length}
				onCancelSelectedOpenOrdersClick={handleCancelSelectedOpenOrdersClick}
				onCancelAllOpenOrdersClick={handleCancelAllOpenOrdersClick}
			/>
			<div className="overflow-x-auto max-h-[60vh]">
				<table className="min-w-full divide-y divide-gray-700 text-sm">
					<EnhancedTableHead
						numSelected={selected.length}
						order={order}
						orderBy={orderBy}
						onSelectAllClick={handleSelectAllClick}
						onRequestSort={handleRequestSort}
						rowCount={rows.length}
					/>
					<tbody className="bg-gray-800 divide-y divide-gray-700">
					{visibleRows.map((row, index) => {
						const isItemSelected = isSelected(row.id);
						const labelId = `enhanced-table-checkbox-${index}`;

						return (
							<tr
								key={row.id}
								className={`hover:bg-gray-700 cursor-pointer ${isItemSelected ? 'bg-gray-700' : ''}`}
								onClick={(event) => handleClick(event, row.id)}
							>
								<td className="p-4">
									<input
										type="checkbox"
										className="form-checkbox text-orange-500"
										checked={isItemSelected}
										onChange={(event) => event.stopPropagation()}
										aria-labelledby={labelId}
									/>
								</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.id}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.market}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.status}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.side}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-right">{row.amount}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-right">{row.price}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.datetime}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">
									<button
										className="px-2 py-1 text-orange-500 border border-orange-500 rounded-md hover:bg-orange-500 hover:text-white"
										onClick={handleCancelOpenOrderClick(row.id)}
									>
										Cancel order
									</button>
								</td>
							</tr>
						);
					})}
					{emptyRows > 0 && (
						<tr style={{ height: 33 * emptyRows }}>
							<td colSpan={9} />
						</tr>
					)}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col md:flex-row justify-between p-4">
				<div className="mb-4 md:mb-0 relative">
					<Select
						className="bg-gray-800 text-white border-gray-700"
						value={rowsPerPageOptions.find(option => option.value === rowsPerPage)}
						onChange={handleRowsPerPageChange}
						options={rowsPerPageOptions}
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
					<span className="ml-2">Orders per page</span>
				</div>
				<div className="flex justify-between space-x-2">
					<button
						className="px-4 py-2 bg-gray-700 text-white rounded-md cursor-pointer hover:bg-gray-600"
						onClick={() => handleChangePage(null, page - 1)}
						disabled={page === 0}
					>
						Previous
					</button>
					<button
						className="px-4 py-2 bg-gray-700 text-white rounded-md cursor-pointer hover:bg-gray-600"
						onClick={() => handleChangePage(null, page + 1)}
						disabled={page >= Math.ceil(rows.length / rowsPerPage) - 1}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}

import * as React from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';

interface Data {
	checkbox: string;
	id: number;
	market: string;
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
	orderBy: Key
): (
	a: { [key in Key]: number | string },
	b: { [key in Key]: number | string }
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
	{ id: 'side', label: 'Side', align: 'center', numeric: false, disablePadding: false },
	{ id: 'amount', label: 'Amount', align: 'center', numeric: true, disablePadding: false },
	{ id: 'price', label: 'Price', align: 'center', numeric: true, disablePadding: false },
	{ id: 'datetime', label: 'Datetime', align: 'center', numeric: true, disablePadding: false },
	{ id: 'actions', label: 'Actions', align: 'center', numeric: false, disablePadding: false },
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick, numSelected, rowCount, onRequestSort } = props;
	const createSortHandler = (property: keyof Data) => () => {
		onRequestSort(property);
	};

	return (
		<thead className="bg-[#393939]">
		<tr>
			<th className="p-4">
				<input
					type="checkbox"
					className="form-checkbox text-[#FE8A00]"
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
	disableCancelAllButton: boolean;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	const { numSelected, onCancelSelectedOpenOrdersClick, onCancelAllOpenOrdersClick, disableCancelAllButton } = props;

	return (
		<div className="flex flex-col md:flex-row items-center justify-between p-4 bg-[#181818]">
			<div className="flex space-x-2 ml-auto">
				<button
					className={`px-4 py-2 bg-[#FE8A00] text-white rounded-md hover:bg-orange-600 ${disableCancelAllButton ? 'opacity-50 cursor-not-allowed' : ''}`}
					onClick={onCancelAllOpenOrdersClick}
					disabled={disableCancelAllButton}
				>
					Cancel All
				</button>
				{numSelected > 0 && (
					<button
						className="px-4 py-2 bg-[#FE8A00] text-white rounded-md hover:bg-orange-600"
						onClick={onCancelSelectedOpenOrdersClick}
					>
						Cancel {numSelected} selected
					</button>
				)}
			</div>
		</div>
	);
}

interface Props {
	rows: Data[];
	cancelOpenOrder: (order: any) => Promise<void>;
	cancelOpenOrders: (orders: readonly any[]) => Promise<void>;
	cancelAllOpenOrders: (order: readonly any[]) => Promise<void>;
}

export function OrdersTable({
															rows,
															cancelOpenOrder,
															cancelOpenOrders,
															cancelAllOpenOrders
														}: Props) {
	const [order, setOrder] = React.useState<Order>('asc');
	const [orderBy, setOrderBy] = React.useState<keyof Data>('market');
	const [selected, setSelected] = React.useState<readonly any[]>([]);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(100);

	const handleRequestSort = (property: keyof Data) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			setSelected(rows);
			return;
		}
		setSelected([]);
	};

	const handleClick = (_: React.MouseEvent<unknown>, order: any) => {
		const selectedIndex = selected.findIndex(selectedOrder => selectedOrder.id === order.id);
		let newSelected: readonly any[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, order);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}
		setSelected(newSelected);
	};

	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (option: { value: number; label: string }) => {
		setRowsPerPage(option.value);
		setPage(0);
	};

	const isSelected = (id: number | string) => selected.some(selectedOrder => selectedOrder.id === id);

	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const visibleRows = React.useMemo(
		() => stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[order, orderBy, page, rowsPerPage, rows]
	);

	const handleCancelOpenOrderClick = (order: any) => async (event: React.MouseEvent) => {
		event.stopPropagation();
		const confirm = window.confirm(`Are you sure you want to cancel order ${order.id}?`);
		if (confirm) {
			await cancelOpenOrder(order);
		}
	};

	const handleCancelSelectedOpenOrdersClick = async () => {
		const confirm = window.confirm(`Are you sure you want to cancel the selected orders?`);
		if (confirm) {
			await cancelOpenOrders(selected);
			setSelected([]);
		}
	};

	const handleCancelAllOpenOrdersClick = async () => {
		if (rows.length === 0) {
			toast.error("You have no active orders");
			return;
		}
		const confirm = window.confirm(`Are you sure you want to cancel all open orders?`);
		if (confirm) {
			await cancelAllOpenOrders(rows);
		}
	};

	const rowsPerPageOptions = [
		{ value: 5, label: '5' },
		{ value: 10, label: '10' },
		{ value: 25, label: '25' },
		{ value: 50, label: '50' },
		{ value: 100, label: '100' },
		{ value: 1000, label: '1000' },
	];

	return (
		<div className="h-full w-full p-4 bg-[#181818] text-white">
			<EnhancedTableToolbar
				numSelected={selected.length}
				onCancelSelectedOpenOrdersClick={handleCancelSelectedOpenOrdersClick}
				onCancelAllOpenOrdersClick={handleCancelAllOpenOrdersClick}
				disableCancelAllButton={rows.length === 0}
			/>
			<div className="overflow-x-auto max-h-[60vh]">
				<table className="min-w-full divide-y divide-gray-700">
					<EnhancedTableHead
						numSelected={selected.length}
						order={order}
						orderBy={orderBy}
						onSelectAllClick={handleSelectAllClick}
						onRequestSort={handleRequestSort}
						rowCount={rows.length}
					/>
					<tbody className="bg-[#393939] divide-y divide-gray-700">
					{visibleRows.map((row, index) => {
						const isItemSelected = isSelected(row.id);
						const labelId = `enhanced-table-checkbox-${index}`;

						return (
							<tr
								key={row.id}
								className={`hover:bg-[#393939] cursor-pointer ${isItemSelected ? 'bg-[#393939}' : ''}`}
								onClick={(event) => handleClick(event, row)}
							>
								<td className="p-4">
									<input
										type="checkbox"
										className="form-checkbox text-[#FE8A00]"
										checked={isItemSelected}
										onChange={(event) => handleClick(event as unknown as React.MouseEvent<unknown>, row)}
										aria-labelledby={labelId}
									/>
								</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.id}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.market}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.side.toString().toUpperCase()}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-right">{row.amount}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-right">{row.price}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.datetime}</td>
								<td className="px-2 md:px-6 py-2 md:py-4 text-center">
									<button
										className="px-2 py-1 text-[#FE8A00] border border-[#FE8A00] rounded-md hover:bg-[#FE8A00] hover:text-white"
										onClick={handleCancelOpenOrderClick(row)}
									>
										Cancel
									</button>
								</td>
							</tr>
						);
					})}
					{emptyRows > 0 && (
						<tr style={{ height: 53 * emptyRows }}>
							<td colSpan={9} />
						</tr>
					)}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col md:flex-row justify-between p-4">
				<div className="mb-4 md:mb-0 w-28">
					<Select
						value={rowsPerPageOptions.find(option => option.value === rowsPerPage)}
						onChange={(option) => handleChangeRowsPerPage(option as { value: number; label: string })}
						options={rowsPerPageOptions}
						className="bg-gray-800 text-white"
						styles={{
							control: (provided) => ({
								...provided,
								backgroundColor: '#393939',
								borderColor: '#374151',
								color: '#FFFFFF',
								minHeight: '35px',
								height: '35px',
								fontSize: '14px',
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
								backgroundColor: state.isSelected ? '#393939' : '#393939',
								color: state.isSelected ? '#fff' : '#d1d5db',
								'&:hover': {
									backgroundColor: '#393939',
								},
							}),
							input: (provided) => ({
								...provided,
								color: '#FFFFFF',
							}),
						}}
					/>
				</div>
				<div className="flex justify-between space-x-2">
					<button
						className="px-4 py-2 bg-[#393939] text-white rounded-md cursor-pointer hover:bg-[#393939]"
						onClick={() => handleChangePage(null, page - 1)}
						disabled={page === 0}
					>
						Previous
					</button>
					<button
						className="px-4 py-2 bg-[#393939] text-white rounded-md cursor-pointer hover:bg-[#393939]"
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

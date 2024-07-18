import * as React from 'react';
import { useNavigate } from 'react-router-dom';

interface Data {
	id: number;
	symbol: string;
	base: string;
	quote: string;
	active: boolean;
	precision: number;
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
	{ id: 'symbol', label: 'Symbol', align: 'center', numeric: false, disablePadding: false },
	{ id: 'base', label: 'Base Asset', align: 'center', numeric: false, disablePadding: false },
	{ id: 'quote', label: 'Quote Asset', align: 'center', numeric: false, disablePadding: false },
	{ id: 'active', label: 'Active', align: 'center', numeric: false, disablePadding: false },
	{ id: 'precision', label: 'Precision', align: 'center', numeric: true, disablePadding: false },
];

interface EnhancedTableProps {
	order: Order;
	orderBy: string;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { order, orderBy, onRequestSort } = props;
	const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
		onRequestSort(event, property);
	};

	return (
		<thead className="bg-gray-800">
		<tr>
			{headCells.map((headCell) => (
				<th
					key={headCell.id}
					className="px-2 md:px-6 py-3 text-xs font-medium text-white tracking-wider text-center cursor-pointer"
					onClick={createSortHandler(headCell.id)}
				>
					{headCell.label}
				</th>
			))}
		</tr>
		</thead>
	);
}

interface EnhancedTableToolbarProps {}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	return (
		<div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900">
			<h2 className="text-xl font-bold text-white">Markets</h2>
		</div>
	);
}

interface Props {
	rows: Data[];
}

export default function MarketsTable({ rows }: Props) {
	const [order, setOrder] = React.useState<Order>('asc');
	const [orderBy, setOrderBy] = React.useState<keyof Data>('symbol');
	const [page, setPage] = React.useState(0);
	const [dense, setDense] = React.useState(false);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const navigate = useNavigate();

	const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleClick = (event: React.MouseEvent<unknown>, symbol: number) => {
		navigate(`/market?marketId=${symbol}`);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDense(event.target.checked);
	};

	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const visibleRows = React.useMemo(
		() => stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[order, orderBy, page, rowsPerPage, rows]
	);

	return (
		<div className="h-full min-h-screen w-full p-4 bg-gray-900 text-white">
			<EnhancedTableToolbar />
			<div className="overflow-x-auto max-h-[60vh]">
				<table className={`min-w-full divide-y divide-gray-700 ${dense ? 'text-sm' : 'text-base'}`}>
					<EnhancedTableHead
						order={order}
						orderBy={orderBy}
						onRequestSort={handleRequestSort}
					/>
					<tbody className="bg-gray-800 divide-y divide-gray-700">
					{visibleRows.map((row) => (
						<tr
							key={`${row.symbol}-${row.base}-${row.quote}`}
							className="hover:bg-gray-700 cursor-pointer"
							onClick={(event) => handleClick(event, row.symbol)}
						>
							<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.symbol}</td>
							<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.base}</td>
							<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.quote}</td>
							<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.active ? 'Yes' : 'No'}</td>
							<td className="px-2 md:px-6 py-2 md:py-4 text-right">{row.precision}</td>
						</tr>
					))}
					{emptyRows > 0 && (
						<tr style={{ height: (dense ? 33 : 53) * emptyRows }}>
							<td colSpan={5} />
						</tr>
					)}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col md:flex-row justify-between p-4">
				<div className="mb-4 md:mb-0">
					<label className="inline-flex items-center">
						<input
							type="checkbox"
							className="form-checkbox"
							checked={dense}
							onChange={handleChangeDense}
						/>
						<span className="ml-2">Dense padding</span>
					</label>
				</div>
				<div className="mb-4 md:mb-0">
					<select
						className="form-select bg-gray-800 text-white border-gray-700"
						value={rowsPerPage}
						onChange={handleChangeRowsPerPage}
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={25}>25</option>
					</select>
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

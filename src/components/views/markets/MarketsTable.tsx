import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

interface Data {
	id: number;
	symbol: string;
	base: string;
	quote: string;
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
	{ id: 'symbol', label: 'Symbol', align: 'center', numeric: false, disablePadding: false },
	{ id: 'base', label: 'Base Asset', align: 'center', numeric: false, disablePadding: false },
	{ id: 'quote', label: 'Quote Asset', align: 'center', numeric: false, disablePadding: false },
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

interface EnhancedTableToolbarProps {
	filterText: string;
	onFilterTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	return (
		<div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900">
			<input
				type="text"
				placeholder="Filter markets"
				value={props.filterText}
				onChange={props.onFilterTextChange}
				className="mt-2 md:mt-0 p-2 rounded bg-gray-800 text-white border border-gray-700 w-full md:w-auto"
			/>
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
	const [rowsPerPage, setRowsPerPage] = React.useState(100);
	const [filterText, setFilterText] = React.useState('');
	const navigate = useNavigate();

	const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
		navigate(`/market?marketId=${id}`);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (option: { value: number; label: string }) => {
		setRowsPerPage(option.value);
		setPage(0);
	};

	const handleFilterTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilterText(event.target.value);
		setPage(0);
	};

	const filteredRows = rows.filter(row =>
		row.symbol.toLowerCase().includes(filterText.toLowerCase())
	);

	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

	const visibleRows = React.useMemo(
		() => stableSort(filteredRows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[order, orderBy, page, rowsPerPage, filteredRows]
	);

	const rowsPerPageOptions = [
		{ value: 5, label: '5' },
		{ value: 10, label: '10' },
		{ value: 25, label: '25' },
		{ value: 50, label: '50' },
		{ value: 100, label: '100' },
		{ value: 1000, label: '1000' },
	];

	return (
		<div className="h-full min-h-screen w-full p-4 bg-gray-900 text-white">
			<EnhancedTableToolbar filterText={filterText} onFilterTextChange={handleFilterTextChange} />
			<div className="overflow-x-auto max-h-[60vh]">
				<table className={`min-w-full divide-y divide-gray-700 text-sm`}>
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
							onClick={(event) => handleClick(event, row.id)}
						>
							<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.symbol}</td>
							<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.base}</td>
							<td className="px-2 md:px-6 py-2 md:py-4 text-center">{row.quote}</td>
						</tr>
					))}
					{emptyRows > 0 && (
						<tr style={{ height: 33 * emptyRows }}>
							<td colSpan={3} />
						</tr>
					)}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col md:flex-row justify-between p-4">
				<div className="mb-4 md:mb-0 w-28">
					<Select
						value={rowsPerPageOptions.find(option => option.value === rowsPerPage)}
						onChange={handleChangeRowsPerPage}
						options={rowsPerPageOptions}
						className="bg-gray-800 text-white"
						styles={{
							control: (provided) => ({
								...provided,
								backgroundColor: '#1F2937',
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
						disabled={page >= Math.ceil(filteredRows.length / rowsPerPage) - 1}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import * as React from 'react';

interface Data {
	id: number;
	symbol: string;
	base: string;
	quote: string;
	precision: number;
	price: number;
	datetime: string;
}

interface Props {
	rows: Data[];
}

interface EnhancedTableToolbarProps {
	filterText: string;
	onFilterTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function formatCryptoValue(price: number | string, precision: number | string) {
	return Number(price) > 0 ? new Intl.NumberFormat('de-DE', {
		style: 'decimal',
		minimumFractionDigits: Number(precision),
		maximumFractionDigits: Number(precision),
	}).format(Number(price)) : 0;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	return (
		<>
			<div className="relative w-full md:w-auto">
				<label htmlFor="" className="absolute -top-[10px] left-4 text-sm text-[#A2ACB0] font-semibold bg-[#212121] px-1">
					Search
				</label>
				<input
					type="text"
					placeholder="Filter markets"
					value={props.filterText}
					onChange={props.onFilterTextChange}
					className="md:mt-0 py-3 px-4 rounded-[14px] bg-[#212121] text-white border-[1.8px] border-[#707579] w-full pr-10"
				/>
				<SearchRoundedIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FE8A00] w-6" />
			</div>
		</>
	);
}

function SegmentControl() {
	const [activeTab, setActiveTab] = React.useState("all");

	return (
		<div className="flex items-center bg-[#707579] p-[2px] rounded-[20px] w-full mt-5">
			<button
				className={`flex-1 px-6 py-2 rounded-full focus:outline-none ${activeTab === "all" ? "bg-[#FFB040] text-black font-semibold" : "text-white"
					}`}
				onClick={() => setActiveTab("all")}
			>
				All
			</button>
			<button
				className={`flex-1 px-6 py-2 rounded-full focus:outline-none ${activeTab === "favorite" ? "bg-[#FFB040] text-black font-semibold" : "text-white"
					}`}
				onClick={() => setActiveTab("favorite")}
			>
				Favorite
			</button>
			<button
				className={`flex-1 px-6 py-2 rounded-full focus:outline-none ${activeTab === "runes" ? "bg-[#FFB040] text-black font-semibold" : "text-white"
					}`}
				onClick={() => setActiveTab("runes")}
			>
				Runes
			</button>
		</div>
	);
}

function ListMarkets({ markets }: { markets: Data[] }) {
	return (
		<div className="overflow-x-auto mt-5 block">
			<table className="table-fixed w-full">
				<thead>
					<tr>
						<th className="text-[#FE8A00] w-1/2 text-left">Market</th>
						<th className="text-[#A2ACB0] text-[13px] font-normal w-1/2 text-right">Price(USDC), 24h Chg</th>
					</tr>
				</thead>
			</table>
			<div className="overflow-y-auto max-h-[60vh]">
				<table className="table-fixed w-full">
					<tbody>
						{markets.map(row => (
							<tr
								className="h-16 shadow-[0_0.5px_0_0_rgba(255,255,255,0.2)] flex items-center"
								key={`${row.symbol}-${row.base}-${row.quote}`}
							>
								<td className="w-1/2 text-left flex items-center">
									{
										row.price && row.price > 0 // mock
											? <StarRoundedIcon className="text-[#FE8A00] mr-1" />
											: <StarBorderRoundedIcon className='text-[#FE8A00] mr-1' />
									}
									<span className="text-base">
										{`${row.base} / ${row.quote}`}
									</span>
								</td>
								<td className="w-1/2 text-right flex items-center justify-end">
									<div className="flex flex-col items-end">
										{formatCryptoValue(row.price, row.precision)}
										<span className={`rounded-[20px] text-[13px] font-semibold h-5 w-14 py-0 px-1 ${row.price && row.price > 0 ? "bg-[#3A9F20]" : "bg-[#E53935]"}`}> {/*mock*/}
											1.23% {/*mock*/}
										</span>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export function MarketsTable({ rows }: Props) {
	const [filterText, setFilterText] = React.useState('');

	const handleFilterTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilterText(event.target.value);
	};

	const filteredRows = rows.filter(row =>
		row.symbol.toLowerCase().includes(filterText.toLowerCase())
	);

	return (
		<div className="w-full px-[22px] py-5 text-white">
			<EnhancedTableToolbar filterText={filterText} onFilterTextChange={handleFilterTextChange} />

			<SegmentControl />

			<ListMarkets markets={filteredRows} />
		</div>
	);
}

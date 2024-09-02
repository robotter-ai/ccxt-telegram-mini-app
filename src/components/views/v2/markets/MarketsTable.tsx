import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Constant } from 'model/enum/constant';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { formatPrice } from '../utils/utils';

interface Data {
	id: number;
	symbol: string;
	base: string;
	quote: string;
	precision: number;
	price: number;
	datetime: string;
	percentage: number;
}

interface Props {
	rows: Data[];
}

interface EnhancedTableToolbarProps {
	filterText: string;
	onFilterTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	return (
		<>
			<div className="relative w-full md:w-auto">
				<input
					type="text"
					placeholder="Search"
					value={props.filterText}
					onChange={props.onFilterTextChange}
					className="md:mt-0 py-3 px-4 rounded-[14px] bg-transparent text-white border-[1.8px] border-white w-full pr-10"
				/>
				<SearchRoundedIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white w-6" />
			</div>
		</>
	);
}

// will not be used now
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
	const navigate = useNavigate();
	const handleClick = (market: Data) => {
		const url  = `${Constant.marketPath.value}?marketId=${market.id}`;
		navigate(url);
	};

	return (
		<div className="overflow-x-auto mt-8 block">
			<table className="table-fixed w-full">
				<thead>
					<tr>
						<th className="text-white w-1/2 text-left">Market</th>
						<th className="text-white text-[13px] font-normal w-1/2 text-right">Price(USDC), 24h Chg</th>
					</tr>
				</thead>
			</table>
			<div className="overflow-y-auto max-h-[65vh]">
				<table className="table-fixed w-full">
					<tbody>
						{markets.map(row => (
							<tr
								className="h-16 shadow-[0_0.5px_0_0_rgba(255,255,255,0.2)] flex items-center"
								key={`${row.symbol}-${row.base}-${row.quote}`}
								onClick={() => handleClick(row)}
							>
								<td className="w-1/2 text-left flex items-center">
									{/* will not be used now */}
									{/* {
										row.price && row.price > 0
											? <StarRoundedIcon className="text-[#FE8A00] mr-1" />
											: <StarBorderRoundedIcon className='text-[#FE8A00] mr-1' />
									} */}
									<span className="text-base">
										{`${row.base} / ${row.quote}`}
									</span>
								</td>
								<td className="w-1/2 text-right flex items-center justify-end">
									<div className="flex flex-col items-end">
										{formatPrice(row.price, row.precision)}
										<span className={`text-[13px] font-semibold ${row.percentage >= 0 ? "text-[#3A9F20]" : "text-[#E53935]"}`}>
											{row.percentage.toFixed(2)}%
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

			{/* <SegmentControl /> */}

			<ListMarkets markets={filteredRows} />
		</div>
	);
}

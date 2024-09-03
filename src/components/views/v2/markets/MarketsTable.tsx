import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, styled, TableBody, TableCell, TableRow, Typography, TypographyProps } from '@mui/material';
import TextInput from 'components/general/TextInput';
import { Constant } from 'model/enum/constant';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { formatPrice } from '../utils/utils';

const Container = styled(Box)({
	marginTop: '20px',
	padding: '0 16px',
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'stretch',
	gap: '16px',
});

const StyledTableRow = styled(TableRow)({
	width: '100%',
	height: '64px',
	display: 'flex',
	alignItems: 'center',
	border: 'none',
});

const StyledTableCellLeft = styled(TableCell)({
	width: '50%',
	textAlign: 'left',
	display: 'flex',
	alignItems: 'center',
	border: 'none',
});

const StyledTableCellRight = styled(TableCell)({
	width: '50%',
	textAlign: 'right',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	border: 'none',
});

const PercentageText = styled(Typography)<{ percentage: number }>((props: TypographyProps & { percentage: number }) => ({
	fontSize: '13px',
	fontWeight: 'bold',
	color: props.percentage >= 0 ? MaterialUITheme.palette.success.main : MaterialUITheme.palette.error.main,
}));

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
		<TextInput
			label='SEARCH'
			value={props.filterText}
			onChange={props.onFilterTextChange}
			icon={<SearchRoundedIcon sx={{ fontSize: '24px' }} />}
		/>
	);
}

function ListMarkets({ markets }: { markets: Data[] }) {
	const navigate = useNavigate();
	const handleClick = (market: Data) => {
		const url = `${Constant.marketPath.value}?marketId=${market.id}`;
		navigate(url);
	};

	return (
		<TableBody>
			{markets.map(row => (
				<StyledTableRow
					key={`${row.symbol}-${row.base}-${row.quote}`}
					onClick={() => handleClick(row)}
				>
					<StyledTableCellLeft>
						<Typography variant="body1">
							{`${row.base} / ${row.quote}`}
						</Typography>
					</StyledTableCellLeft>
					<StyledTableCellRight>
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
							{formatPrice(row.price, row.precision)}
							<PercentageText percentage={row.percentage}>
								{row.percentage > 0 ? `+${row.percentage.toFixed(2)}` : `${row.percentage.toFixed(2)}`}%
							</PercentageText>
						</div>
					</StyledTableCellRight>
				</StyledTableRow>
			))}
		</TableBody>
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
		<Container>
			<EnhancedTableToolbar filterText={filterText} onFilterTextChange={handleFilterTextChange} />
			<ListMarkets markets={filteredRows} />
		</Container>
	);
}

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, styled, Table, TableBody, TableCell, TableRow, Typography, TypographyProps } from '@mui/material';
import TextInput from 'components/general/TextInput';
import { Constant } from 'model/enum/constant';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { formatPrice } from '../utils/utils';

const Container = styled(Box)({
	padding: '16px 22px',
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'stretch',
	gap: '16px',
	flex: 1,
});

const ScrollContainer = styled(Box)(({ theme }) => ({
	overflowY: 'auto',
	maxHeight: '70vh',
	width: '100%',
	flex: 1,
	[theme.breakpoints.down(414)]: {
		maxHeight: '60vh',
	},
}));

const StyledTable = styled(Table)({
	width: '100%',
	flex: 1,
});

const StyledTableBody = styled(TableBody)({
	width: '100%',
	display: 'block',
	flex: 1,
});

const StyledTableRow = styled(TableRow)({
	display: 'flex',
	alignItems: 'center',
	width: '100%',
	border: 'none',
	boxSizing: 'border-box',
	flex: 1,
});

const StyledTableCellLeft = styled(TableCell)({
	flex: 1,
	padding: '10px 0',
	textAlign: 'left',
	display: 'flex',
	alignItems: 'center',
	border: 'none',
	boxSizing: 'border-box',
});

const StyledTableCellRight = styled(TableCell)({
	flex: 1,
	padding: '10px 0',
	textAlign: 'right',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	border: 'none',
	boxSizing: 'border-box',
});

const FlexEndContainer = styled(Box)({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-end',
});

const PercentageText = styled(Typography)<{ percentage: number }>((props: TypographyProps & { percentage: number }) => ({
	fontWeight: '300',
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
			icon={
				<SearchRoundedIcon
					sx={{ fontSize: '24px', color: MaterialUITheme.palette.text.secondary }}
				/>
			}
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
		<StyledTableBody>
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
						<FlexEndContainer>
							{formatPrice(row.price, row.precision)}
							<PercentageText percentage={row.percentage}>
								{row.percentage > 0 ? `+${row.percentage.toFixed(2)}` : `${row.percentage.toFixed(2)}`}%
							</PercentageText>
						</FlexEndContainer>
					</StyledTableCellRight>
				</StyledTableRow>
			))}
		</StyledTableBody>
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
			<ScrollContainer>
				<StyledTable>
					<ListMarkets markets={filteredRows} />
				</StyledTable>
			</ScrollContainer>
		</Container>
	);
}

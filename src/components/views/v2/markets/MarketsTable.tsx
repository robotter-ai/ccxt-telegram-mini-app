import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, styled, Table, TableBody, TableCell, TableRow, Typography, TypographyProps, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import TextInput from 'components/general/TextInput';
import { MaterialUITheme } from 'model/theme/MaterialUI';
import { useInView } from 'react-intersection-observer';
import { formatPrice } from '../utils/utils';
import MarketChart from './MarketChart';
import { Spinner } from 'components/views/v2/layout/spinner/Spinner';
import { apiGetUserMarketFavorites, apiPostUserMarketFavorite, apiDeleteUserMarketFavorite } from 'model/service/api';
import { dispatch } from 'model/state/redux/store';
import { useNavigate } from 'react-router';
import { Constant } from "model/enum/constant";

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
	favorites: Set<number>;
	updateUserMarketFavorites: (favorites: number[]) => void;
	addFavorite: (marketId: number) => void;
	removeFavorite: (marketId: number) => void;
}

const Container = styled(Box)({
	padding: '6px 22px 0px',
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
	padding: '0 2px',
	flex: 1,
	[theme.breakpoints.down(414)]: {
		maxHeight: '65vh',
	},
}));

const StyledTable = styled(Table)({
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
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
});

const StyledTableCellFavorite = styled(TableCell)({
	width: '40px',
	padding: '10px 0',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	border: 'none',
	boxSizing: 'border-box',
});

const StyledTableCellLeft = styled(TableCell)({
	width: 'calc(50% - 60px)',
	padding: '10px 0',
	textAlign: 'left',
	display: 'flex',
	alignItems: 'center',
	border: 'none',
	boxSizing: 'border-box',
	fontWeight: '300',
	fontSize: '14px',
	whiteSpace: 'nowrap',
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
	fontWeight: '300',
	fontSize: '14px',
	whiteSpace: 'nowrap',
});

const StyledTableCellChart = styled(TableCell)({
	width: '100px',
	padding: '0',
	textAlign: 'center',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	border: 'none',
	boxSizing: 'border-box',
});

const FlexEndContainer = styled(Box)({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-end',
});

const getColorForPercentage = (percentage: number) => {
	return percentage >= 0 ? MaterialUITheme.palette.success.main : MaterialUITheme.palette.error.main;
};

const PercentageText = styled(Typography)<{ percentage: number }>((props: TypographyProps & { percentage: number }) => ({
	fontWeight: '300',
	fontSize: '13px',
	fontFamily: MaterialUITheme.fonts.monospace,
	color: getColorForPercentage(props.percentage),
}));

function LazyMarketChart({ market }: { market: Data }) {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.5,
	});

	return (
		<StyledTableCellChart ref={ref}>
			{inView && <MarketChart market={market} colorChart={getColorForPercentage(market.percentage)} />}
		</StyledTableCellChart>
	);
}

function MarketsTable(props: Props) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);
	const [filterText, setFilterText] = useState('');
	const [filterType, setFilterType] = useState<'ALL' | 'FAVORITES'>('ALL');

	const navigate = useNavigate();

	useEffect(() => {
		const initialize = async () => {
			try {
				const response = await apiGetUserMarketFavorites();
				if (response.status === 200) {
					props.updateUserMarketFavorites(response.data.result);
				} else {
					throw new Error(response.message);
				}
			} catch (error) {
				toast.error('Failed to fetch favorites');
				setError('Failed to fetch favorites');
			} finally {
				setIsLoading(false);
			}
		};

		initialize();
	}, []);

	const handleFilterTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilterText(event.target.value);
	};

	const handleFilterTypeChange = (_event: React.MouseEvent<HTMLElement>, newFilterType: 'ALL' | 'FAVORITES') => {
		if (newFilterType !== null) {
			setFilterType(newFilterType);
		}
	};

	const handleToggleFavorite = async (marketId: number) => {
		if (props.favorites.has(marketId)) {
			try {
				const response = await apiDeleteUserMarketFavorite({ marketId });
				if (response.status === 200) {
					props.removeFavorite(marketId);
				} else {
					throw new Error(response.message);
				}
			} catch (error) {
				toast.error('Failed to remove favorite');
			}
		} else {
			try {
				const response = await apiPostUserMarketFavorite({ marketId });
				if (response.status === 201) {
					props.addFavorite(marketId);
				} else {
					throw new Error(response.message);
				}
			} catch (error) {
				toast.error('Failed to add favorite');
			}
		}
	};

	const handleMarketClick = (marketId: number) => {
		navigate(`${Constant.marketPath.value}?marketId=${marketId}`);
	};

	const filteredAndSortedRows = () => {
		let filteredRows = props.rows.filter((row) =>
			row.symbol.toLowerCase().includes(filterText.toLowerCase())
		);

		if (filterType === 'FAVORITES') {
			filteredRows = filteredRows.filter((row) => props.favorites.has(row.id));
		}

		// return filteredRows.sort((a, b) => {
		// 	if (props.favorites.has(a.id) === props.favorites.has(b.id)) {
		// 		return 0;
		// 	}
		// 	return props.favorites.has(a.id) ? -1 : 1;
		// });
		return filteredRows
	};

	if (isLoading) {
		return <Spinner />;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	const filteredRows = filteredAndSortedRows();

	return (
		<Container>
			<TextInput
				label="SEARCH"
				placeholder="BTC..."
				value={filterText}
				onChange={handleFilterTextChange}
				icon={<SearchRoundedIcon sx={{ fontSize: '24px', color: '#8e8e8e' }} />}
			/>
			<ToggleButtonGroup
				value={filterType}
				exclusive
				onChange={handleFilterTypeChange}
				aria-label="market filter"
				sx={{
					alignSelf: 'center',
					mt: 2,
					borderRadius: '20px',
					border: '1.8px solid',
					backgroundColor: MaterialUITheme.palette.background.paper,
					overflow: 'hidden',
					height: '30px'
				}}
			>
				<ToggleButton  value="ALL" aria-label="all markets">
					ALL
				</ToggleButton>
				<ToggleButton  value="FAVORITES" aria-label="favorite markets">
					FAVORITES
				</ToggleButton>
			</ToggleButtonGroup>
			<ScrollContainer>
				<StyledTable>
					<StyledTableBody>
						{filteredRows.map((row) => (
							<StyledTableRow
								key={`${row.symbol}-${row.base}-${row.quote}`}
								onClick={() => handleMarketClick(row.id)}
							>
								<StyledTableCellFavorite>
									<IconButton
										size="small"
										onClick={(e) => {
											e.stopPropagation();
											handleToggleFavorite(row.id);
										}}
									>
										{props.favorites.has(row.id) ? (
											<StarIcon color="primary" fontSize="small" />
										) : (
											<StarBorderIcon fontSize="small" />
										)}
									</IconButton>
								</StyledTableCellFavorite>
								<StyledTableCellLeft>{`${row.base} / ${row.quote}`}</StyledTableCellLeft>
								<LazyMarketChart market={row} />
								<StyledTableCellRight>
									<FlexEndContainer>
										<Typography variant="body2">{formatPrice(row.price, row.precision)}</Typography>
										<PercentageText percentage={row.percentage}>
											{row.percentage > 0 ? `+${row.percentage.toFixed(2)}` : `${row.percentage.toFixed(2)}`}%
										</PercentageText>
									</FlexEndContainer>
								</StyledTableCellRight>
							</StyledTableRow>
						))}
					</StyledTableBody>
				</StyledTable>
			</ScrollContainer>
		</Container>
	);
}

const mapStateToProps = (state: any) => ({
	favorites: new Set<number>(state.api.favorites),
});

// @ts-ignore
const mapDispatchToProps = (reduxDispatch: any) => ({
	updateUserMarketFavorites(favorites: number[]) {
		dispatch('api.updateUserMarketFavorites', favorites);
	},
	addFavorite(marketId: number) {
		dispatch('api.addUserMarketFavorite', marketId);
	},
	removeFavorite(marketId: number) {
		dispatch('api.removeUserMarketFavorite', marketId);
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(MarketsTable);

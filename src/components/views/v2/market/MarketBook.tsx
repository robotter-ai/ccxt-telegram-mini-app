import { Box, styled, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { apiGetFetchOrderBook } from 'model/service/api';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { formatPrice } from 'components/views/v2/utils/utils.tsx';

interface MarketBookProps {
	marketId: string;
	height?: string | number;
}

interface OrderBookData {
	symbol: string;
	bids: [string, string][];
	asks: [string, string][];
	timestamp: number;
	datetime: string;
	nonce: null;
}

interface TableContainerProps {
	$height?: string | number;
}

const TableContainer = styled(Box)<TableContainerProps>`
  width: 100%;
  height: ${props => props.$height || '400px'};
  overflow-y: auto;
  padding: 10px;
`;

const StyledTable = styled(Table)({
	tableLayout: 'fixed',
	width: '100%',
});

const CompactTableCell = styled(TableCell)({
	padding: '6px 8px',
	fontSize: '12px',
	whiteSpace: 'nowrap',
});

const GreenText = styled(Typography)({
	color: 'green',
	fontWeight: 'bold',
	fontSize: '12px',
});

const RedText = styled(Typography)({
	color: 'red',
	fontWeight: 'bold',
	fontSize: '12px',
});

const MarketBook = ({ marketId, height }: MarketBookProps) => {
const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(null);

	useEffect(() => {
		const fetchOrderBookData = async () => {
			try {
				const response = await apiGetFetchOrderBook({ symbol: marketId });

				if (response.status !== 200) {
					throw new Error(response.data?.title || 'Failed to fetch order book data');
				}

				setOrderBookData(response.data.result);
			} catch (exception) {
				console.error(exception);
				toast.error('An error has occurred while fetching order book data');
			}
		};

		fetchOrderBookData();
	}, [marketId]);

	const renderTable = () => {
		if (!orderBookData) return null;

		const maxRows = Math.max(orderBookData.bids.length, orderBookData.asks.length);

		return (
			<StyledTable>
				<TableHead>
					<TableRow>
						<CompactTableCell align="left">Amount</CompactTableCell>
						<CompactTableCell align="left">Bid</CompactTableCell>
						<CompactTableCell align="left">Ask</CompactTableCell>
						<CompactTableCell align="left">Amount</CompactTableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{Array.from({ length: maxRows }).map((_, index) => {
						const bid = orderBookData.bids[index];
						const ask = orderBookData.asks[index];

						return (
							<TableRow key={index}>
								<CompactTableCell align="left">{bid ? bid[1] : '-'}</CompactTableCell>
								<CompactTableCell align="left">
									{bid ? <GreenText>{formatPrice(bid[0])}</GreenText> : '-'}
								</CompactTableCell>
								<CompactTableCell align="left">
									{ask ? <RedText>{formatPrice(ask[0])}</RedText> : '-'}
								</CompactTableCell>
								<CompactTableCell align="left">{ask ? ask[1] : '-'}</CompactTableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</StyledTable>
		);
	};

	return (
		<TableContainer $height={height}>
			{orderBookData ? renderTable() : <p>Loading order book data...</p>}
		</TableContainer>
	);
};

export default MarketBook;

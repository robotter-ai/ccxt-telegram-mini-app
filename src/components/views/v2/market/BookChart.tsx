import { Box, styled, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { formatPrice } from 'components/views/v2/utils/utils';
import { connect } from 'react-redux';
import { withHooks } from 'components/base/Base';
import { OrderBook } from 'api/types/orderBook';

interface TableContainerProps {
	height?: string | number;
}

const TableContainer = styled(Box)<TableContainerProps>`
  width: 100%;
  height: ${props => props.height || '25em'};
  overflow-y: auto;
  padding: 0.625em;
`;

const StyledTable = styled(Table)({
	tableLayout: 'fixed',
	width: '100%',
});

const CompactTableCell = styled(TableCell)({
	padding: '0.6em 0.0725em',
	fontSize: '0.7875em',
	whiteSpace: 'nowrap',
});

const GreenText = styled(Typography)({
	color: 'green',
	fontWeight: 'bold',
	fontSize: '0.9875em',
});

const RedText = styled(Typography)({
	color: 'red',
	fontWeight: 'bold',
	fontSize: '0.9875em',
});

interface Props {
	marketId: string;
	orderBook: OrderBook;
	height?: string | number;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: Props | any) => ({
	orderBook: state.api.market.orderBook.chart,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
const mapDispatchToProps = (reduxDispatch: any) => ({
});

const Structure = ({ orderBook, height }: Props) => {
	const renderTable = () => {
		if (!orderBook) return null;

		if (!orderBook.bids) orderBook.bids = [];
		if (!orderBook.asks) orderBook.asks = [];

		const maxRows = Math.max(orderBook.bids.length, orderBook.asks.length, 0);

		return (
			<Box>
				<StyledTable>
					<TableHead>
						<TableRow>
							<CompactTableCell align="left">Amount</CompactTableCell>
							<CompactTableCell align="left">Bid</CompactTableCell>
							<CompactTableCell align="left">Ask</CompactTableCell>
							<CompactTableCell sx={{px: -2}} align="left">Amount</CompactTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{Array.from({ length: maxRows }).map((_, index) => {
							const bid = orderBook.bids ? orderBook.bids[index] : null;
							const ask = orderBook.asks ? orderBook.asks[index] : null;

							return (
								<TableRow key={index}>
									<CompactTableCell align="left">{bid ? formatPrice(bid[1]) : '-'}</CompactTableCell>
									<CompactTableCell align="left">
										{bid ? <GreenText>{formatPrice(bid[0])}</GreenText> : '-'}
									</CompactTableCell>
									<CompactTableCell align="left">
										{ask ? <RedText>{formatPrice(ask[0])}</RedText> : '-'}
									</CompactTableCell>
									<CompactTableCell align="left">{ask ? formatPrice(ask[1]) : '-'}</CompactTableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</StyledTable>
			</Box>
		);
	};

	return (
		<TableContainer height={height}>
			{orderBook ? renderTable() : <p>Loading order book data...</p>}
		</TableContainer>
	);
};

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Structure)(({ theme }) => `
`);

const Behavior = connect(mapStateToProps, mapDispatchToProps)(withHooks(Style));

export const BookChart = Behavior;

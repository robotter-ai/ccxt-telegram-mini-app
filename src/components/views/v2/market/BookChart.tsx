import { Box, styled, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { formatPrice } from 'components/views/v2/utils/utils.tsx';
import { connect } from 'react-redux';
import { withHooks } from 'components/base/Base.tsx';

interface TableContainerProps {
	height?: string | number;
}

const TableContainer = styled(Box)<TableContainerProps>`
  width: 100%;
  height: ${props => props.height || '400px'};
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

interface Props {
	marketId: string;
	orderBook: any;
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

		const maxRows = Math.max(orderBook.bids?.length, orderBook.asks?.length, 0);

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
						const bid = orderBook.bids[index];
						const ask = orderBook.asks[index];

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

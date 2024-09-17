import { Box, styled } from '@mui/material';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import { MarketsTable } from 'components/views/v2/markets/MarketsTable';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { apiGetFetchMarkets, apiGetFetchTickers } from 'model/service/api';
import { connect } from 'react-redux';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Markets.css';

interface MarketsProps extends BaseProps {
	markets: any;
	dispatch: any;
	queryParams: any;
	params: any;
	searchParams: any;
	navigate: any;
	handleUnAuthorized: any;
}

interface MarketsState extends BaseState {
	isLoading: boolean;
	error?: string;
}

const Container = styled(Box)({
	width: '100%',
});

const mapStateToProps = (state: any) => ({
	markets: state.api.markets,
});

class MarketsStructure extends Base<MarketsProps, MarketsState> {

	static defaultProps: Partial<BaseProps> = {};

	recurrentIntervalId?: number | NodeJS.Timeout;

	recurrentDelay?: number;

	constructor(props: MarketsProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		};

		this.recurrentIntervalId = undefined;
		this.recurrentDelay = 3 * 10 * 1000;
	}

	async componentDidMount() {
		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	async initialize() {
		try {
			await this.fetchMarketsData();
		} catch (error) {
			console.error('Initialization error:', error);
			this.setState({ error: (error as Error).message });
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async doRecurrently() {
		this.recurrentIntervalId = setInterval(async () => {
			try {
				await this.fetchMarketsData();
			} catch (error) {
				console.error('Recurrent fetch error:', error);
				this.setState({ error: (error as Error).message });
			}
		}, this.recurrentDelay);
	}

	render() {
		const { isLoading, error } = this.state;
		const { markets } = this.props;

		if (isLoading) {
			return <Spinner />;
		}

		if (error) {
			return <div>Error: {error}</div>;
		}

		if (!Array.isArray(markets)) {
			return <div>Error: invalid data format</div>;
		}

		return (
			<Container>
				<MarketsTable rows={markets} />
			</Container>
		);
	}

	async fetchMarketsData() {
		try {
			const marketResponse = await apiGetFetchMarkets(
				{},
				this.props.handleUnAuthorized
			);

			const tickersResponse = await apiGetFetchTickers(
				{},
				this.props.handleUnAuthorized
			);

			if (marketResponse.status !== 200) {
				throw new Error('Network response was not OK');
			}

			if (tickersResponse.status !== 200) {
				throw new Error('Network response was not OK');
			}

			const markets = marketResponse.data.result;
			const tickers = tickersResponse.data.result;

			const formattedMarkets = markets.map((market: any) => ({
				id: market.id,
				symbol: market.symbol,
				base: market.base,
				quote: market.quote,
				active: market.active,
				precision: market.precision.amount,
				price: tickers[market.symbol].last ?? 0,
				datetime: tickers[market.symbol].datetime,
				percentage: tickers[market.symbol].close && tickers[market.symbol].open
					? ((tickers[market.symbol].close - tickers[market.symbol].open) / tickers[market.symbol].open) * 100
					: 0,
			}));

			this.props.dispatch({ type: 'api.updateMarkets', payload: formattedMarkets });
		} catch (exception) {
			console.error(exception);
			this.setState({ error: (exception as Error).message });
			toast.error((exception as Error).message);
		}
	}
}

const MarketsBehavior = (props: any) => {
	const handleUnAuthorized = useHandleUnauthorized();
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search);
	const [searchParams] = useSearchParams();

	return (
		<MarketsStructure
			{...props}
			queryParams={queryParams}
			params={params}
			searchParams={searchParams}
			navigate={navigate}
			handleUnAuthorized={handleUnAuthorized}
		/>
	);
};

export const Markets = connect(mapStateToProps)(MarketsBehavior);

import { connect } from 'react-redux';
import { Base, BaseProps, BaseState } from 'components/base/Base';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { Spinner } from 'components/views/v1/spinner/Spinner';
import { MarketsTable } from 'components/views/v1/markets/MarketsTable';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {apiGetFetchMarkets} from 'model/service/api';

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

const mapStateToProps = (state: any) => ({
	markets: state.api.markets,
});

class MarketsStructure extends Base<MarketsProps, MarketsState> {
	static defaultProps: Partial<BaseProps> = {};

	recurrentIntervalId?: any;
	recurrentDelay: number = 30000;

	constructor(props: MarketsProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
		};
	}

	async componentDidMount() {
		console.log('componentDidMount', arguments);
		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		console.log('componentWillUnmount', arguments);
		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	async initialize() {
		try {
			// Fetch markets data and update the store
			await this.fetchMarketsData();
		} catch (error) {
			console.error('Initialization error:', error);
			this.setState({ error: (error as Error).message });
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async fetchMarketsData() {
		try {
			const response = await apiGetFetchMarkets(
				{},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				throw new Error('Network response was not OK');
			}

			const payload = response.data.result;

			const formattedMarkets = payload.map((market: any) => ({
				id: market.id,
				symbol: market.symbol,
				base: market.base,
				quote: market.quote,
				active: market.active,
				precision: market.precision.amount,
			}));

			this.props.dispatch({ type: 'api.updateMarkets', payload: formattedMarkets });
		} catch (exception: any) {
			console.error('Fetch markets data error:', exception);
			this.setState({ error: (exception as Error).message });
			toast.error((exception as Error).message);
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
		console.log('render', arguments);

		const { isLoading, error } = this.state;
		const { markets } = this.props;

		if (isLoading) {
			return <Spinner />;
		}

		if (error) {
			return <div>Error: {error}</div>;
		}

		if (!Array.isArray(markets)) {
			return <div>Error: Invalid data format</div>;
		}

		return (
			<MarketsTable rows={markets} />
		);
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

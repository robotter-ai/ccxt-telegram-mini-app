import { connect } from 'react-redux';
import axios from 'axios';
import { Base, BaseProps, BaseSnapshot, BaseState } from 'components/base/Base';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
import { executeAndSetInterval } from 'model/service/recurrent';
import { apiPostRun } from 'model/service/api';
import Spinner from 'components/views/spinner/Spinner';
import MarketsTable from 'components/views/markets/MarketsTable';
import { toast } from 'react-toastify';
import './Markets.css';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

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

interface MarketsSnapshot extends BaseSnapshot {}

const mapStateToProps = (state: any, props: any) => ({
	markets: state.api.markets,
});

class MarketsStructure extends Base<MarketsProps, MarketsState, MarketsSnapshot> {
	static defaultProps: Partial<BaseProps> = {};

	recurrentIntervalId?: number;
	recurrentDelay: number = 30000;

	constructor(props: MarketsProps) {
		super(props);

		this.state = {
			isLoading: true,
			error: null,
		};
	}

	async componentDidMount() {
		console.log('componentDidMount', arguments);
		await this.fetchData();
		this.recurrentIntervalId = executeAndSetInterval(this.fetchData.bind(this), this.recurrentDelay);
	}

	async componentWillUnmount() {
		console.log('componentWillUnmount', arguments);
		if (this.recurrentIntervalId) {
			clearInterval(this.recurrentIntervalId);
		}
	}

	async fetchData() {
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_markets',
					parameters: {},
				},
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
		} catch (exception) {
			console.error(exception);
			this.setState({ error: exception });
			toast.error(exception as string);
		} finally {
			this.setState({ isLoading: false });
		}
	}

	render() {
		console.log('render', arguments);

		const { isLoading, error } = this.state;
		const { markets } = this.props;

		if (isLoading) {
			return <Spinner />;
		}

		if (error) {
			return <div>Error: {error.message}</div>;
		}

		if (!Array.isArray(markets)) {
			return <div>Error: Invalid data format</div>;
		}

		return (
			<div>
				<MarketsTable rows={markets} />
			</div>
		);
	}
}

const MarketsBehavior = (props: any) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search);
	const [searchParams] = useSearchParams();
	const handleUnAuthorized = useHandleUnauthorized();

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

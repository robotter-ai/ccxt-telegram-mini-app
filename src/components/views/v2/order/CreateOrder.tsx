import {connect} from 'react-redux';
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import axios from 'axios';
import {Box, SelectChangeEvent, styled} from '@mui/material';
import {Map} from 'model/helper/extendable-immutable/map';
import {executeAndSetInterval} from 'model/service/recurrent';
import {dispatch} from 'model/state/redux/store';
import {apiPostRun} from 'model/service/api';
import {useHandleUnauthorized} from 'model/hooks/useHandleUnauthorized';
import {Base, BaseProps, BaseState} from 'components/base/Base';
import {Spinner} from 'components/views/v2/layout/spinner/Spinner';
import DropDownSelector from "components/general/DropdownSelector.tsx";
import {ChangeEvent} from "react";
import TextInput from "components/general/TextInput.tsx";
import Button, {ButtonType} from "components/general/Button.tsx";
import ButtonGroupToggle from "components/general/ButtonGroupToggle.tsx";
import {Market} from "api/types/markets.ts";
import {formatPrice} from "components/views/v2/utils/utils.tsx";

interface Props extends BaseProps {
	markets: Market[];
	data: any;
}

interface State extends BaseState {
	isLoading: boolean;
	error?: string;
	orderSide: 'Buy' | 'Sell';
	selectedMarket: string;
	selectedOrderType: string;
	amount: string;
	marketPrice: number;
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const mapStateToProps = (state: State | any, props: Props | any) => ({
	markets: state.api.markets,
	data: state.api.template.data,
});

// @ts-ignore
// noinspection JSUnusedLocalSymbols
const Style = styled(Box)(({theme}) => ({
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing(3),
}));

const TotalContainer = styled(Box)(({theme}) => ({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	padding: '0.5rem 1.5rem',
	marginTop: theme.spacing(2),
	fontWeight: 'bold',
}));

class Structure extends Base<Props, State> {

	properties: Map = new Map();

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			error: undefined,
			orderSide: 'Buy',
			selectedMarket: '',
			selectedOrderType: '',
			amount: '',
			marketPrice: 0,
		} as Readonly<State>;

		this.properties.setIn('recurrent.5s.intervalId', undefined);
		this.properties.setIn('recurrent.5s.delay', 5 * 1000);

		this.handleMarketChange = this.handleMarketChange.bind(this);
		this.handleOrderTypeChange = this.handleOrderTypeChange.bind(this);
		this.handleAmountChange = this.handleAmountChange.bind(this);
	}

	async componentDidMount() {
		await this.initialize();
		await this.doRecurrently();
	}

	async componentWillUnmount() {
		if (this.properties.getIn<number>('recurrent.5s.intervalId')) {
			clearInterval(this.properties.getIn<number>('recurrent.5s.intervalId'));
		}
	}

	handleMarketChange(event: SelectChangeEvent) {
		this.setState({selectedMarket: event.target.value});
		this.getTotalPrice(event.target.value);
	};

	handleOrderTypeChange(event: SelectChangeEvent) {
		this.setState({selectedOrderType: event.target.value});
	};

	handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
		this.setState({amount: event.target.value});
	}

	async getTotalPrice(marketId: string) {
		try {
			const response = await apiPostRun(
				{
					exchangeId: `${import.meta.env.VITE_EXCHANGE_ID}`,
					environment: `${import.meta.env.VITE_EXCHANGE_ENVIRONMENT}`,
					method: 'fetch_ticker',
					parameters: {
						symbol: marketId,
					},
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				if (response.data?.title) {
					const message = response.data.title;

					this.setState({error: message});
					toast.error(message);

					return;
				} else {
					throw new Error(response.text);
				}
			}

			const payload = response.data.result;

			this.setState({marketPrice: Number(payload.last)});
			return;
		} catch (exception) {
			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation';

			this.setState({error: message});
			toast.error(message);
		}
	};

	render() {
		const {isLoading, error, selectedMarket, selectedOrderType, amount} = this.state;
		const {markets} = this.props;

		const toggleButtons = [
			{label: 'Buy', onClick: () => this.setState({orderSide: 'Buy'})},
			{label: 'Sell', onClick: () => this.setState({orderSide: 'Sell'})},
		];

		const marketOptions = markets.map((market) => ({
			value: market.symbol,
			label: `${market.base}/${market.quote}`,
		}))

		const orderTypeOptions = [
			{value: 'market', label: 'Market'},
			{value: 'limit', label: 'Limit'},
		];

		return (
			<Style>
				{isLoading ? <Spinner/> : null}
				{error ? <div>Error: {error}</div> : null}
				<ButtonGroupToggle buttons={toggleButtons} defaultButton={0}/>
				<DropDownSelector
					label={'Market'}
					options={marketOptions}
					value={selectedMarket}
					onChange={this.handleMarketChange}
				/>
				<DropDownSelector
					label={'Order type'}
					options={orderTypeOptions}
					value={selectedOrderType}
					onChange={this.handleOrderTypeChange}
				/>
				<TextInput label={'Amount'} value={amount} onChange={this.handleAmountChange}/>
				<TotalContainer>
					<span>Total</span>
					<span>{formatPrice(Number(amount) * this.state.marketPrice)}</span>
				</TotalContainer>
				<Button value={this.state.orderSide} type={ButtonType.Full} onClick={() => {
					console.log('clicaram pra vender')
				}}/>
			</Style>
		);
	}

	async initialize() {
		try {
			const response = await apiPostRun(
				{
					method: 'fetch_tickers',
					parameters: {
						symbols: ['tSOLtUSDC', 'tBTCtUSDC'],
					},
				},
				this.props.handleUnAuthorized
			);

			if (response.status !== 200) {
				if (response.data?.title) {
					const message = response.data.title;

					this.setState({error: message});
					toast.error(message);

					return;
				} else {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(response.text);
				}
			}

			const payload = response.data.result;

			dispatch('api.updateTemplateData', payload);
		} catch (exception: any) {
			console.error(exception);

			if (axios.isAxiosError(exception)) {
				if (exception?.response?.status === 401) {
					return;
				}
			}

			const message = 'An error has occurred while performing this operation.'

			this.setState({error: message});
			toast.error(message);
		} finally {
			this.setState({isLoading: false});
		}
	}

	async doRecurrently() {
		const recurrentFunction = async () => {
			try {
				const response = await apiPostRun(
					{
						method: 'fetch_tickers',
						parameters: {
							symbols: ['tSOLtUSDC', 'tBTCtUSDC'],
						},
					},
					this.props.handleUnAuthorized
				);

				if (response.status !== 200) {
					if (response.data?.title) {
						const message = response.data.title;

						this.setState({error: message});
						toast.error(message);

						return;
					} else {
						// noinspection ExceptionCaughtLocallyJS
						throw new Error(response.text);
					}
				}

				const payload = response.data.result;

				dispatch('api.updateTemplateData', payload);
			} catch (exception) {
				console.error(exception);

				if (axios.isAxiosError(exception)) {
					if (exception?.response?.status === 401) {
						return;
					}
				}

				const message = 'An error has occurred while performing this operation.'

				this.setState({error: message});
				toast.error(message);

				clearInterval(this.properties.getIn<number>('recurrent.5s.intervalId'));
			}
		};

		// @ts-ignore
		this.properties.setIn(
			'recurrent.5s.intervalId',
			executeAndSetInterval(recurrentFunction, this.properties.getIn<number>('recurrent.5s.delay'))
		);
	}
}

const Behavior = (props: any) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search)
	const [searchParams] = useSearchParams();
	const handleUnAuthorized = useHandleUnauthorized();

	return <Structure
		{...props}
		location={location}
		navigate={navigate}
		params={params}
		queryParams={queryParams}
		searchParams={searchParams}
		handleUnAuthorized={handleUnAuthorized}
	/>;
};

// noinspection JSUnusedGlobalSymbols
export const CreateOrder = connect(mapStateToProps)(Behavior);

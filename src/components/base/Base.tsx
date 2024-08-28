import { Component } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useHandleUnauthorized } from 'model/hooks/useHandleUnauthorized';
// import { Component, ContextType } from 'react';
// import { AppContext } from 'model/contexts/AppContext.tsx';

export interface BaseProps {
	id?: any;
	className?: any;
	queryParams: any;
	params: any;
	searchParams: any;
	navigate: any;
	handleUnAuthorized: any;
}

export interface BaseState {
	isLoading: boolean,
	error?: string,
}

export class Base<BaseProps = any, BaseState = any> extends Component<BaseProps, BaseState> {

	// static contextType = AppContext;
	// declare context: ContextType<typeof AppContext>;

	// static defaultProps: Partial<BaseProps> = {
	// };

	// constructor(props: Props) {
	// 	super(props);
	//
	// 	this.state = {
	// 	} as Readonly<State>;
	// }

	// /**
	//  * @deprecated Use the constructor instead.
	//  */
	// componentWillMount() {
	// 	console.log('componentWillMount', arguments);
	// }

	// componentDidMount() {
	// 	console.log('componentDidMount', arguments);
	// }

	// // @ts-ignore
	// componentWillReceiveProps(nextProps: Readonly<BaseProps>, nextContext: any) {
	// 	console.log('componentWillReceiveProps', arguments);
	// }

	// // @ts-ignore
	// shouldComponentUpdate(nextProps: Readonly<BaseProps>, nextState: Readonly<BaseState>, nextContext: any): boolean {
	// 	console.log('shouldComponentUpdate', arguments);
	//
	// 	return true;
	// }

	// // @ts-ignore
	// componentWillUpdate(nextProps: Readonly<BaseProps>, nextState: Readonly<BaseState>, nextContext: any) {
	// 	console.log('componentWillUpdate', arguments);
	// }

	// // @ts-ignore
	// componentDidUpdate(prevProps: Readonly<BaseProps>, prevState: Readonly<BaseState>) {
	// 	console.log('componentDidUpdate', arguments);
	// }

	// componentWillUnmount() {
	// 	console.log('componentWillUnmount', arguments);
	// }

	// setState<K extends keyof Readonly<State>>(
	// 	state: ((prevState: Readonly<State>, props: Readonly<Props>) => Pick<State, K> | State | null) | (Pick<State, K> | State | null),
	// 	callback?: () => void,
	// ): void {
	// 	console.log('setState', arguments);
	//
	// 	return super.setState(state, callback);
	// }

	// render(): any {
	// 	console.log('render', arguments);
	//
	// 	return <></>;
	// }
}

export const withHooks = <P extends object>(TargetComponent: React.ComponentType<P>) => {
	return (props: P) => {
		const location = useLocation();
		const navigate = useNavigate();
		const params = useParams();
		const queryParams = new URLSearchParams(location.search);
		const [searchParams] = useSearchParams();
		const handleUnAuthorized = useHandleUnauthorized();

		// noinspection HtmlUnknownAttribute
		return (
			<TargetComponent
				{...props}
				location={location}
				navigate={navigate}
				params={params}
				queryParams={queryParams}
				searchParams={searchParams}
				handleUnAuthorized={handleUnAuthorized}
			/>
		);
	};
};

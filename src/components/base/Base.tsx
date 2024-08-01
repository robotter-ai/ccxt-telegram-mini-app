import { Component } from 'react';
// import { Component, ContextType } from 'react';
// import { AppContext } from 'model/contexts/AppContext.tsx';

export interface BaseProps {
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

export interface BaseSnapshot {
}

export class Base<Props = BaseProps, State = BaseState, Snapshot = BaseSnapshot> extends Component<Props, State, Snapshot> {

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
	// componentDidUpdate(prevProps: Readonly<BaseProps>, prevState: Readonly<BaseState>, snapshot?: BaseSnapshot) {
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

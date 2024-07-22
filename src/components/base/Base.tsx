import { Component } from 'react';
// import PropTypes from 'prop-types';

export interface BaseProps {
}

export interface BaseState {
}

export interface BaseSnapshot {
}

export class Base<BaseProps = any, BaseState = any, BaseSnapshot = any> extends Component<BaseProps, BaseState, BaseSnapshot> {

	// static contextTypes = {
	// 	handleUnAuthorized: PropTypes.func,
	// };
	//
	// static defaultProps: Partial<BaseProps> = {
	// };
	//
	// constructor(props: BaseProps) {
	// 	super(props);
	//
	// 	this.state = {
	// 	} as BaseState;
	// }
	//
	// /**
	//  * @deprecated Use the constructor instead.
	//  */
	componentWillMount() {
		console.log('componentWillMount', arguments);
	}

	componentDidMount() {
		console.log('componentDidMount', arguments);
	}

	// @ts-ignore
	componentWillReceiveProps(nextProps: Readonly<BaseProps>, nextContext: any) {
		console.log('componentWillReceiveProps', arguments);
	}

	// @ts-ignore
	shouldComponentUpdate(nextProps: Readonly<BaseProps>, nextState: Readonly<BaseState>, nextContext: any): boolean {
		console.log('shouldComponentUpdate', arguments);

		return true;
	}

	// @ts-ignore
	componentWillUpdate(nextProps: Readonly<BaseProps>, nextState: Readonly<BaseState>, nextContext: any) {
		console.log('componentWillUpdate', arguments);
	}

	// @ts-ignore
	componentDidUpdate(prevProps: Readonly<BaseProps>, prevState: Readonly<BaseState>, snapshot?: BaseSnapshot) {
		console.log('componentDidUpdate', arguments);
	}

	componentWillUnmount() {
		console.log('componentWillUnmount', arguments);
	}

	setState<K extends keyof BaseState>(
		state: ((prevState: Readonly<BaseState>, props: Readonly<BaseProps>) => Pick<BaseState, K> | BaseState | null) | (Pick<BaseState, K> | BaseState | null),
		callback?: () => void,
	): void {
		console.log('setState', arguments);

		return super.setState(state, callback);
	}

	render(): any {
		console.log('render', arguments);

		return <></>;
	}
}

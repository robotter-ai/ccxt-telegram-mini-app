/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars,@typescript-eslint/ban-ts-comment */
// noinspection JSUnusedGlobalSymbols

import { app } from 'model/storage/app';

const actionTypeApiStatuses = app.getIn('redux.actions.api.statuses');
const actionTypeApiSubActions = app.getIn('redux.actions.api.subActions');
const actionTypes = app.getIn('redux.actions.types');
const actionCreators = app.getIn('redux.actions.creators');
const actionBounds = app.getIn('redux.actions.bounds');
const reducers = app.getIn('redux.reducers');
const reduxStore = app.getIn('redux.store');

export function split(input: any) {
	return input.split('.');
}

export function pushActionTypeApiStatus(status: any) {
	actionTypeApiStatuses.setIn(status, status);
}

export function pushActionTypeApiSubAction(subAction: any) {
	actionTypeApiSubActions.setIn(subAction, subAction);
}

export function pushActionType(actionType: any) {
	actionTypes.setIn(actionType, actionType);
}

export function buildActionCreator(actionType: any) {
	return (payload: any) => ({
		type: actionType,
		payload
	});
}

export function pushActionCreator(actionType: any, actionCreator: any) {
	actionCreators.setIn(actionTypes.getIn(actionType), actionCreator);
}

export function buildActionBound(actionCreator: any) {
	return (payload: any) => {
		reduxStore.dispatch(actionCreator(payload));
	};
}

export function pushActionBound(actionType: any, actionBound: any) {
	actionBounds.setIn(actionTypes.getIn(actionType), actionBound);
}

export function buildReducer(actionType: any, preReducer: any) {
	// noinspection JSUnusedLocalSymbols
	return (currentState: any, {
		// @ts-ignore
		type = actionType,
		// @ts-ignore
		payload
	}) => {
		return preReducer(currentState, payload);
	};
}

export function pushReducer(actionType: any, reducer: any) {
	reducers.setIn(actionTypes.getIn(actionType), reducer);
}

export function pushStack(actionType: any, preReducer: any) {
	const actionCreator = buildActionCreator(actionType);
	const actionBound = buildActionBound(actionCreator);
	const reducer = buildReducer(actionType, preReducer);

	pushActionType(actionType);
	pushActionCreator(actionType, actionCreator);
	pushActionBound(actionType, actionBound);
	pushReducer(actionType, reducer);
}

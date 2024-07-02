import { pushStack } from 'model/state/redux/stack/methods';
import { Map } from 'model/helper/extendable-immutable/map';

pushStack('api.updateToken', (currentState, payload) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.token',
			payload
		);
	}

	nextState = nextState.toJS();

	return nextState;
});

pushStack('api.updateStatus', (currentState, payload) => {
	let nextState = new Map(currentState);

	if (payload) {
		nextState = nextState.setIn(
			'api.status',
			payload
		);
	}

	nextState = nextState.toJS();

	return nextState;
});

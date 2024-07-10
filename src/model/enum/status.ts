/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BaseEnum } from 'model/enum/base_enum.ts';

import { List } from 'model/helper/extendable-immutable/list';

/**
 *
 */
export class Status extends BaseEnum {
	static stopped = new Status('stopped', 'Stopped', 'Stopped.', 'stopped');
	static starting = new Status(
		'starting',
		'Starting',
		'Starting...',
		'starting',
	);
	static idle = new Status('idle', 'Idle', 'Idle', 'idle');
	static running = new Status('running', 'Running', 'Running...', 'running');
	static stopping = new Status(
		'stopping',
		'Stopping',
		'Stopping...',
		'stopping',
	);
	static unknown = new Status(
		'unknown',
		'Unknown',
		'Unknown',
		'unknown',
	);

	static list = new List([
		Status.stopped,
		Status.starting,
		Status.idle,
		Status.running,
		Status.stopping,
		Status.unknown,
	]);

	id: string;

	title: string;

	message: string;

	value: unknown;

	/**
	 *
	 * @param id
	 * @param title
	 * @param message
	 * @param value
	 */
	constructor(id: string, title: string, message: string, value: unknown) {
		super();

		this.id = id;
		this.title = title;
		this.message = message;
		this.value = value;
	}

	/**
	 *
	 * @param id
	 */
	static getById(id: string) {
		if (!id) {
			return Status.unknown;
		}

		// @ts-ignore
		return Status.list.find((item: Status) => item.id === id);
	}
}

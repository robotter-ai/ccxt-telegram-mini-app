/**
 * Base component.
 * All components should extend this component.
 */
import React from 'react'
import PropTypes from 'prop-types'

/**
 *
 */
export class Base extends React.Component {

	/**
	*
	*/
	constructor(props) {
	  super(props)

	  this.state = {
	  }
	}

	/**
	 *
	 */
	componentWillMount() {
	  super.componentWillMount(arguments)
	}

	/**
	 *
	 */
	componentDidMount() {
	super.componentDidMount(arguments)
	}

	/**
	 *
	 */
	componentWillReceiveProps(nextProps) {
		super.componentWillReceiveProps(nextProps)
	}

	/**
	 *
	 */
	shouldComponentUpdate(nextProps, nextState) {
		super.shouldComponentUpdate(nextProps, nextState)
	}

	/**
	 *
	 */
	componentWillUpdate(nextProps, nextState) {
		super.componentWillUpdate(nextProps, nextState)
	}

	/**
	 *
	 */
	componentDidUpdate(prevProps, prevState) {
		super.componentDidUpdate(prevProps, prevState)
	}

	/**
	 *
	 */
	componentWillUnmount() {
		super.componentWillUnmount(arguments)
	}

	/**
	 *
	 */
	setState(updater, [callback]) {
		super.setState(updater, [callback])
	}

	/**
	 *
	 */
	forceUpdate() {
		super.forceUpdate(arguments)
	}

	render() {
		return null
	}
}

/**
 *
 */
Base.defaultProps = {
}

/**
 *
 * @type {{router}}
 */
Base.contextTypes = {
	router: PropTypes.object
}

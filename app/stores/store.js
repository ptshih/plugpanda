/**
 * The Data Store
 *
 * Principles borrowed from Redux
 * http://redux.js.org/docs/introduction/ThreePrinciples.html
 *
 * 1. Single source of truth - The state of your whole application is stored in an object tree within a single store.
 * 2. State is read-only - The only way to mutate the state is to emit an action, an object describing what happened.
 * 3. Changes are made with pure functions - To specify how the state tree is transformed by actions, you write pure reducers.
 *
 * This is a singleton
 */

import _ from 'lodash';
import Dispatcher from '../dispatcher/dispatcher';
import {EventEmitter} from 'events';

class Store extends EventEmitter {
  defaults() {
    return {
      account: {
        fetched: false,
        error: null,
        data: {},
      },
      car: {
        fetched: false,
        error: null,
        data: {},
      },
      sessions: {
        fetched: false,
        error: null,
        data: [],
      },
      session: {
        fetched: false,
        error: null,
        data: {},
      },
    };
  }

  constructor() {
    super();

    // Reset State
    this.resetState();

    // Register Dispatch Handler
    this.dispatchToken = Dispatcher.register(this._dispatchHandler.bind(this));
  }

  /**
   * Registers a listener to state change events
   */
  subscribe(listener) {
    this.on('change', listener);
  }

  /**
   * Deregisters a listener to state change events
   */
  unsubscribe(listener) {
    this.removeListener('change', listener);
  }

  /**
   * Used by Components to retrieve state
   * @param {String} [property] Optionally only return a portion of the State
   * @return {Object} Current state or portion thereof
   */
  getState(property) {
    if (_.isString(property) && !_.isEmpty(property)) {
      return this.state[property];
    }

    return this.state;
  }

  /**
   * Reset Store back to default state
   */
  resetState() {
    this.state = this.defaults();
  }

  /**
   * Dispatch Wrapper
   * @param {Object} action Describes how the state should change
   * @param {String} action.type What type of change
   * @param {Object} [action.data] What is actually changing
   */
  dispatch(action) {
    Dispatcher.dispatch(action);
  }

  /**
   * Dispatch Action Handler
   * @param {Object} action Describes how the state should change
   * @param {String} action.type What type of change
   * @param {Object} [action.data] What is actually changing
   */
  _dispatchHandler(action) {
    if (!action.type) {
      return;
    }

    console.log('DISPATCH ACTION -> %s DATA -> %s', action.type, action.data);

    // Assign reducer function for action type
    let reducer;
    const oldState = this.state;
    const newState = {};

    switch (action.type) {
      case 'RESET':
        reducer = this._set;
        newState[action.data] = this.defaults()[action.data];
        break;
      case 'FETCH':
        reducer = this._set;
        _.assign(newState, action.data);
        break;

      default:
        // Unknown action, don't emit any changes
        break;
    }

    // If a reducer is defined...
    // Replace existing state with reduced state and emit change
    if (reducer) {
      this.state = reducer.call(this, oldState, newState);
      this.emit('change');
    }
  }

  // Reducers

  /**
   * Generic `set` reducer that object assigns existing state with a new state
   * @param {Object} oldState
   * @param {Object} newState
   */
  _set(oldState, newState) {
    return _.assign({}, oldState, newState);
  }
}

export default new Store();

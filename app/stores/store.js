import _ from 'lodash';
import Dispatcher from '../dispatcher/dispatcher';
import {EventEmitter} from 'events';

// The Data Store
//
// Principles borrowed from Redux
// http://redux.js.org/docs/introduction/ThreePrinciples.html
//
// 1. Single source of truth - The state of your whole application is stored in an object tree within a single store.
// 2. State is read-only - The only way to mutate the state is to emit an action, an object describing what happened.
// 3. Changes are made with pure functions - To specify how the state tree is transformed by actions, you write pure reducers.

// Store
class Store extends EventEmitter {
  // State Defaults
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

  // Constructor
  constructor() {
    super();

    // Reset State
    this.resetState();

    // Register Dispatch Handler
    this.dispatchToken = Dispatcher.register(this._dispatchHandler.bind(this));
  }

  addChangeListener(callback) {
    this.on('change', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }

  // Used by Components to retrieve state
  // @param {String} [property]
  getState(property) {
    if (_.isString(property) && !_.isEmpty(property)) {
      return this.state[property];
    }

    return this.state;
  }

  // Reset Store back to default state
  resetState() {
    this.state = this.defaults();
  }

  /**
   * Dispatch Wrapper
   *
   * @param {Object} action
   * @param {String} action.type
   * @param {Object} [action.data]
   */
  dispatch(action) {
    Dispatcher.dispatch(action);
  }

  // Dispatch Action Handler
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

  // Generic `set` reducer that object assigns existing state with a new state
  _set(oldState, newState) {
    return _.assign({}, oldState, newState);
  }
}

// EXPORT
export default new Store();

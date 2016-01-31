/**
 * The Application Data Store
 *
 * This is a singleton
 *
 * See README for more information
 */

import _ from 'lodash';
import Dispatcher from '../dispatcher/dispatcher';
import {EventEmitter} from 'events';

class Store extends EventEmitter {
  defaults() {
    return {
      account: {
        // TBD
      },
      car: {
        position: {},
        // TBD
      },
      sessions: [],
      session: {
        average_power: 0,
        energy_kwh: 0,
        miles_added: 0,
        total_amount: 0,
        lat: 0,
        lon: 0,
        update_data: [],
        // TBD
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
   * @return {Object} Current state or portion thereof
   */
  getState() {
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
      case 'SET':
        reducer = this._set;
        _.merge(newState, action.data);
        break;

      case 'APPEND':
        reducer = this._append;
        _.merge(newState, action.data);
        break;

      default:
        // Unknown action, don't emit any changes
        break;
    }

    // If a reducer is assigned...
    // Replace existing state with reduced state and emit change
    if (reducer) {
      this.state = reducer.call(this, oldState, newState);
      this.emit('change');
    }
  }

  // Action Handlers

  /**
   * Object assigns existing state with a new state
   * @param {Object} oldState
   * @param {Object} newState
   */
  _set(oldState, newState) {
    return Object.assign({}, oldState, newState);
  }

  /**
   * Appends more items to an array
   * @param  {[type]} oldState [description]
   * @param  {[type]} data     [description]
   * @return {[type]}          [description]
   */
  _append(oldState, data) {
    const newState = {};
    _.forEach(data, (val, key) => {
      newState[key] = [...oldState[key], ...val];
    });

    return Object.assign({}, oldState, newState);
  }
}

export default new Store();

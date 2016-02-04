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
      waitlist: {},
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
   * @return {Object} Current state
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
   *
   * DO NOT ever mutate `this.state`, ALWAYS return a copy
   *
   * @param {Object} action Describes how the state should change
   * @param {String} action.type What type of change
   * @param {Object} [action.data] What is actually changing
   */
  _dispatchHandler(action) {
    if (!action.type) {
      return;
    }

    console.log('DISPATCH ACTION -> %s DATA -> %s', action.type, action.data);

    let shouldEmit = true;
    switch (action.type) {
      case 'RESET_ACCOUNT':
        this.state.account = this.defaults().account;
        break;
      case 'SET_ACCOUNT':
        this.state.account = _.assign({}, this.state.account, action.data);
        break;

      case 'RESET_WAITLIST':
        this.state.waitlist = this.defaults().waitlist;
        break;
      case 'SET_WAITLIST':
        this.state.waitlist = _.assign({}, this.state.waitlist, action.data);
        break;

      case 'RESET_CAR':
        this.state.car = this.defaults().car;
        break;
      case 'SET_CAR':
        this.state.car = _.assign({}, this.state.car, action.data);
        break;

      case 'RESET_SESSION':
        this.state.session = this.defaults().session;
        break;
      case 'SET_SESSION':
        this.state.session = _.assign({}, this.state.session, action.data);
        break;

      case 'RESET_SESSIONS':
        this.state.sessions = this.defaults().sessions;
        break;
      case 'SET_SESSIONS':
        this.state.sessions = [...action.data];
        break;
      case 'APPEND_SESSIONS':
        this.state.sessions = [...this.state.sessions, ...action.data];
        break;
      case 'PREPEND_SESSIONS':
        this.state.sessions = [...action.data, ...this.state.sessions];
        break;

      default:
        // Unknown action, don't emit any changes
        shouldEmit = false;
        break;
    }

    if (shouldEmit) {
      this.emit('change');
    }
  }
}

export default new Store();

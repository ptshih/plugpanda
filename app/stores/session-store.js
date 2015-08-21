/**
 * This Store contains data for Session.
 */

import _ from 'lodash';
import Dispatcher from '../dispatcher/dispatcher';
import {EventEmitter} from 'events';
import Immutable from 'immutable';

// State Defaults
const _defaults = {
};

// Store
class Store extends EventEmitter {
  // Constructor
  constructor() {
    super();

    // Instance Properties
    this.idAttribute = 'id';
    this.state = Immutable.fromJS({});

    // Register Dispatch Handler
    this.dispatchToken = Dispatcher.register(this.dispatchHandler.bind(this));

    // Reset State
    this.resetState();
  }

  // Used by Components to retrieve state
  getState() {
    const state = this.state.toJS();
    return state;
  }

  // Used by Store to set state
  // Careful not to use this outside of Store
  setState(data) {
    // Merge rest of properties of state
    this.state = this.state.mergeDeep(data);

    return this.state;
  }

  // Reset Store back to default state
  resetState() {
    this.state = Immutable.fromJS(_.merge({}, _defaults));
    return this.state;
  }

  // Dispatch Action Handler
  dispatchHandler(action) {
    if (action.store !== 'session') {
      return;
    }

    const type = action.type;
    const data = action.data;

    switch (type) {
      case 'RESET':
        this.resetState();
        break;
      case 'SYNC':
        this.setState(data.state);
        break;
      default:
        return;
    }
  }

  emitChange() {
    // Any time the Store changes, save down to localstorage
    this.setStateToLocalStorage(this.state.get(this.idAttribute));

    this.emit('change');
  }

  addChangeListener(callback) {
    this.on('change', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }
}

// EXPORT
export default new Store();

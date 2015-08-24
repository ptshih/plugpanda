import _ from 'lodash';
import Dispatcher from '../dispatcher/dispatcher';
import {EventEmitter} from 'events';

// Store
class Store extends EventEmitter {
  // State Defaults
  defaults() {
    return {};
  }

  // Constructor
  constructor() {
    super();

    // Instance Properties
    this.storeName = '';
    this.idAttribute = 'id';

    // Reset State
    this.resetState();

    // Register Dispatch Handler
    this.dispatchToken = Dispatcher.register(this.dispatchHandler.bind(this));
  }

  // Used by Components to retrieve state
  getState() {
    return this.state;
  }

  // Used by Store to set state
  // Careful not to use this outside of Store
  setState(state) {
    this.state = _.extend({}, this.state, state);
    return this.state;
  }

  // Reset Store back to default state
  resetState() {
    this.state = this.defaults();
  }

  // Emit change to re-render view
  emitChange() {
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
export default Store;

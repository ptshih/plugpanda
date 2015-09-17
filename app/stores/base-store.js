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
    this.state = _.merge({}, this.state, state);
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

  // Dispatch Action Handler
  dispatchHandler(action) {
    if (action.store !== this.storeName) {
      return;
    }

    let shouldEmit = true;
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
        shouldEmit = false;
        break;
    }

    // Emit change after an action is handled
    if (shouldEmit) {
      console.log('ACTION: %s -> TYPE: %s', action.store, action.type);
      this.emitChange();
    }
  }
}

// EXPORT
export default Store;

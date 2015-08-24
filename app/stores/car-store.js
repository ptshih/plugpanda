/**
 * This Store contains data for Car.
 */

import _ from 'lodash';
import BaseStore from './base-store';

// Store
class CarStore extends BaseStore {
  defaults() {
    return {};
  }

  // Constructor
  constructor() {
    super();

    this.storeName = 'car';
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
export default CarStore;

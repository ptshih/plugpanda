/**
 * This Store contains data for Car.
 */

import _ from 'lodash';
import BaseStore from './base-store';

// Store
class CarStore extends BaseStore {
  defaults() {
    return {
      position: {},
    };
  }

  // Constructor
  constructor() {
    super();

    this.storeName = 'car';
  }
}

// EXPORT
export default CarStore;

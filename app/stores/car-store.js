/**
 * This Store contains data for Car.
 */

// import _ from 'lodash';
import BaseStore from './base-store';

// Store
class CarStore extends BaseStore {
  defaults() {
    return {
      fetched: false,
      error: null,

      position: {
        lat: 37.7833,
        lon: -122.4167,
        heading: 0,
        status: 'OK',
      },
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

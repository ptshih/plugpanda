/**
 * This Store contains data for Car.
 */

// import _ from 'lodash';
import BaseStore from './base-store';

// Store
class HistoryStore extends BaseStore {
  defaults() {
    return {
      fetched: false,

      sessions: [],
    };
  }

  // Constructor
  constructor() {
    super();

    this.storeName = 'history';
  }
}

// EXPORT
export default HistoryStore;

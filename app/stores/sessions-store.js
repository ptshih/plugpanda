/**
 * This Store contains data for Car.
 */

// import _ from 'lodash';
import BaseStore from './base-store';

// Store
class SessionsStore extends BaseStore {
  defaults() {
    return {
      fetched: false,
      error: null,

      sessions: [],
    };
  }

  // Constructor
  constructor() {
    super();

    this.storeName = 'sessions';
  }
}

// EXPORT
export default SessionsStore;

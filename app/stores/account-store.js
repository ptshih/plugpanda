/**
 * This Store contains data for Car.
 */

import _ from 'lodash';
import BaseStore from './base-store';

// Store
class AccountStore extends BaseStore {
  defaults() {
    return {
      stripe: {},
      bmw: {},
      chargepoint: {},
    };
  }

  // Constructor
  constructor() {
    super();

    this.storeName = 'account';
  }
}

// EXPORT
export default AccountStore;

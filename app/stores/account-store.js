/**
 * This Store contains data for Car.
 */

import _ from 'lodash';
import BaseStore from './base-store';
import api from '../lib/api';
import localStorage from '../lib/local-storage';

// Store
class AccountStore extends BaseStore {
  defaults() {
    return {
      _id: null,
      access_token: null,

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

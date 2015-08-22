/**
 * All Actions for Car
 */

import Dispatcher from '../dispatcher/dispatcher';
// import api from '../lib/api';

const Actions = {
  /**
   * Dispatch Wrapper
   *
   * @param {String} type
   * @param {Object} data
   */

  dispatch(type = 'UNKNOWN', data = {}) {
    // DEBUG
    console.log('DISPATCH: %s -> TYPE: %s', 'car', type);

    Dispatcher.dispatch({
      store: 'car',
      type: type,
      data: data,
    });
  },

  reset() {
    this.dispatch('RESET');
  },

  sync(state) {
    this.dispatch('SYNC', {
      state: state,
    });
  },

  changeType(type) {
    this.dispatch('CHANGE_TYPE', {
      type: type,
    });
  },

};

export default Actions;

import Dispatcher from '../dispatcher/dispatcher';

const Actions = {
  /**
   * Dispatch Wrapper
   *
   * @param {String} type
   * @param {Object} data
   */
  dispatch(type = 'UNKNOWN', data = {}) {
    // DEBUG
    console.log('DISPATCH: %s -> TYPE: %s', 'sessions', type);

    Dispatcher.dispatch({
      store: 'sessions',
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
};

export default Actions;

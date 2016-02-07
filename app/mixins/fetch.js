/**
 * This mixin helps with fetching data from a remote data source
 * Also helps with loading, error handling, and pagination
 *
 * UNUSED - 2016-01-08
 */

import _ from 'lodash';

export default {
  isFetching: true,
  error: null,
  offset: 0,
  limit: 10,

  componentDidMount() {
    this._fetch();
  },

  componentDidUpdate(prevProps) {
    // Only re-fetch if props changed
    if (!_.isEqual(prevProps.params, this.props.params)) {
      this._fetch();
    }
  },

  componentWillUnmount() {
    // Reset when the component unmounts
    this._reset();
  },

  _fetch() {
    if (_.isFunction(this.fetch)) {
      this.isFetching = true;
      this.error = null;

      this.fetch();
    }
  },

  _reset() {
    if (_.isFunction(this.reset)) {
      this.isFetching = true;
      this.error = null;
      this.offset = 0;

      this.reset();
    }
  },
};

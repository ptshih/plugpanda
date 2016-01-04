/**
 * This mixin helps fetching data from a remote data source
 */

import _ from 'lodash';

export default {
  componentDidMount() {
    if (!_.isFunction(this.fetch)) {
      return;
    }

    this.fetch();
  },

  componentDidUpdate(prevProps) {
    if (!_.isFunction(this.fetch) || _.isEqual(prevProps.params, this.props.params)) {
      return;
    }

    this.fetch();
  },

  componentWillUnmount() {
    if (!_.isFunction(this.reset)) {
      return;
    }

    this.reset();
  },
};

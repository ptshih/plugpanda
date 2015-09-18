import _ from 'lodash';
import NProgress from 'nprogress';

export default {
  componentDidMount() {
    this._fetch();
  },

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.params, this.props.params)) {
      this._fetch();
    }
  },

  componentWillUnmount() {
    this._reset();
  },

  _fetch() {
    if (_.isFunction(this.fetch)) {
      NProgress.start();
      this.fetch().then(() => {
        NProgress.done();
      });
    }
  },

  _reset() {
    if (_.isFunction(this.reset)) {
      this.reset();
    }
  },
};

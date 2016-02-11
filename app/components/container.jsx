/**
 * Create a Container Component using Composition
 *
 * This Container also handles:
 * - loading component
 * - error component
 * - navigation component
 *
 * Higher-Order Component
 * A higher-order component is just a function that takes an existing component and returns another component that wraps it.
 *
 * https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750#.ozcegw72n
 * http://stackoverflow.com/questions/30845561/how-to-solve-this-using-composition-instead-of-mixins-in-react
 */

import _ from 'lodash';
import React from 'react';

// Utils
import api from '../lib/api';

// Store
import store from '../stores/store';

// Components
import Loading from './loading';
import Err from './err';

export default (Component, options) => {
  return React.createClass({
    displayName: 'Container',

    propTypes: {
      params: React.PropTypes.object,
      location: React.PropTypes.object,
    },

    getInitialState() {
      return store.getState();
    },

    // Lifecycle

    componentWillMount() {
      // this.offset = _.parseInt(_.get(this.props, 'location.query.offset', 0));
      // this.limit = _.parseInt(_.get(this.props, 'location.query.limit', 10));
    },

    componentDidMount() {
      store.subscribe(this.onChange);

      store.dispatch({
        type: 'NAV_TITLE',
        data: options.title,
      });

      // Fetch from remote
      this.fetch();
    },

    componentWillUnmount() {
      store.dispatch({
        type: 'NAV_TITLE',
      });

      store.unsubscribe(this.onChange);
    },

    // Handlers

    onChange() {
      this.setState(store.getState());
    },

    // Render

    render() {
      let content;

      if (this.state.error) {
        // Error
        const params = {
          message: this.state.error.message,
        };
        content = <Err {...this.props} params={params} />;
      } else if (this.state.loading) {
        // Fetching
        content = <Loading {...this.props} />;
      } else {
        // Fetched
        content = (
          <Component
            {...this.props}
            {...this.state}
            fetch={this.fetch}
          />
        );
      }

      return content;
    },

    // Methods

    fetch(append = false) {
      // Reset error
      store.dispatch({
        type: 'APP_ERROR',
        data: null,
      });

      // Don't fetch if nothing to fetch
      if (!_.isString(options.fetchHandler) || !_.isString(options.storeKey)) {
        return;
      }

      // Start loading
      store.dispatch({
        type: 'NAV_LOADING',
        data: true,
      });

      // Add API params to arguments
      const args = [{}];
      _.forEach(options.fetchParams, (fetchParam) => {
        const fetchParamValue = _.get(this.props.params, fetchParam);
        if (fetchParamValue) {
          args.push(fetchParamValue);
        }
      });

      // Fetch data from API
      api[options.fetchHandler].apply(api, args).then((data) => {
        // SET or APPEND API response
        const type = [append ? 'APPEND' : 'SET', options.storeKey].join('_').toUpperCase();
        store.dispatch({
          type: type,
          data: data,
        });
      }).catch((err) => {
        // Catch API error
        store.dispatch({
          type: 'APP_ERROR',
          data: err,
        });
      }).finally(() => {
        // Stop loading
        store.dispatch({
          type: 'NAV_LOADING',
          data: false,
        });
      });
    },
  });
};

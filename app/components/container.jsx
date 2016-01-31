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
import Nav from './nav';
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
      this.isFetched = false;
      this.error = null;
      // this.offset = _.parseInt(_.get(this.props, 'location.query.offset', 0));
      // this.limit = _.parseInt(_.get(this.props, 'location.query.limit', 10));

      if (!_.isString(options.fetchHandler) || !_.isString(options.storeKey)) {
        this.isFetched = true;
      }
    },

    componentDidMount() {
      store.subscribe(this.onChange);

      // Fetch from remote and set in store if not already fetched
      if (!this.isFetched) {
        this.fetch();
      }
    },

    componentWillUnmount() {
      store.unsubscribe(this.onChange);
    },

    // Handlers

    onChange() {
      this.setState(store.getState());
    },

    // Render

    render() {
      let content;

      if (this.error) {
        // Error
        const params = {
          message: this.error.message,
        };
        content = <Err {...this.props} params={params} />;
      } else if (!this.isFetched) {
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

      return (
        <div className="Component">
          <Nav
            {...this.props}
            title={options.title}
            loading={!this.isFetched}
          />
          <main className="Content">
            {content}
          </main>
        </div>
      );
    },

    // Methods

    fetch(append = false) {
      this.isFetched = false;
      this.error = null;

      // Build API arguments
      const args = [{}];

      // Add API params to arguments
      _.forEach(options.fetchParams, (fetchParam) => {
        const fetchParamValue = _.get(this.props.params, fetchParam);
        if (fetchParamValue) {
          args.push(fetchParamValue);
        }
      });

      // Fetch data from API
      return api[options.fetchHandler].apply(api, args).finally(() => {
        this.isFetched = true;
      }).then((resp) => {
        // SET or APPEND API response
        const data = {};
        data[options.storeKey] = resp;
        store.dispatch({
          type: append ? 'APPEND' : 'SET',
          data: data,
        });
      }).catch((err) => {
        // Catch API error
        this.error = err;
      });
    },
  });
};

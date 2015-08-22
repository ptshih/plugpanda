import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';

// Store and Actions
import HistoryStore from '../stores/car-store';
import HistoryActions from '../actions/car-actions';

// Components
// import {Link} from 'react-router';

export default React.createClass({
  displayName: 'History',

  statics: {
    // willTransitionTo(transition, params, query, callback) {
    //   // transition.redirect('root');
    //   callback();
    // },

    fetch(params, query) {
      return api.fetchHistory().then((state) => {
        HistoryActions.sync(state);
      });
    },
  },

  getInitialState() {
    return HistoryStore.getState();
  },

  componentDidMount() {
    HistoryStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    HistoryStore.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(HistoryStore.getState());
  },

  // Render

  render() {
    return (
      <div className="History">
        <h2>History</h2>
      </div>
    );
  },
});

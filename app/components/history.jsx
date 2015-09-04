import _ from 'lodash';
import React from 'react';

// Utils
import auth from '../lib/auth';
import api from '../lib/api';
import math from '../lib/math';

// Store and Actions
import HistoryStore from '../stores/history-store';
import HistoryActions from '../actions/history-actions';
const historyStore = new HistoryStore();

// Components
import SessionCell from './session-cell';

export default React.createClass({
  displayName: 'History',

  statics: {
    fetch() {
      return api.fetchHistory().then((sessions) => {
        HistoryActions.sync({
          sessions: sessions,
        });
      });
    },

    willTransitionTo(transition) {
      if (!auth.isLoggedIn()) {
        transition.redirect('/login');
      }
    },
  },

  getInitialState() {
    return historyStore.getState();
  },

  componentDidMount() {
    historyStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    historyStore.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(historyStore.getState());
  },

  // Render

  getSessionCells(session, idx) {
    // Can't pass `update_data` into `SessionCell`
    // Due to a Safari/WebKit memory issue
    // Too many HTML properties or something
    // https://bugs.webkit.org/show_bug.cgi?id=80797
    const sessionProps = _.omit(session, 'update_data');

    return <SessionCell key={idx} session={sessionProps} />;
  },

  getSessionList() {
    const sessions = this.state.sessions;

    return (
      <ul className="SessionList">

      </ul>
    );
  },

  render() {
    return (
      <article>
        <section>
          <div className="row">
            <div className="col-xs-12">
              {this.getSessionList()}
            </div>
          </div>
        </section>
      </article>
    );
  },
});

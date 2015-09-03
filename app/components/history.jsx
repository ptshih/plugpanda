import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';

// Store and Actions
import HistoryStore from '../stores/car-store';
import HistoryActions from '../actions/car-actions';
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
    return <SessionCell key={idx} session={session} />;
  },

  getSessionList() {
    const sessions = this.state.sessions;

    return (
      <ul className="SessionList">
        {sessions.map(this.getSessionCells)}
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

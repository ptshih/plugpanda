import React from 'react';

// Utils
import api from '../lib/api';

// Store and Actions
import HistoryStore from '../stores/history-store';
import HistoryActions from '../actions/history-actions';
const historyStore = new HistoryStore();

// Components
import Nav from './nav';
import SessionCell from './session-cell';

// Mixins
import Fetch from '../mixins/fetch';

export default React.createClass({
  displayName: 'History',

  propTypes: {
    params: React.PropTypes.object,
  },

  mixins: [Fetch],

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

  getContent() {
    if (!this.state.fetched) {
      return null;
    }

    return (
      <main className="Content">
        <section>
          <div className="row">
            <div className="col-xs-12">
              {this.getSessionList()}
            </div>
          </div>
        </section>
      </main>
    );
  },

  render() {
    return (
      <div className="Component">
        <Nav title="History" />
        {this.getContent()}
      </div>
    );
  },

  fetch() {
    return api.fetchHistory().then((state) => {
      HistoryActions.sync({
        fetched: true,
        sessions: state,
      });
    });
  },

  reset() {
    HistoryActions.reset();
  },
});

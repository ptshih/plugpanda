import React from 'react';

// Utils
import api from '../lib/api';

// Store and Actions
import SessionsStore from '../stores/sessions-store';
import SessionsActions from '../actions/sessions-actions';
const sessionsStore = new SessionsStore();

// Components
import Nav from './nav';
import SessionCell from './session-cell';

// Mixins
import Fetch from '../mixins/fetch';

export default React.createClass({
  displayName: 'Sessions',

  propTypes: {
    params: React.PropTypes.object,
  },

  mixins: [Fetch],

  getInitialState() {
    return sessionsStore.getState();
  },

  componentDidMount() {
    sessionsStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    sessionsStore.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(sessionsStore.getState());
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
        <Nav title="Sessions" loading={!this.state.fetched} />
        {this.getContent()}
      </div>
    );
  },

  fetch() {
    return api.fetchSessions().then((state) => {
      SessionsActions.sync({
        fetched: true,
        sessions: state,
      });
    });
  },

  reset() {
    SessionsActions.reset();
  },
});

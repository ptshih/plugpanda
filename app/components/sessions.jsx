import React from 'react';

// Utils
import api from '../lib/api';

// Store
import Store from '../stores/store';

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
    return Store.getState('sessions');
  },

  // Lifecycle

  componentDidMount() {
    Store.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    Store.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(Store.getState('sessions'));
  },

  // Render

  getSessionCells(session, idx) {
    return <SessionCell key={idx} session={session} />;
  },

  getSessionList() {
    const sessions = this.state.data;

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

  // Fetch

  fetch() {
    return api.fetchSessions().then((data) => {
      Store.dispatch({
        type: 'FETCH',
        property: 'sessions',
        state: {
          fetched: true,
          error: null,
          data: data,
        },
      });
    }).catch((err) => {
      Store.dispatch({
        type: 'FETCH',
        property: 'sessions',
        state: {
          fetched: true,
          error: err.message,
          data: [],
        },
      });
    });
  },

  reset() {
    Store.dispatch({
      type: 'RESET',
      property: 'sessions',
    });
  },
});

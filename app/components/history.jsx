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
    // Need to move calculation here
    // Because can't pass `update_data` into `SessionCell`
    // due to a Safari memory issue
    const totalPower = _.reduce(session.update_data, (total, dataPoint) => {
      return total + dataPoint.power_kw;
    }, 0);
    const totalPoints = _.reduce(session.update_data, (total, dataPoint) => {
      if (dataPoint.power_kw === 0) {
        return total;
      }
      return total + 1;
    }, 0);
    const sessionProps = _.omit(session, 'update_data');
    sessionProps.average_power = math.round(totalPower / totalPoints, 3);

    return <SessionCell key={idx} session={sessionProps} />;
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

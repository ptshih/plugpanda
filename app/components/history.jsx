import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';
import math from '../lib/math';

// Store and Actions
import HistoryStore from '../stores/car-store';
import HistoryActions from '../actions/car-actions';
const historyStore = new HistoryStore();

// Components
import {Link} from 'react-router';

import moment from 'moment';

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

  getSession(session, idx) {
    let displayHours;
    let displayMinutes;
    const chargingTime = (session.charging_time / 1000 / 60).toFixed(0);
    if (chargingTime >= 60) {
      displayHours = Math.floor(chargingTime / 60);
      displayMinutes = chargingTime % 60;
    } else {
      displayHours = 0;
      displayMinutes = chargingTime;
    }

    const totalEnergy = math.round(session.energy_kwh, 3);
    const milesAdded = math.round(session.miles_added, 1);

    let activeClass = '';
    if (session.status === 'on') {
      activeClass = 'table-info';
    } else if (session.status === 'stopping') {
      activeClass = 'table-danger';
    }

    return (
      <tr key={idx} className={activeClass}>
        <td>
          <Link to="session" params={{session_id: session.session_id}}>{session.session_id}</Link>
          <div>{session.device_id} ({session.outlet_number})</div>
        </td>
        <td>
          <div>{displayHours}h {displayMinutes}m</div>
          <div>{moment(session.created_date).fromNow()}</div>
        </td>
        <td>
          <div>{totalEnergy.toFixed(3)}kW</div>
          <div>{milesAdded.toFixed(1)}mi</div>
        </td>
        <td>
          <div>${session.total_amount.toFixed(2)}</div>
          <div>{session.payment_type}</div>
        </td>
      </tr>
    );
  },

  getSessions() {
    const sessions = this.state.sessions;

    // TODO
    if (!sessions || !sessions.length) {
      return (
        <div className="text-warning">No Sessions</div>
      );
    }

    return sessions.map(this.getSession);
  },

  render() {
    return (
      <div className="Section">
        <div className="row">
          <div className="col-xs-12">
            <table className="table">
              <thead className="thead-default">
                <tr>
                  <th>Session</th>
                  <th>Duration</th>
                  <th>Energy</th>
                  <th>Cost</th>
                </tr>
              </thead>

              <tbody>
                {this.getSessions()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
});

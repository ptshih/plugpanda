import _ from 'lodash';
import React from 'react';
import moment from 'moment';

// API
import math from '../lib/math';

// Components
import {Navigation} from 'react-router';

export default React.createClass({
  displayName: 'SessionCell',

  propTypes: {
    session: React.PropTypes.object.isRequired,
  },

  mixins: [Navigation],

  // Handlers
  onClick(e) {
    e.preventDefault();

    // URL
    const url = `/sessions/${this.props.session.session_id}`;
    this.transitionTo(url);
  },

  // Render

  render() {
    const session = this.props.session;

    // Date, Time, Duration
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
    const displayDate = moment(session.created_date).calendar(null, {
      lastDay: '[Yesterday] [at] HH:MM',
      sameDay: '[Today] [at] HH:MM',
      nextDay: '[Tomorrow] [at] HH:MM',
      lastWeek: 'MM/DD [at] HH:MM',
      nextWeek: 'MM/DD [at] HH:MM',
      sameElse: 'MM/DD [at] HH:MM',
    });

    // Power, Energy, Miles
    const energyAdded = math.round(session.energy_kwh, 3);
    const milesAdded = math.round(session.miles_added, 1);
    const totalPower = _.reduce(session.update_data, (total, dataPoint) => {
      return total + dataPoint.power_kw;
    }, 0);
    const totalPoints = _.reduce(session.update_data, (total, dataPoint) => {
      if (dataPoint.power_kw === 0) {
        return total;
      }
      return total + 1;
    }, 0);
    const averagePower = math.round(totalPower / totalPoints, 3);

    // Price
    const price = session.payment_type === 'free' ? 'Free' : '$' + session.total_amount.toFixed(2);

    // Location
    const location = (session.address1 && session.city) ?
      `${session.address1}, ${session.city}` :
      `${session.lat.toFixed(6)},${session.lon.toFixed(6)}`;

    // Status
    let statusClass = '';
    if (session.status === 'on') {
      statusClass = 'SessionCell--active';
    } else if (session.status === 'stopping') {
      statusClass = 'SessionCell--stopping';
    }
    const className = ['SessionCell', statusClass].join(' ');

    return (
      <li className={className} onClick={this.onClick}>
        <div className="row">
          <div className="col-xs-6 text-left">
            <div><strong>{session.session_id}</strong></div>
          </div>
          <div className="col-xs-6 text-right">
            <div>{displayDate}</div>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-8 text-left">
            <div>{energyAdded} kWh @ {averagePower} kW</div>
          </div>
          <div className="col-xs-4 text-right">
            <div>{price}</div>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-8 text-left">
            <div>{milesAdded} miles added</div>
          </div>
          <div className="col-xs-4 text-right">
            <div>{displayHours}h {displayMinutes}m</div>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12">
            <div>{location}</div>
          </div>
        </div>
      </li>
    );
  },
});

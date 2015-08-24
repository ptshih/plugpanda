import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';

// Store and Actions
import SessionStore from '../stores/session-store';
import SessionActions from '../actions/session-actions';
const sessionStore = new SessionStore();

// Components
import Chart from './chart';
import Table from './table';
// import {Link} from 'react-router';

import moment from 'moment';

export default React.createClass({
  displayName: 'Session',

  statics: {
    // willTransitionTo(transition, params, query, callback) {
    //   // transition.redirect('root');
    //   callback();
    // },

    fetch(params, query) {
      return api.fetchSession(params.session_id).then((state) => {
        SessionActions.sync(state);
      });
    },
  },

  getInitialState() {
    return sessionStore.getState();
  },

  componentDidMount() {
    sessionStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    sessionStore.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(sessionStore.getState());
  },

  // Render

  render() {
    const labels = [];
    const powerData = [];
    const energyData = [];

    _.each(this.state.update_data, function(dataPoint) {
      if (dataPoint.power_kw === 0) {
        return;
      }

      labels.push(moment(dataPoint.timestamp).calendar());
      powerData.push(dataPoint.power_kw);
      energyData.push(dataPoint.energy_kwh);
    });

    const averagePower = _.sum(powerData) / _.size(powerData);

    const powerDatasets = [{
      label: 'Power (kW)',
      data: powerData,
      fillColor: 'rgba(220,220,220,0.2)',
      strokeColor: 'rgba(220,220,220,1)',
      pointColor: 'rgba(220,220,220,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(220,220,220,1)',
    }];

    const energyDatasets = [{
      label: 'Energy (kWh)',
      data: energyData,
      fillColor: 'rgba(151,187,205,0.2)',
      strokeColor: 'rgba(151,187,205,1)',
      pointColor: 'rgba(151,187,205,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(151,187,205,1)',
    }];

    const estimatedAmount = (this.state.charging_time / 1000 / 60 / 60);
    const amount = this.state.total_amount > 0 ? this.state.total_amount : estimatedAmount;

    let displayHours;
    let displayMinutes;
    const chargingTime = (this.state.charging_time / 1000 / 60).toFixed(0);
    if (chargingTime >= 60) {
      displayHours = Math.floor(chargingTime / 60);
      displayMinutes = chargingTime % 60;
    } else {
      displayHours = 0;
      displayMinutes = chargingTime;
    }

    const rows = [
      ['Session Status', this.state.status],
      ['Charging Status', this.state.current_charging],
      ['Station', this.state.device_id],
      ['Port', this.state.outlet_number],
      ['Charging Time', `${displayHours}h ${displayMinutes}m`],
      ['Average Power', `${averagePower.toFixed(3)} kWh`],
      ['Total Energy', `${this.state.energy_kwh.toFixed(3)} kW`],
      ['Added Distance', `${this.state.miles_added.toFixed(3)} miles`],
      ['Total Price', `$${amount.toFixed(2)}`],
    ];

    return (
      <div className="Section container-fluid">
        <h3>Session: {this.state.session_id}</h3>

        <Table
          headers={['Key', 'Value']}
          rows={rows}
        />

        <div>
          <h3>Power (kW)</h3>
          <Chart labels={labels} datasets={powerDatasets} />
        </div>

        <div>
          <h3>Energy (kWh)</h3>
          <Chart labels={labels} datasets={energyDatasets} />
        </div>
      </div>
    );
  },

});

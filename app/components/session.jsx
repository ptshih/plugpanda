import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';
import math from '../lib/math';

// Store and Actions
import SessionStore from '../stores/session-store';
import SessionActions from '../actions/session-actions';
const sessionStore = new SessionStore();

// Components
import Chart from './chart';
import Table from './table';
import GoogleMap from './google-map';

import moment from 'moment';

export default React.createClass({
  displayName: 'Session',

  statics: {
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

      labels.push(moment(dataPoint.timestamp).format('LT'));
      powerData.push(math.round(dataPoint.power_kw));
      energyData.push(math.round(dataPoint.energy_kwh));
    });

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

    let displayHours;
    let displayMinutes;
    const chargingTime = math.round(this.state.charging_time / 1000 / 60, 0);
    if (chargingTime >= 60) {
      displayHours = Math.floor(chargingTime / 60);
      displayMinutes = chargingTime % 60;
    } else {
      displayHours = 0;
      displayMinutes = chargingTime;
    }

    const averagePower = math.round(_.sum(powerData) / _.size(powerData), 3);
    const totalEnergy = math.round(this.state.energy_kwh, 3);
    const milesAdded = math.round(this.state.miles_added, 1);

    const rows = [
      ['Session Status', this.state.status],
      ['Charging Status', this.state.current_charging],
      ['Station', this.state.device_id],
      ['Port', this.state.outlet_number],
      ['Charging Time', `${displayHours}h ${displayMinutes}m`],
      ['Average Power', `${averagePower.toFixed(3)} kWh`],
      ['Total Energy', `${totalEnergy.toFixed(3)} kW`],
      ['Added Distance', `${milesAdded.toFixed(1)} miles`],
      ['Total Price', `$${this.state.total_amount.toFixed(2)}`],
    ];

    return (
      <div className="Section">
        <div>
          <h5>Session: {this.state.session_id}</h5>
          <Table rows={rows} />
        </div>

        <div>
          <h5>Power (kW)</h5>
          <Chart labels={labels} datasets={powerDatasets} />
        </div>

        <div>
          <h5>Energy (kWh)</h5>
          <Chart labels={labels} datasets={energyDatasets} />
        </div>

        <div>
          <GoogleMap
            lat={this.state.lat}
            lon={this.state.lon}
          />
        </div>
      </div>
    );
  },

});

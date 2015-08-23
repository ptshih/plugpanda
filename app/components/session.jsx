import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';

// Store and Actions
import SessionStore from '../stores/session-store';
import SessionActions from '../actions/session-actions';

// Components
import Chart from './chart';
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
      // console.log(params);
      return api.fetchSession().then((state) => {
        SessionActions.sync(state);
      });
    },
  },

  getInitialState() {
    return SessionStore.getState();
  },

  componentDidMount() {
    SessionStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    SessionStore.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(SessionStore.getState());
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

    return (
      <div className="container-fluid">
        <h2>Session: {this.state.session_id}</h2>

        <div>
          <p>Status: {this.state.status}</p>
          <p>Current Charging: {this.state.current_charging}</p>
          <p>Device/Station: {this.state.device_id}</p>
          <p>Outlet/Port: {this.state.outlet_number}</p>
        </div>

        <div>
          <p>Power (kw): {this.state.power_kw}</p>
          <p>Energy (kWh): {this.state.energy_kwh}</p>
          <p>Distance (mi): {this.state.miles_added}</p>
          <p>Price ($): {this.state.total_amount}</p>
        </div>

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

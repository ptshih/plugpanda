/**
 * This is a Controller/Container View for route: `/`
 */

import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';

// Store and Actions
import SessionStore from '../stores/session-store';
import SessionActions from '../actions/session-actions';

// Components
// import {Link} from 'react-router';

import moment from 'moment';
import Chart from 'chart.js';

export default React.createClass({
  displayName: 'Status',

  statics: {
    // willTransitionTo(transition, params, query, callback) {
    //   // transition.redirect('root');
    //   callback();
    // },

    fetch(params, query) {
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

    this._initializeChart();
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
    const chartStyle = {
      width: '100%',
      height: '400px',
    };

    return (
      <div className="Status">
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
          <h3>Charging Activity</h3>
          <canvas id="timeline" ref="chart" style={chartStyle}></canvas>
        </div>
      </div>
    );
  },


  _initializeChart() {
    const chartEl = React.findDOMNode(this.refs.chart);
    const chartCtx = chartEl.getContext('2d');
    // debugger

    const updateData = this.state.update_data;
    const labels = [];
    const powerData = [];
    const energyData = [];

    _.each(updateData, function(dataPoint) {
      const formattedTime = moment(dataPoint.timestamp).calendar();
      labels.push(formattedTime);
      powerData.push(dataPoint.power_kw);
      energyData.push(dataPoint.energy_kwh);
    });

    const datasets = [{
      label: 'Power (kW)',
      data: powerData,
      fillColor: 'rgba(220,220,220,0.2)',
      strokeColor: 'rgba(220,220,220,1)',
      pointColor: 'rgba(220,220,220,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(220,220,220,1)',
    }, {
      label: 'Energy (kWh)',
      data: energyData,
      fillColor: 'rgba(151,187,205,0.2)',
      strokeColor: 'rgba(151,187,205,1)',
      pointColor: 'rgba(151,187,205,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(151,187,205,1)',
    }];

    const chart = new Chart(chartCtx).Line({
      labels: labels,
      datasets: datasets,
    }, {
      responsive: true,
    });
  },
});

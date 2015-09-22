import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';

// Utils
import api from '../lib/api';
import math from '../../lib/math';

// Store and Actions
import SessionStore from '../stores/session-store';
import SessionActions from '../actions/session-actions';
const sessionStore = new SessionStore();

// Components
import Nav from './nav';
import Table from './table';
import GoogleMap from './google-map';
import Highcharts from 'react-highcharts/more';

// Mixins
import Fetch from '../mixins/fetch';

Highcharts.Highcharts.setOptions({
  global: {
    useUTC: false,
  },
});

export default React.createClass({
  displayName: 'Session',

  propTypes: {
    params: React.PropTypes.object,
  },

  mixins: [Fetch],

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

  onStop(e) {
    e.preventDefault();
    console.log('STOP');

    // TODO: Remember to disable button during async request
  },

  // Render

  getChartConfig(name, data, options = {}) {
    _.defaults(options, {
      color: 'rgba(151,187,205,1)',
      fillColor: 'rgba(151,187,205,0.2)',
    });

    return {
      chart: {
        type: 'areaspline',
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'datetime',
      },
      yAxis: {
        title: '',
      },
      series: [{
        name: name,
        data: data,
      }],
      plotOptions: {
        areaspline: {
          color: options.color,
          fillColor: options.fillColor,
          showInLegend: false,
          marker: {
            enabled: true,
            symbol: 'circle',
            radius: 3,
          },
        },
      },
    };
  },

  getStatsData() {
    const averagePower = this.state.average_power;
    const totalEnergy = math.round(this.state.energy_kwh, 3);
    const milesAdded = math.round(this.state.miles_added, 1);

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

    return [
      ['Session Status', this.state.status],
      ['Charging Status', this.state.current_charging],
      ['Station', this.state.device_id],
      ['Port', this.state.outlet_number],
      ['Charging Time', `${displayHours}h ${displayMinutes}m`],
      ['Average Power', `${averagePower.toFixed(3)} kWh`],
      ['Total Energy', `${totalEnergy.toFixed(3)} kW`],
      ['Added Distance', `${milesAdded.toFixed(1)} miles`],
      ['Total Price', `$${this.state.total_amount.toFixed(2)}`],
      ['Payment Type', this.state.payment_type],
    ];
  },

  getChartData() {
    const power = [];
    const energy = [];

    _.each(this.state.update_data, function(dataPoint) {
      if (dataPoint.power_kw === 0) {
        return;
      }

      power.push([
        dataPoint.timestamp,
        math.round(dataPoint.power_kw),
      ]);

      energy.push([
        dataPoint.timestamp,
        math.round(dataPoint.energy_kwh),
      ]);
    });

    return {
      power: power,
      energy: energy,
    };
  },

  // Render

  getStats() {
    // Stats
    const statsData = this.getStatsData();

    return (
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <Table rows={statsData} />
        </div>
        <div className="col-md-6 col-xs-12">
          <GoogleMap
            lat={this.state.lat}
            lon={this.state.lon}
          />
        </div>
      </div>
    );
  },

  getChart() {
    // Charts
    const chartData = this.getChartData();
    const powerConfig = this.getChartConfig('Power (kW)', chartData.power);
    // const energyConfig = this.getChartConfig('Energy (kWh)', chartData.energy);

    return (
      <div className="row">
        <div className="col-xs-12">
          <h5>Power (kW)</h5>
          <Highcharts style={{height: '300px'}} config={powerConfig} />
        </div>
      </div>
    );
  },

  getStopButton() {
    if (this.state.status !== 'on') {
      return null;
    }

    return <button className="btn btn-danger pull-right" onClick={this.onStop}>Stop</button>;
  },

  getContent() {
    if (!this.state.fetched) {
      return null;
    }

    return (
      <main className="Content">
        <section>
          {this.getStats()}
        </section>

        <section>
          {this.getChart()}
        </section>
      </main>
    );
  },

  render() {
    let sessionId = this.props.params.session_id;
    if (sessionId === 'current') {
      if (this.state.session_id) {
        sessionId = this.state.session_id;
      } else {
        sessionId = 'Loading...';
      }
    }

    const title = `Session: ${sessionId}`;
    return (
      <div className="Component">
        <Nav title={title} parentPath="/sessions" />
        {this.getContent()}
      </div>
    );
  },

  fetch() {
    return api.fetchSession(this.props.params.session_id).then((state) => {
      state.fetched = true;
      SessionActions.sync(state);
    });
  },

  reset() {
    SessionActions.reset();
  },
});

import _ from 'lodash';
import React from 'react';

// Utils
import math from '../../lib/math';

// Container
import createContainer from './container';

// Components
import Table from './partials/table';
import GoogleMap from './partials/google-map';
import Highcharts from 'react-highcharts/bundle/highcharts';

Highcharts.Highcharts.setOptions({
  global: {
    useUTC: false,
  },
});

export default createContainer(React.createClass({
  displayName: 'Session',

  propTypes: {
    params: React.PropTypes.object,
    session: React.PropTypes.object,
  },

  // Handlers

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
    const averagePower = this.props.session.average_power;
    const totalEnergy = math.round(this.props.session.energy_kwh, 3);
    const milesAdded = math.round(this.props.session.miles_added, 1);

    let displayHours;
    let displayMinutes;
    const chargingTime = math.round(this.props.session.charging_time / 1000 / 60, 0);
    if (chargingTime >= 60) {
      displayHours = Math.floor(chargingTime / 60);
      displayMinutes = chargingTime % 60;
    } else {
      displayHours = 0;
      displayMinutes = chargingTime;
    }

    return [
      ['Session Status', this.props.session.status],
      ['Charging Status', this.props.session.current_charging],
      ['Station', this.props.session.device_id],
      ['Port', this.props.session.outlet_number],
      ['Charging Time', `${displayHours}h ${displayMinutes}m`],
      ['Average Power', `${averagePower.toFixed(3)} kWh`],
      ['Total Energy', `${totalEnergy.toFixed(3)} kW`],
      ['Added Distance', `${milesAdded.toFixed(1)} miles`],
      ['Total Price', `$${this.props.session.total_amount.toFixed(2)}`],
      ['Payment Type', this.props.session.payment_type],
    ];
  },

  getChartData() {
    const power = [];
    const energy = [];

    _.forEach(this.props.session.update_data, function(dataPoint) {
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
            lat={this.props.session.lat}
            lon={this.props.session.lon}
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
    if (this.props.session.status !== 'on') {
      return null;
    }

    return <button className="btn btn-danger pull-right" onClick={this.onStop}>Stop</button>;
  },

  render() {
    return (
      <div>
        <section>
          {this.getStats()}
        </section>

        <section>
          {this.getChart()}
        </section>
      </div>
    );
  },
}), {
  title: 'Session',
  fetchHandler: 'fetchSession',
  fetchParams: ['session_id'],
  storeKey: 'session',
});

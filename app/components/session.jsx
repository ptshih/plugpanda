import _ from 'lodash';
import React from 'react';
import moment from 'moment';

// Utils
import math from '../../lib/math';
import api from '../lib/api';

// Container
import createContainer from './container';

// Components
import Table from './partials/table';
import GoogleMap from './partials/google-map';
import Highcharts from 'react-highcharts/bundle/highcharts';
import themeGray from '../highcharts/theme-gray';

// Gray theme
Highcharts.Highcharts.setOptions(themeGray);
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

  getInitialState() {
    return {
      disabled: false,
    };
  },

  // Handlers

  onStop(event) {
    event.preventDefault();

    this.setState({
      disabled: true,
    });

    return api.stopSession(this.props.session.session_id).finally(() => {
      this.setState({
        disabled: false,
      });
    }).catch((err) => {
      // TODO: don't use js alert
      alert(err.message);
    });
  },

  // Render

  getStopButton() {
    if (this.props.session.status !== 'on') {
      return null;
    }

    return (
      <section className="text-xs-center">
        <button
          className="btn btn-danger"
          onClick={this.onStop}
          disabled={this.state.disabled}
        >
          Stop Session
        </button>
      </section>
    );
  },

  getChart() {
    const data = this._getDisplayData();

    // Charts
    const chartData = this._getChartData();
    const powerConfig = this._getChartConfig('Power (kW)', chartData.power);

    return (
      <section>
        <div className="row">
          <div className="col-xs-12">
            <div style={{position: 'relative'}}>
              <Highcharts style={{height: '300px'}} config={powerConfig} />
              <div className="session-chart-overlay">
                <div className="session-chart-overlay-date">{data.date}</div>
                <div className="session-chart-overlay-duration">{`${data.hours}h ${data.minutes}m`}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  getTable() {
    const sessionId = _.get(this.props, 'session.session_id');
    const totalPaid = '$' + _.get(this.props, 'session.total_amount', 0).toFixed(2);
    return (
      <section>
        <Table
          rows={this._getStatsData()}
          headers={[['Session ID', sessionId]]}
          footers={[['Total Paid', totalPaid]]}
        />
      </section>
    );
  },

  getMap() {
    return (
      <section>
        <GoogleMap
          lat={this.props.session.lat}
          lon={this.props.session.lon}
        />
      </section>
    );
  },

  render() {
    return (
      <article>
        {this.getChart()}
        {this.getStopButton()}
        {this.getTable()}
        {this.getMap()}
      </article>
    );
  },

  // Private

  _getChartConfig(name, data, options = {}) {
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
        labels: {
          enabled: false,
        },
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0,
      },
      yAxis: {
        title: '',
        labels: {
          enabled: false,
        },
        gridLineWidth: 0,
        minorGridLineWidth: 0,
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

  _getChartData() {
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

  _getStatsData() {
    const data = this._getDisplayData();

    return [
      ['Session Status', _.upperCase(this.props.session.status)],
      ['Station / Port', `${this.props.session.device_id} / ${this.props.session.outlet_number}`],
      ['Max Power', data.maxPower],
      ['Average Power', data.averagePower],
      ['Total Energy', data.totalEnergy],
      ['Added Distance', data.milesAdded],
    ];
  },

  _getDisplayData() {
    const data = {};

    // Date
    data.date = moment(_.get(this.props, 'session.created_date')).calendar(null, {
      lastDay: '[Yesterday] [at] HH:MM',
      sameDay: '[Today] [at] HH:MM',
      nextDay: '[Tomorrow] [at] HH:MM',
      lastWeek: 'MM/DD [at] HH:MM',
      nextWeek: 'MM/DD [at] HH:MM',
      sameElse: 'MM/DD [at] HH:MM',
    });

    // Hours and Minutes
    const chargingTime = math.round(this.props.session.charging_time / 1000 / 60, 0);
    if (chargingTime >= 60) {
      data.hours = Math.floor(chargingTime / 60);
      data.minutes = chargingTime % 60;
    } else {
      data.hours = 0;
      data.minutes = chargingTime;
    }

    // Energy and Power
    data.averagePower = `${_.get(this.props, 'session.average_power', 0).toFixed(3)} kW`;
    data.maxPower = `${_.get(this.props, 'session.max_power', 0).toFixed(3)} kW`;
    data.totalEnergy = `${math.round(_.get(this.props, 'session.energy_kwh', 0), 3).toFixed(3)} kWh`;
    data.milesAdded = `${math.round(_.get(this.props, 'session.miles_added', 0), 1)} miles`;

    return data;
  },

}), {
  title: 'Session',
  fetchHandler: 'fetchSession',
  fetchParams: ['session_id'],
  storeKey: 'session',
});

import React from 'react';
import moment from 'moment';

// Utils
import api from '../lib/api';

// Store
import Store from '../stores/store';

// Components
import Nav from './nav';
import Table from './table';
import GoogleMap from './google-map';

// Mixins
import Fetch from '../mixins/fetch';

export default React.createClass({
  displayName: 'Car',

  propTypes: {
    params: React.PropTypes.object,
  },

  mixins: [Fetch],

  getInitialState() {
    return Store.getState('car');
  },

  componentDidMount() {
    Store.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    Store.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(Store.getState('car'));
  },

  // Render

  getStatsData() {
    const timeDiff = moment(this.state.data.updateTime).diff(moment());
    const lastUpdated = timeDiff >= 0 ? 'just now' : moment(this.state.data.updateTime).fromNow();

    return [
      ['VIN', this.state.data.vin],
      ['Last Updated', lastUpdated],
      ['Miles', this.state.data.miles],
      ['Lock', this.state.data.doorLockState],
      ['Battery', `${this.state.data.chargingLevelHv}%`],
      ['Fuel', `${this.state.data.fuelLevel}%`],
      ['Charging Status', this.state.data.chargingStatus],
      ['Port Status', this.state.data.connectionStatus],
      ['Driver Front', this.state.data.doorDriverFront],
      ['Driver Rear', this.state.data.doorDriverRear],
      ['Passenger Front', this.state.data.doorPassengerFront],
      ['Passenger Rear', this.state.data.doorPassengerRear],
      ['Trunk', this.state.data.trunk],
      ['Frunk', this.state.data.hood],
    ];
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
          lat={this.state.data.position.lat}
          lon={this.state.data.position.lon}
          />
        </div>
      </div>
    );
  },

  getChartConfig(label, value, suffix = '%') {
    return {
      chart: {
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
      },
      pane: {
        center: ['50%', '60%'],
        startAngle: -125,
        endAngle: 125,
        background: [{
          borderWidth: 0,
          backgroundColor: 'transparent',
        }],
      },
      title: null,
      tooltip: {
        enabled: false,
      },
      yAxis: {
        min: 0,
        max: 100,
        lineColor: 'transparent',

        minorTickInterval: 'auto',
        minorTickWidth: 0,
        minorTickLength: 10,
        minorTickPosition: 'inside',
        minorTickColor: '#666',

        tickPixelInterval: 30,
        tickWidth: 2,
        tickPosition: 'inside',
        tickLength: 0,
        tickColor: '#666',
        labels: {
          step: 2,
          rotation: 'auto',
        },
        title: {
          text: label,
          y: 140,
        },
        plotBands: [{
          from: 0,
          to: 10,
          color: '#DF5353',
          innerRadius: '95%',
          outerRadius: '105%',
        }, {
          from: 10,
          to: 75,
          color: '#DDDF0D',
          innerRadius: '95%',
          outerRadius: '105%',
        }, {
          from: 75,
          to: 100,
          color: '#55BF3B',
          innerRadius: '95%',
          outerRadius: '105%',
        }],
      },
      plotOptions: {
        gauge: {
          dataLabels: {
            borderColor: 'transparent',
          },
          dial: {
            radius: '70%',
            backgroundColor: '#666666',
            borderWidth: 0,
            baseWidth: 6,
            topWidth: 1,
            baseLength: '90%', // of radius
            rearLength: '0%',
          },
          pivot: {
            backgroundColor: '#666666',
            radius: 3,
          },
        },
      },
      series: [{
        name: label,
        data: [value],
        dataLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            fontSize: '22px',
          },
          formatter() {
            return `${this.y}${suffix}`;
          },
        },
      }],
    };
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
      </main>
    );
  },

  render() {
    return (
      <div className="Component">
        <Nav title="BMW" loading={!this.state.fetched} />
        {this.getContent()}
      </div>
    );
  },

  fetch() {
    return api.fetchCar().then((data) => {
      Store.dispatch({
        type: 'FETCH',
        property: 'car',
        state: {
          fetched: true,
          error: null,
          data: data,
        },
      });
    }).catch((err) => {
      Store.dispatch({
        type: 'FETCH',
        property: 'car',
        state: {
          fetched: true,
          error: err.message,
          data: {},
        },
      });
    });
  },

  reset() {
    Store.dispatch({
      type: 'RESET',
      property: 'car',
    });
  },
});

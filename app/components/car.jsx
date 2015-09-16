import React from 'react';
import moment from 'moment';

// Utils
import auth from '../lib/auth';
import api from '../lib/api';
import math from '../../lib/math';

// Store and Actions
import CarStore from '../stores/car-store';
import CarActions from '../actions/car-actions';
const carStore = new CarStore();

// Components
// import {Link} from 'react-router';
import Table from './table';
import GoogleMap from './google-map';
// import Highcharts from 'react-highcharts/more';

export default React.createClass({
  displayName: 'Car',

  statics: {
    fetch() {
      return api.fetchCar().then((state) => {
        CarActions.sync(state);
      });
    },

    willTransitionTo(transition) {
      if (!auth.isLoggedIn()) {
        transition.redirect('/login');
      }
    },
  },

  getInitialState() {
    return carStore.getState();
  },

  componentDidMount() {
    carStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    carStore.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(carStore.getState());
  },

  // Render

  getStatsData() {
    const timeDiff = moment(this.state.updateTime).diff(moment());
    const lastUpdated = timeDiff >= 0 ? 'just now' : moment(this.state.updateTime).fromNow();

    return [
      ['Last Updated', lastUpdated],
      ['Miles', this.state.miles],
      ['Lock', this.state.doorLockState],
      ['Battery', `${this.state.chargingLevelHv}%`],
      ['Fuel', `${this.state.fuelLevel}%`],
      ['Charging Status', this.state.chargingStatus],
      ['Port Status', this.state.connectionStatus],
      ['Driver Front', this.state.doorDriverFront],
      ['Driver Rear', this.state.doorDriverRear],
      ['Passenger Front', this.state.doorPassengerFront],
      ['Passenger Rear', this.state.doorPassengerRear],
      ['Trunk', this.state.trunk],
      ['Frunk', this.state.hood],
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
          lat={this.state.position.lat}
          lon={this.state.position.lon}
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

  render() {
    return (
      <article className="Content">
        <section>
          <div className="row">
            <div className="col-xs-12">
              <div className="Section-heading">{this.state.vin}</div>
            </div>
          </div>
        </section>

        <section>
          {this.getStats()}
        </section>
      </article>
    );
  },
});

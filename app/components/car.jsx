import React from 'react';
import moment from 'moment';

// Container
import createContainer from './container';

// Components
import Table from './partials/table';
import GoogleMap from './partials/google-map';

export default createContainer(React.createClass({
  displayName: 'Car',

  propTypes: {
    params: React.PropTypes.object,
    car: React.PropTypes.object,
  },

  // Handlers

  // Render

  getStatsData() {
    const timeDiff = moment(this.props.car.updateTime).diff(moment());
    const lastUpdated = timeDiff >= 0 ? 'just now' : moment(this.props.car.updateTime).fromNow();

    return [
      ['VIN', this.props.car.vin],
      ['Last Updated', lastUpdated],
      ['Miles', this.props.car.miles],
      ['Lock', this.props.car.doorLockState],
      ['Battery', `${this.props.car.chargingLevelHv}%`],
      ['Fuel', `${this.props.car.fuelLevel}%`],
      ['Charging Status', this.props.car.chargingStatus],
      ['Port Status', this.props.car.connectionStatus],
      ['Driver Front', this.props.car.doorDriverFront],
      ['Driver Rear', this.props.car.doorDriverRear],
      ['Passenger Front', this.props.car.doorPassengerFront],
      ['Passenger Rear', this.props.car.doorPassengerRear],
      ['Trunk', this.props.car.trunk],
      ['Frunk', this.props.car.hood],
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
          lat={this.props.car.position.lat}
          lon={this.props.car.position.lon}
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
      <article>
        <section>
          {this.getStats()}
        </section>
      </article>
    );
  },
}), {
  title: 'Car',
  fetchHandler: 'fetchCar',
  storeKey: 'car',
});

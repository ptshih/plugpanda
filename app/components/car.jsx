import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';
import math from '../lib/math';

// Store and Actions
import CarStore from '../stores/car-store';
import CarActions from '../actions/car-actions';
const carStore = new CarStore();

// Components
// import {Link} from 'react-router';
import Table from './table';
import GoogleMap from './google-map';

import moment from 'moment';

export default React.createClass({
  displayName: 'Car',

  statics: {
    fetch() {
      return api.fetchCar().then((state) => {
        CarActions.sync(state);
      });
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

  getStats() {
    const fuelPercent = math.round((this.state.remainingFuel / this.state.maxFuel) * 100, 0);
    const timeDiff = moment(this.state.updateTime).diff(moment());
    const lastUpdated = timeDiff >= 0 ? 'just now' : moment(this.state.updateTime).fromNow();

    return [
      ['Last Updated', lastUpdated],
      ['Miles', this.state.miles],
      ['Lock', this.state.doorLockState],
      ['Battery', `${this.state.chargingLevelHv}%`],
      ['Fuel', `${fuelPercent}%`],
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

  render() {
    // Stats
    const stats = this.getStats();

    return (
      <div className="Section">
        <div className="row-margin">
          <div className="col-xs-12">
            <h5>VIN: {this.state.vin}</h5>
          </div>
        </div>

        <div className="row-margin">
          <div className="col-md-6 col-xs-12">
            <Table rows={stats} />
          </div>
          <div className="col-md-6 col-xs-12">
            <GoogleMap
            lat={this.state.position.lat}
            lon={this.state.position.lon}
            />
          </div>
        </div>
      </div>
    );
  },
});

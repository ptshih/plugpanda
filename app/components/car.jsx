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

  render() {
    const fuelPercent = math.round((this.state.maxFuel / this.state.remainingFuel) * 100, 0);
    const timeDiff = moment(this.state.updateTime).diff(moment());
    const lastUpdated = timeDiff >= 0 ? 'just now' : moment(this.state.updateTime).fromNow();

    const rows = [
      ['VIN', this.state.vin],
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

    return (
      <div className="Section">
        <Table
          rows={rows}
        />

        <div>
          <GoogleMap
            lat={this.state.position.lat}
            lon={this.state.position.lon}
          />
        </div>
      </div>
    );
  },
});

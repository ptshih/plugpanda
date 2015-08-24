import _ from 'lodash';
import React from 'react';

// API
import api from '../lib/api';

// Store and Actions
import CarStore from '../stores/car-store';
import CarActions from '../actions/car-actions';
const carStore = new CarStore();

// Components
// import {Link} from 'react-router';
import Table from './table';

import moment from 'moment';

export default React.createClass({
  displayName: 'Car',

  statics: {
    // willTransitionTo(transition, params, query, callback) {
    //   // transition.redirect('root');
    //   callback();
    // },

    fetch(params, query) {
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
    const fuelPercent = ((this.state.maxFuel / this.state.remainingFuel) * 100).toFixed(0);

    const mapUrl = this._buildStaticMap(this.state.position);

    const rows = [
      ['VIN', this.state.vin],
      ['Last Updated', moment(this.state.updateTime).fromNow()],
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
      <div className="Section container-fluid">
        <Table
          headers={['Key', 'Value']}
          rows={rows}
        />

        <div>
          <img className="Car-map" src={mapUrl} />
        </div>
      </div>
    );
  },

  _buildStaticMap(position, zoom = 16, size = '400x400') {
    const lat = position.lat;
    const lon = position.lon;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${size}&markers=${lat},${lon}`;
  },
});

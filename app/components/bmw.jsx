import React from 'react';
import moment from 'moment';

// Container
import createContainer from './container';

// Components
import Table from './partials/table';
import GoogleMap from './partials/google-map';

export default createContainer(React.createClass({
  displayName: 'BMW',

  propTypes: {
    params: React.PropTypes.object,
    bmw: React.PropTypes.object,
  },

  // Handlers

  // Render

  getMap() {
    return (
      <section className="section--fluid">
        <div className="bmw-map">
          <GoogleMap
            lat={this.props.bmw.position.lat}
            lon={this.props.bmw.position.lon}
          />
        </div>
      </section>
    );
  },

  getTable() {
    return (
      <section>
        <Table rows={this._getStatsData()} />
      </section>
    );
  },

  render() {
    return (
      <article>
        {this.getMap()}
        {this.getTable()}
      </article>
    );
  },

  _getStatsData() {
    const data = this._getDisplayData();

    return [
      ['VIN', data.vin],
      ['Last Updated', data.lastUpdated],
      ['Miles', data.miles],
      ['Lock', data.lock],
      ['Battery', data.battery],
      ['Fuel', data.fuel],
      ['Charging Status', data.chargingStatus],
      ['Connection Status', data.connectionStatus],
      ['Driver Front', data.doorDriverFront],
      ['Driver Rear', data.doorDriverRear],
      ['Passenger Front', data.doorPassengerFront],
      ['Passenger Rear', data.doorPassengerRear],
      ['Trunk', data.trunk],
      ['Hood', data.hood],
    ];
  },

  _getDisplayData() {
    const timeDiff = moment(this.props.bmw.updateTime).diff(moment());
    const lastUpdated = timeDiff >= 0 ? 'just now' : moment(this.props.bmw.updateTime).fromNow();

    return {
      vin: this.props.bmw.vin,
      lastUpdated: lastUpdated,
      miles: this.props.bmw.miles,
      lock: this.props.bmw.doorLockState,
      battery: `${this.props.bmw.chargingLevelHv}%`,
      fuel: `${this.props.bmw.fuelLevel}%`,
      chargingStatus: this.props.bmw.chargingStatus,
      connectionStatus: this.props.bmw.connectionStatus,
      doorDriverFront: this.props.bmw.doorDriverFront,
      doorDriverRear: this.props.bmw.doorDriverRear,
      doorPassengerFront: this.props.bmw.doorPassengerFront,
      doorPassengerRear: this.props.bmw.doorPassengerRear,
      trunk: this.props.bmw.trunk,
      hood: this.props.bmw.hood,
    };
  },
}), {
  title: 'BMW',
  fetchHandler: 'fetchBmw',
  storeKey: 'bmw',
});

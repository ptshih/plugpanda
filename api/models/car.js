const _ = require('lodash');
const Muni = require('muni');
const request = require('../lib/request');

const BaseModel = require('./base');

module.exports = BaseModel.extend({
  urlRoot: 'cars',

  defaults() {
    return _.extend({},
      _.result(BaseModel.prototype, 'defaults'), {
        // From BMW
        vin: null,
        miles: 0,
        updateReason: null,
        updateTime: new Date(),

        // Charging Status
        connectionStatus: null,
        chargingStatus: null,
        chargingTimeRemaining: 0,

        // Range
        chargingLevelHv: 0,
        remainingFuel: 0,
        maxFuel: 9, // CODED
        remainingRangeElectricMls: 0,
        remainingRangeFuelMls: 0,

        // Physical Status
        doorLockState: null,
        doorDriverFront: null,
        doorDriverRear: null,
        doorPassengerFront: null,
        doorPassengerRear: null,
        windowDriverFront: null,
        windowDriverRear: null,
        windowPassengerFront: null,
        windowPassengerRear: null,
        trunk: null,
        hood: null,
        parkingLight: null,
        positionLight: null,

        position: {},
      }
    );
  },

  schema() {
    return _.extend({},
      _.result(BaseModel.prototype, 'schema'), {
        // From BMW
        vin: 'string',
        miles: 'uinteger',
        updateReason: 'string',
        updateTime: 'date',

        // Charging Status
        connectionStatus: 'string', // CONNECTED, DISCONNECTED
        chargingStatus: 'string', // FINISHED_FULLY_CHARGED, INVALID
        chargingTimeRemaining: 'uinteger',

        // Range
        chargingLevelHv: 'uinteger',
        remainingFuel: 'uinteger',
        maxFuel: 'uinteger', // CODED
        remainingRangeElectricMls: 'uinteger',
        remainingRangeFuelMls: 'uinteger',

        // Physical Status
        doorLockState: 'string',
        doorDriverFront: 'string',
        doorDriverRear: 'string',
        doorPassengerFront: 'string',
        doorPassengerRear: 'string',
        windowDriverFront: 'string',
        windowDriverRear: 'string',
        windowPassengerFront: 'string',
        windowPassengerRear: 'string',
        trunk: 'string',
        hood: 'string',
        parkingLight: 'string',
        positionLight: 'string',

        position: {
          lat: 'float',
          lon: 'float',
          heading: 'uinteger',
          status: 'string',
        },
      }
    );
  },

  updateStatus: Muni.Promise.method(function() {
    return this._sendStatusRequest().bind(this).tap((data) => {
      this._setFromBMW(data.vehicleStatus);
    }).return(this);
  }),

  sendPOI: Muni.Promise.method(function(poi) {
    return this._sendPOIRequest(poi).return(this);
  }),

  executeService: Muni.Promise.method(function(type) {
    return this._sendExecuteServiceRequest(type);
  }),


  _setFromBMW(vehicleStatus) {
    this.set(this._convertFromBMW(vehicleStatus));
  },

  _convertFromBMW(car) {
    const attrs = {
      vin: car.vin,
      miles: car.mileage * 0.621371,
      chargingLevelHv: car.chargingLevelHv,
      remainingFuel: car.remainingFuel,
      connectionStatus: car.connectionStatus,
      chargingStatus: car.chargingStatus,
      chargingTimeRemaining: car.chargingTimeRemaining,
      remainingRangeElectricMls: car.remainingRangeElectricMls,
      remainingRangeFuelMls: car.remainingRangeFuelMls,
      updateReason: car.updateReason,
      updateTime: new Date(car.updateTime),

      doorLockState: car.doorLockState,
      doorDriverFront: car.doorDriverFront,
      doorDriverRear: car.doorDriverRear,
      doorPassengerFront: car.doorPassengerFront,
      doorPassengerRear: car.doorPassengerRear,
      windowDriverFront: car.windowDriverFront,
      windowDriverRear: car.windowDriverRear,
      windowPassengerFront: car.windowPassengerFront,
      windowPassengerRear: car.windowPassengerRear,
      trunk: car.trunk,
      hood: car.hood,
      parkingLight: car.parkingLight,
      positionLight: car.positionLight,

      position: car.position,
    };

    return attrs;
  },

  /**
   * Check the status of the car
   */
  _sendStatusRequest: Muni.Promise.method(function() {
    return request.send({
      url: `https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/${this.bmw.vin}/status`,
      headers: {
        Authorization: `Bearer ${this.bmw.access_token}`,
      },
    });
  }),

  /**
   * Send POI to car
   *
   * Properties:
   * - street
   * - city
   * - country
   * - lon (optional)
   * - lat (optional)
   * - name (optional)
   * - subject (optional)
   */
  _sendPOIRequest: Muni.Promise.method(function(poi) {
    if (!poi.street || !poi.city || !poi.country) {
      throw new Error('Missing `street`, `city`, or `country`.');
    }

    const data = {
      poi: _.defaults(poi, {
        // subject: 'SID_MYBMW_MAP_DROPPED_PIN_TITLE',
        useAsDestination: true,
        name: poi.street,
      }),
    };

    return request.send({
      method: 'POST',
      url: `https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/${this.bmw.vin}/sendpoi`,
      headers: {
        Authorization: `Bearer ${this.bmw.access_token}`,
      },
      form: {
        data: JSON.stringify(data),
      },
    });
  }),

  /**
   * Execute a remote service on the car
   *
   * type:
   * - DOOR_LOCK
   * - ???
   */
  _sendExecuteServiceRequest: Muni.Promise.method(function(type) {
    if (!type) {
      throw new Error('Missing `type`.');
    }

    return request.send({
      method: 'POST',
      url: `https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/${this.bmw.vin}/executeService`,
      headers: {
        Authorization: `Bearer ${this.bmw.access_token}`,
      },
      form: {
        serviceType: type,
      },
    });
  }),
});

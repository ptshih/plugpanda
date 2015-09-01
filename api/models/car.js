const _ = require('lodash');

const BaseUserModel = require('./base_user');

module.exports = BaseUserModel.extend({
  urlRoot: 'cars',

  defaults() {
    return _.extend({},
      _.result(BaseUserModel.prototype, 'defaults'), {
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
        remainingFuel: 0.0,
        maxFuel: 9.0, // CODED
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
      _.result(BaseUserModel.prototype, 'schema'), {
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
        remainingFuel: 'ufloat',
        maxFuel: 'ufloat', // CODED
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

  setFromBMW(vehicleStatus) {
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
});

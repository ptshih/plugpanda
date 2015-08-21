const _ = require('lodash');
const BaseModel = require('./base');

module.exports = BaseModel.extend({
  urlRoot: 'cars',

  defaults() {
    return _.extend({},
      _.result(BaseModel.prototype, 'defaults'), {
        // From BMW
        vin: null,
        miles: 0,
        kilometers: 0,
        chargingLevelHv: 0,
        remainingFuel: 0,
        maxFuel: 9, // CODED
        updateReason: null,
        updateTime: new Date(),

        // Charging Status
        connectionStatus: null,
        chargingStatus: null,

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
        kilometers: 'uinteger',
        chargingLevelHv: 'uinteger',
        remainingFuel: 'uinteger',
        maxFuel: 'uinteger', // CODED
        updateReason: 'string',
        updateTime: 'date',

        // Charging Status
        connectionStatus: 'string',
        chargingStatus: 'string',

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

  setFromBMW(car) {
    this.set(this._convertFromBMW(car));
  },

  _convertFromBMW(car) {
    const attrs = {
      vin: car.vin,
      miles: car.mileage * 0.621371,
      kilometers: car.mileage,
      chargingLevelHv: car.chargingLevelHv,
      remainingFuel: car.remainingFuel,
      connectionStatus: car.connectionStatus,
      chargingStatus: car.chargingStatus,
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

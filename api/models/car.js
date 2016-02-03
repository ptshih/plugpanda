const _ = require('lodash');
const math = require('../../lib/math');

const BaseUserModel = require('./base-user');

module.exports = BaseUserModel.extend({
  urlRoot: 'cars',

  definition: function() {
    return _.assign({},
      _.result(BaseUserModel.prototype, 'definition'), {
        // BMW
        vin: {
          type: 'string',
        },
        updateReason: {
          type: 'string',
        },
        miles: {
          type: 'uinteger',
        },
        updateTime: {
          type: 'date',
        },

        // Charging Status
        connectionStatus: {
          type: 'string',
        },
        chargingStatus: {
          type: 'string',
        },
        chargingTimeRemaining: {
          type: 'uinteger',
        },

        // Range
        chargingLevelHv: {
          type: 'uinteger',
        },
        remainingFuel: {
          type: 'ufloat',
        },
        maxFuel: {
          type: 'ufloat',
          default: 9.0,
        },
        remainingRangeElectricMls: {
          type: 'uinteger',
        },
        remainingRangeFuelMls: {
          type: 'uinteger',
        },

        // Physical Status
        doorLockState: {
          type: 'string',
        },
        doorDriverFront: {
          type: 'string',
        },
        doorDriverRear: {
          type: 'string',
        },
        doorPassengerFront: {
          type: 'string',
        },
        doorPassengerRear: {
          type: 'string',
        },
        windowDriverFront: {
          type: 'string',
        },
        windowDriverRear: {
          type: 'string',
        },
        windowPassengerFront: {
          type: 'string',
        },
        windowPassengerRear: {
          type: 'string',
        },
        trunk: {
          type: 'string',
        },
        hood: {
          type: 'string',
        },
        parkingLight: {
          type: 'string',
        },
        positionLight: {
          type: 'string',
        },

        // GPS Coordinates
        position: {
          type: 'object',
          fields: {
            lat: {
              type: 'float',
            },
            lon: {
              type: 'float',
            },
            heading: {
              type: 'uinteger',
            },
            status: {
              type: 'string',
            },
          },
        },
      }
    );
  },

  render() {
    const json = BaseUserModel.prototype.render.apply(this, arguments);
    json.fuelLevel = math.round((this.get('remainingFuel') / this.get('maxFuel')) * 100, 0);
    return json;
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

const _ = require('lodash');
const math = require('../../lib/math');

const BaseUserModel = require('./base-user');

module.exports = BaseUserModel.extend({
  urlRoot: 'bmws',

  definition: function() {
    return _.assign({},
      _.result(BaseUserModel.prototype, 'definition'), {
        // Bmw
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

  setFromBmw(vehicleStatus) {
    this.set(this._convertFromBmw(vehicleStatus));
  },

  _convertFromBmw(data) {
    const attrs = {
      vin: data.vin,
      miles: data.mileage * 0.621371,
      chargingLevelHv: data.chargingLevelHv,
      remainingFuel: data.remainingFuel,
      connectionStatus: data.connectionStatus,
      chargingStatus: data.chargingStatus,
      chargingTimeRemaining: data.chargingTimeRemaining,
      remainingRangeElectricMls: data.remainingRangeElectricMls,
      remainingRangeFuelMls: data.remainingRangeFuelMls,
      updateReason: data.updateReason,
      updateTime: new Date(data.updateTime),

      doorLockState: data.doorLockState,
      doorDriverFront: data.doorDriverFront,
      doorDriverRear: data.doorDriverRear,
      doorPassengerFront: data.doorPassengerFront,
      doorPassengerRear: data.doorPassengerRear,
      windowDriverFront: data.windowDriverFront,
      windowDriverRear: data.windowDriverRear,
      windowPassengerFront: data.windowPassengerFront,
      windowPassengerRear: data.windowPassengerRear,
      trunk: data.trunk,
      hood: data.hood,
      parkingLight: data.parkingLight,
      positionLight: data.positionLight,

      position: data.position,
    };

    return attrs;
  },
});

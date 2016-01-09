// const _ = require('lodash');
const bmwapi = require('../lib/bmw');

// Twilio
const twilio = require('twilio');

const CarModel = require('../models/car');
const SessionModel = require('../models/session');
const BaseController = require('./base');

module.exports = BaseController.extend({
  setupRoutes() {
    BaseController.prototype.setupRoutes.call(this);

    this.routes.post['/twilio/sms'] = {
      action: this.sms,
      middleware: [],
    };
  },


  sms(req, res, next) {
    // Parse command from SMS
    const text = (req.body.Body || '').toLowerCase().trim();
    const parts = text.split(' ');

    // Command format: `/car soc` or `/car`
    if (!parts.length || parts.length > 2) {
      return res.sendStatus(204);
    }

    req.mode = parts[0];
    req.cmd = parts[1];

    // BMW
    if (req.mode === '/car') {
      return this._car(req, res, next);
    }

    // Chargepoint
    if (req.mode === '/charge') {
      return this._charge(req, res, next);
    }

    return res.sendStatus(204);
  },

  _car(req, res, next) {
    const cmd = req.cmd;

    const car = new CarModel();
    car.db = this.get('db');

    return bmwapi.auth().then((bmw) => {
      req.bmw = bmw;
      return car.fetch({
        query: {
          vin: req.bmw.vin,
        },
      });
    }).tap(() => {
      return bmwapi.sendStatusRequest(
        req.bmw.access_token,
        req.bmw.vin
      ).tap((data) => {
        car.setFromBMW(data.vehicleStatus);
      });
    }).tap(() => {
      return car.save();
    }).then(() => {
      switch (cmd) {
        case 'status':
          return `Status: ${car.get('updateReason')}`;
        case 'charge':
        case 'soc':
        case 'batt':
          return `SOC: ${car.get('chargingLevelHv')}%`;
        case 'fuel':
        case 'gas':
          const fuelPercent = ((car.get('remainingFuel') / car.get('maxFuel')) * 100).toFixed(0);
          return `Fuel: ${fuelPercent}%`;
        case 'door':
        case 'alarm':
          return `Door: ${car.get('doorLockState')}`;
        case 'plug':
          return `Plug: ${car.get('connectionStatus')} / ${car.get('chargingStatus')}`;
        case 'miles':
        case 'mileage':
        case 'mi':
          return `Miles: ${car.get('miles')}`;
        case 'map':
        case 'gps':
          // https://developers.google.com/maps/documentation/ios/urlscheme?hl=en
          return `comgooglemapsurl://maps.google.com/?q=${car.get('position.lat')},${car.get('position.lon')}`;
          // return `comgooglemaps://?center=${data.position.lat},${data.position.lon}`;
          // return `https://maps.google.com/maps?q=${data.position.lat},${data.position.lon}`;
        default:
          return `Commands: status, soc, fuel, door, plug, miles, map`;
      }
    }).then((message) => {
      res.message = message;
      this._twimlResponse(req, res, next);
    }).catch(next);
  },

  _charge(req, res, next) {
    const cmd = req.cmd;

    const session = new SessionModel();
    session.db = this.get('db');

    return session.fetch({
      query: {},
      sort: [['updated', 'desc']],
    }).then(() => {
      switch (cmd) {
        case 'status':
          return `Status: ${session.get('status')} / ${session.get('current_charging')}`;
        case 'power':
        case 'kw':
          return `Power (kw): ${session.get('power_kw')}`;
        case 'energy':
        case 'kwh':
          return `Energy (kwh): ${session.get('energy_kwh')}`;
        case 'miles':
          const miles = session.get('miles_added').toFixed(2);
          return `Miles: ${miles}`;
        case 'time':
          let displayTime;
          const chargingTime = (session.get('charging_time') / 1000 / 60).toFixed(0);
          if (chargingTime >= 60) {
            const hours = Math.floor(chargingTime / 60);
            const minutes = chargingTime % 60;
            displayTime = `${hours} hours ${minutes} minutes`;
          } else {
            displayTime = `${chargingTime} minutes`;
          }
          return `Charging Time: ${displayTime}`;
        default:
          return `Commands: status, power, energy, miles, time`;
      }
    }).then((message) => {
      res.message = message;
      this._twimlResponse(req, res, next);
    }).catch(next);
  },

  _twimlResponse(req, res) {
    const resp = new twilio.TwimlResponse();
    resp.message(res.message);
    res.writeHead(200, {
      'Content-Type': 'text/xml',
    });
    res.end(resp.toString());
  },
});

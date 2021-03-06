// const _ = require('lodash');
const bmwapi = require('../lib/bmw');

// Twilio
const twilio = require('twilio');

const BmwModel = require('../models/bmw');
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

    // Command format: `/bmw soc` or `/bmw`
    if (!parts.length || parts.length > 2) {
      res.sendStatus(204);
      return;
    }

    req.mode = parts[0];
    req.cmd = parts[1];

    // Bmw
    if (req.mode === '/bmw') {
      this._bmw(req, res, next);
      return;
    }

    // Chargepoint
    if (req.mode === '/charge') {
      this._charge(req, res, next);
      return;
    }

    res.sendStatus(204);
    return;
  },

  _bmw(req, res, next) {
    const cmd = req.cmd;

    const bmw = new BmwModel();
    bmw.db = this.get('db');

    bmwapi.auth().then(() => {
      req.bmw = bmw;
      return bmw.fetch({
        query: {
          vin: req.bmw.vin,
        },
      });
    }).tap(() => {
      return bmwapi.sendStatusRequest(
        req.bmw.access_token,
        req.bmw.vin
      ).tap((data) => {
        bmw.setFromBmw(data.vehicleStatus);
      });
    }).tap(() => {
      return bmw.save();
    }).then(() => {
      switch (cmd) {
        case 'status':
          return `Status: ${bmw.get('updateReason')}`;
        case 'charge':
        case 'soc':
        case 'batt':
          return `SOC: ${bmw.get('chargingLevelHv')}%`;
        case 'fuel':
        case 'gas':
          const fuelPercent = ((bmw.get('remainingFuel') / bmw.get('maxFuel')) * 100).toFixed(0);
          return `Fuel: ${fuelPercent}%`;
        case 'door':
        case 'alarm':
          return `Door: ${bmw.get('doorLockState')}`;
        case 'plug':
          return `Plug: ${bmw.get('connectionStatus')} / ${bmw.get('chargingStatus')}`;
        case 'miles':
        case 'mileage':
        case 'mi':
          return `Miles: ${bmw.get('miles')}`;
        case 'map':
        case 'gps':
          // https://developers.google.com/maps/documentation/ios/urlscheme?hl=en
          return `comgooglemapsurl://maps.google.com/?q=${bmw.get('position.lat')},${bmw.get('position.lon')}`;
          // return `comgooglemaps://?center=${data.position.lat},${data.position.lon}`;
          // return `https://maps.google.com/maps?q=${data.position.lat},${data.position.lon}`;
        default:
          return 'Commands: status, soc, fuel, door, plug, miles, map';
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
      sort: [['updated_date', 'desc']],
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
          return 'Commands: status, power, energy, miles, time';
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

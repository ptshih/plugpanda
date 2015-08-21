// const _ = require('lodash');
const Muni = require('muni');
const request = require('../lib/request');

// Twilio
const twilio = require('twilio');

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

    return Muni.Promise.bind(this).then(() => {
      return request.send({
        url: `${nconf.get('HOST')}/api/car/status`,
      }).then((data) => {
        switch (cmd) {
          case 'charge':
          case 'soc':
          case 'batt':
            return `SOC: ${data.chargingLevelHv}%`;
          case 'fuel':
          case 'gas':
            const fuelPercent = ((data.maxFuel / data.remainingFuel) * 100).toFixed(0);
            return `Fuel: ${fuelPercent}%`;
          case 'door':
          case 'alarm':
            return `Door: ${data.doorLockState}`;
          case 'plug':
            return `Plug: ${data.connectionStatus} / ${data.chargingStatus}`;
          case 'miles':
          case 'mileage':
          case 'mi':
            return `Miles: ${data.miles}`;
          case 'kilometers':
          case 'km':
            return `Kilometers: ${data.kilometers}`;
          case 'map':
          case 'gps':
            // https://developers.google.com/maps/documentation/ios/urlscheme?hl=en
            return `comgooglemapsurl://maps.google.com/?q=${data.position.lat},${data.position.lon}`;
            // return `comgooglemaps://?center=${data.position.lat},${data.position.lon}`;
            // return `https://maps.google.com/maps?q=${data.position.lat},${data.position.lon}`;
          default:
            return `Commands: soc, fuel, door, plug, miles, kilometers, map`;
        }
      });
    }).then((message) => {
      res.message = message;
      this._twimlResponse(req, res, next);
    }).catch(next);
  },

  _charge(req, res, next) {
    const cmd = req.cmd;

    return Muni.Promise.bind(this).then(() => {
      return request.send({
        url: `${nconf.get('HOST')}/api/chargepoint/status`,
      }).then((data) => {
        switch (cmd) {
          case 'status':
            return `Status: ${data.status} / ${data.current_charging}`;
          case 'power':
          case 'kw':
            return `Power (kw): ${data.power_kw}`;
          case 'energy':
          case 'kwh':
            return `Energy (kwh): ${data.energy_kwh}`;
          case 'miles':
            const miles = data.miles_added.toFixed(2);
            return `Miles: ${miles}`;
          case 'time':
            let displayTime;
            const chargingTime = (data.charging_time / 1000 / 60).toFixed(0);
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
      });
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

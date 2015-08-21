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
    console.log(req.body);

    // Parse command from SMS
    const cmd = (req.body.Body || '').toLowerCase().trim();

    return Muni.Promise.bind(this).then(() => {
      return request.send({
        url: 'http://localhost:9001/api/car/status',
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
          default:
            return `Unknown Command`;
        }
      });
    }).then((message) => {
      const resp = new twilio.TwimlResponse();
      resp.message(message);
      res.writeHead(200, {
        'Content-Type': 'text/xml',
      });
      res.end(resp.toString());
    }).catch(next);
  },
});

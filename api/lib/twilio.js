const _ = require('lodash');
const Muni = require('muni');

// Twilio
const twilio = require('twilio');
const twilioClient = twilio(
  nconf.get('TWILIO_ACCOUNT_SID'),
  nconf.get('TWILIO_AUTH_TOKEN')
);

module.exports = {
  sendNotification: Muni.Promise.method(function(options) {
    options.from = options.from || '+14158861337';

    if (!_.isString(options.to)) {
      throw new Error('Missing Phone Number.');
    }

    if (!_.isString(options.body)) {
      throw new Error('Missing Notification Text.');
    }

    return twilioClient.sendMessage(options).then((body) => {
      console.log(`-----> SMS sent to: ${body.to} with SID: ${body.sid}.`);
      return body;
    });
  }),
};

const _ = require('lodash');
const Muni = require('muni');

// Twilio
const twilio = require('twilio');
const twilioClient = twilio(
  nconf.get('TWILIO_ACCOUNT_SID'),
  nconf.get('TWILIO_AUTH_TOKEN')
);
Muni.Promise.promisifyAll(twilioClient);

module.exports = {
  sendNotification: Muni.Promise.method(function(options) {
    options.to = options.to || '+18085183808';
    options.from = options.from || '+14158861337';

    if (!_.isString(options.body)) {
      throw new Error('Missing Notification Text.');
    }

    return twilioClient.sendMessage(options).tap((body) => {
      console.log(`-----> SMS sent to: ${options.to} with SID: ${body.sid}.`);
    });
  }),

  // UNUSED
  buildTwimlString(message = '') {
    const twiml = new twilio.TwimlResponse();
    twiml.message(message);
    return twiml.toString();
  },

};

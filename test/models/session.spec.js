const _ = require('lodash');
const SessionModel = require('../../api/models/session');

// TODO: stub `chargepoint` and `twilio` for this module

describe('Session Model', function() {
  let session;

  beforeEach(() => {
    session = new SessionModel();
  });

  // SCHEMA

  it('defaults', () => {
    const defaults = session.defaults();
    const expected = test.getFixtureJSON('session/defaults');
    defaults.created_date = expected.created_date;
    defaults.updated_date = expected.updated_date;
    assert.deepEqual(defaults, expected);
  });

  // PRIVATE

  it('_shouldStopSession - in_use / active', () => {
    const fixture = test.getFixtureJSON('session/status/in_use');
    const chargingStatus = fixture.charging_status;
    session.set(session._convertFromChargepoint(chargingStatus));
    session.set({
      status: 'on',
      max_power: session._calculateMaxPower(session.get('update_data')),
      average_power: session._calculateAveragePower(session.get('update_data')),
    });

    const boolean = session._shouldStopSession();
    assert.isFalse(boolean);
  });

  it('_shouldStopSession - in_use / trickle', () => {
    const fixture = test.getFixtureJSON('session/status/trickle');
    const chargingStatus = fixture.charging_status;
    session.set(session._convertFromChargepoint(chargingStatus));
    session.set({
      status: 'on',
      max_power: session._calculateMaxPower(session.get('update_data')),
      average_power: session._calculateAveragePower(session.get('update_data')),
    });

    const boolean = session._shouldStopSession();
    assert.isTrue(boolean);
  });

  it('_shouldStopSession - stopped', () => {
    const fixture = test.getFixtureJSON('session/status/stopped');
    const chargingStatus = fixture.charging_status;
    session.set(session._convertFromChargepoint(chargingStatus));
    session.set({
      status: 'stopping',
      max_power: session._calculateMaxPower(session.get('update_data')),
      average_power: session._calculateAveragePower(session.get('update_data')),
    });

    const boolean = session._shouldStopSession();
    assert.isFalse(boolean);
  });

  it('_shouldStopSession - done', () => {
    const fixture = test.getFixtureJSON('session/status/done');
    const chargingStatus = fixture.charging_status;
    session.set(session._convertFromChargepoint(chargingStatus));
    session.set({
      status: 'off',
      max_power: session._calculateMaxPower(session.get('update_data')),
      average_power: session._calculateAveragePower(session.get('update_data')),
    });

    const boolean = session._shouldStopSession();
    assert.isFalse(boolean);
  });

  it('_calculateMaxPower', () => {
    const fixture = test.getFixtureJSON('session/update_data');
    const maxPower = session._calculateMaxPower(fixture);
    assert.strictEqual(maxPower, 5.747995);
  });

  it('_calculateAveragePower', () => {
    const fixture = test.getFixtureJSON('session/update_data');
    const averagePower = session._calculateAveragePower(fixture);
    assert.strictEqual(averagePower, 5.671);
  });

  it('_convertFromChargepoint - in_use', () => {
    const fixture = test.getFixtureJSON('session/status/in_use');
    const expected = test.getFixtureJSON('session/status/expected/in_use');
    const chargingStatus = fixture.charging_status;

    const converted = session._convertFromChargepoint(chargingStatus);
    assert.deepEqual(converted, expected);
  });

  it('_convertFromChargepoint - stopped', () => {
    const fixture = test.getFixtureJSON('session/status/stopped');
    const expected = test.getFixtureJSON('session/status/expected/stopped');
    const chargingStatus = fixture.charging_status;

    const converted = session._convertFromChargepoint(chargingStatus);
    assert.deepEqual(converted, expected);
  });

  it('_convertFromChargepoint - done', () => {
    const fixture = test.getFixtureJSON('session/status/done');
    const expected = test.getFixtureJSON('session/status/expected/done');
    const chargingStatus = fixture.charging_status;

    const converted = session._convertFromChargepoint(chargingStatus);
    assert.deepEqual(converted, expected);
  });

  // PUBLIC

  it('isPaid - paid / free', () => {
    session.set('payment_type', 'paid');
    assert.isTrue(session.isPaid());

    session.set('payment_type', 'free');
    assert.isFalse(session.isPaid());
  });

  it('startSession', () => {
    session.startSession();
    assert.strictEqual(session.get('status'), 'on');
  });

  it('endSession', () => {
    session.endSession();
    assert.strictEqual(session.get('status'), 'off');
  });

  // TODO: need to stub `chargepoint`
  it.skip('stopSession', () => {
  });

  // TODO: need to stub `chargepoint`
  it.skip('stopSessionAck', () => {
  });

  // TODO: need to stub `session.save()`
  it.skip('saveFromChargepoint', () => {
  });
});

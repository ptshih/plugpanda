import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';

// Utils
import api from '../lib/api';

// Store
import Store from '../stores/store';

// Components
import Nav from './nav';
import Err from './err';
import InputTextFloatLabel from './partials/input-text-float-label';
import SelectFloatLabel from './partials/select-float-label';

// Mixins
import Fetch from '../mixins/fetch';

export default React.createClass({
  displayName: 'Account',

  propTypes: {
    params: React.PropTypes.object,
  },

  mixins: [Fetch],

  getInitialState() {
    return Store.getState('account');
  },

  componentDidMount() {
    Store.subscribe(this.onChange);
  },

  componentWillUnmount() {
    Store.unsubscribe(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(Store.getState('account'));
  },

  // Render

  onChangeCurrency() {
    // TODO: readonly for now
  },

  onChangeTimezone() {
    // TODO: readonly for now
  },

  onChangeCountry() {
    // TODO: readonly for now
  },

  onChangeName() {
    // TODO: readonly for now
  },

  onChangeEmail() {
    // TODO: readonly for now
  },

  onChangePhone() {
    // TODO: readonly for now
  },

  // Render

  getInformation() {
    return (
      <section>
        <div className="row">
          <div className="col-xs-12">
            <div className="row">
              <div className="col-xs-12">
                <h5>Your Information</h5>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <InputTextFloatLabel
                    label="Name"
                    value={this.state.data.name}
                    placeholder="Your Name"
                    onChange={this.onChangeName}
                  />
                </fieldset>
              </div>
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <InputTextFloatLabel
                    type="email"
                    label="Email"
                    value={this.state.data.email}
                    placeholder="Your Email"
                    onChange={this.onChangeEmail}
                  />
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  getSettings() {
    const currencyOptions = [{
      label: 'USD',
      value: 'usd',
    }, {
      label: 'CAD',
      value: 'cad',
    }];

    const timezoneOptions = [{
      label: 'UTC',
      value: 'utc',
    }, {
      label: 'PST',
      value: 'pst',
    }];

    return (
      <section>
        <div className="row">
          <div className="col-xs-12">
            <div className="row">
              <div className="col-xs-12">
                <h5>Your Settings</h5>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <SelectFloatLabel
                    label="Currency"
                    value={this.state.data.currency}
                    onChange={this.onChangeCurrency}
                    options={currencyOptions}
                  />
                </fieldset>
              </div>
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <SelectFloatLabel
                    label="Timezone"
                    value={_.get(this.state.data, 'timezone')}
                    onChange={this.onChangeTimezone}
                    options={timezoneOptions}
                  />
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  getChargepoint() {
    const userId = _.get(this.state.data, 'chargepoint.user_id');
    const authToken = _.get(this.state.data, 'chargepoint.auth_token');

    if (userId && authToken) {
      return (
        <section>
          <div className="row">
            <div className="col-xs-12">
              <h5>Chargepoint Account</h5>

              <div>Already Authenticated</div>
              <div>User ID: {userId}</div>
              <div>Auth Token: {authToken}</div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="row">
          <div className="col-xs-12">
            <div className="row">
              <div className="col-xs-12">
                <h5>Chargepoint Account</h5>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <InputTextFloatLabel
                    label="Email"
                    placeholder="your@email.com"
                  />
                </fieldset>
              </div>
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <InputTextFloatLabel
                    label="Password"
                    type="password"
                    placeholder="password"
                  />
                </fieldset>
              </div>
            </div>

            <div className="row">
              <div className="col-xs-12">
                <button className="btn btn-primary">Authenticate</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  getBMW() {
    const vin = _.get(this.state.data, 'bmw.vin');
    const accessToken = _.get(this.state.data, 'bmw.access_token');

    if (vin && accessToken) {
      return (
        <section>
          <div className="row">
            <div className="col-xs-12">
              <h5>BMW Account</h5>

              <div>Already Authenticated</div>
              <div>VIN: {vin}</div>
              <div>Access Token: {accessToken}</div>
            </div>
          </div>
        </section>
      );
    }

    // TODO
    return null;
  },

  getGetaround() {
    const deviceTrackingId = _.get(this.state.data, 'getaround.device_tracking_id');
    const sessionId = _.get(this.state.data, 'getaround.session_id');

    if (deviceTrackingId && sessionId) {
      return (
        <section>
          <div className="row">
            <div className="col-xs-12">
              <h5>Getaround Account</h5>

              <div>Already Authenticated</div>
              <div>Device Tracking ID: {deviceTrackingId}</div>
              <div>Session ID: {sessionId}</div>
            </div>
          </div>
        </section>
      );
    }

    // TODO
    return null;
  },

  getSubscription() {
    // Free plans
    if (this.state.data.plan === 'free') {
      return (
        <section>
          <div className="row">
            <div className="col-xs-12">
              <h5>Your Subscription</h5>
              <div>Hurray! You are on a <strong>FREE</strong> plan!</div>
            </div>
          </div>
        </section>
      );
    }

    // Has active subscription
    if (this.state.data.stripe.customer && this.state.data.stripe.subscription) {
      return (
        <section>
          <div className="row">
            <div className="col-xs-12">
              <h5>Your Subscription</h5>

              <div>Subscription Active</div>
              <div>Customer: {this.state.data.stripe.customer}</div>
              <div>Subscription: {this.state.data.stripe.subscription}</div>
            </div>
          </div>
        </section>
      );
    }

    // No active subscription
    return (
      <section>
        <div className="row">
          <div className="col-xs-12">
            <h5>Your Subscription</h5>

            <p>Subscription is not active.</p>
            <div>
              <button className="btn btn-primary">Start Subscription</button>
            </div>
          </div>
        </div>
      </section>
    );
  },

  getNotifications() {
    const countryOptions = [{
      label: 'United States',
      value: 'us',
    }, {
      label: 'Canada',
      value: 'CA',
    }];

    const formattedPhone = this._formatPhone(this.state.data.phone);

    return (
      <section>
        <div className="row">
          <div className="col-xs-12">
            <h5>Your Notifications</h5>

            <div className="row">
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <SelectFloatLabel
                    label="Country"
                    value={this.state.data.country}
                    onChange={this.onChangeCountry}
                    options={countryOptions}
                  />
                </fieldset>
              </div>
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <InputTextFloatLabel
                    label="Mobile Phone (SMS)"
                    placeholder="415-555-5555"
                    value={formattedPhone}
                    onChange={this.onChangePhone}
                  />
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  getContent() {
    if (!this.state.fetched) {
      return null;
    }

    if (this.state.error) {
      const params = {
        message: this.state.error,
      };
      return (
        <main className="Content">
          <Err params={params} />
        </main>
      );
    }

    return (
      <main className="Content">
        {this.getInformation()}
        {this.getSettings()}
        {this.getNotifications()}
        {this.getChargepoint()}
        {this.getBMW()}
        {this.getGetaround()}
        {this.getSubscription()}
        <section>
          <Link to="/logout">Sign Out</Link>
        </section>
      </main>
    );
  },

  render() {
    return (
      <div className="Component">
        <Nav title="Account" loading={!this.state.fetched} />
        {this.getContent()}
      </div>
    );
  },

  // Fetch

  fetch() {
    api.fetchAccount().then((data) => {
      Store.dispatch({
        type: 'FETCH',
        data: {
          account: {
            fetched: true,
            error: null,
            data: data,
          },
        },
      });
    }).catch((err) => {
      Store.dispatch({
        type: 'FETCH',
        data: {
          account: {
            fetched: true,
            error: err.message,
            data: {},
          },
        },
      });
    });
  },

  reset() {
    Store.dispatch({
      type: 'RESET',
      data: 'account',
    });
  },

  // Private

  _formatPhone(str = '') {
    const r = /(\D+)/g;
    const val = str.replace(r, '');
    const npa = val.substr(0, 3);
    const nxx = val.substr(3, 3);
    const last4 = val.substr(6, 4);
    return npa + '-' + nxx + '-' + last4;
  },
});

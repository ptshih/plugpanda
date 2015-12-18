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
    Store.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    Store.removeChangeListener(this.onChange);
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
                  value={this.state.data.timezone}
                  onChange={this.onChangeTimezone}
                  options={timezoneOptions}
                />
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    );
  },

  getChargepoint() {
    if (this.state.data.chargepoint.user_id && this.state.data.chargepoint.auth_token) {
      return (
        <div className="row">
          <div className="col-xs-12">
            <h5>Chargepoint Account</h5>

            <div>Already Authenticated</div>
            <div>User ID: {this.state.data.chargepoint.user_id}</div>
            <div>Auth Token: {this.state.data.chargepoint.auth_token}</div>
          </div>
        </div>
      );
    }

    return (
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
    );
  },

  getBMW() {
    if (this.state.data.bmw.vin && this.state.data.bmw.access_token) {
      return (
        <div className="row">
          <div className="col-xs-12">
            <h5>BMW Account</h5>

            <div>Already Authenticated</div>
            <div>VIN: {this.state.data.bmw.vin}</div>
            <div>Access Token: {this.state.data.bmw.access_token}</div>
          </div>
        </div>
      );
    }

    return null;
  },

  getSubscription() {
    // Free plans
    if (this.state.data.plan === 'free') {
      return (
        <div className="row">
          <div className="col-xs-12">
            <h5>Your Subscription</h5>
            <div>Hurray! You are on a <strong>FREE</strong> plan!</div>
          </div>
        </div>
      );
    }

    // Has active subscription
    if (this.state.data.stripe.customer && this.state.data.stripe.subscription) {
      return (
        <div className="row">
          <div className="col-xs-12">
            <h5>Your Subscription</h5>

            <div>Subscription Active</div>
            <div>Customer: {this.state.data.stripe.customer}</div>
            <div>Subscription: {this.state.data.stripe.subscription}</div>
          </div>
        </div>
      );
    }

    // No active subscription
    return (
      <div className="row">
        <div className="col-xs-12">
          <h5>Your Subscription</h5>

          <p>Subscription is not active.</p>
          <div>
            <button className="btn btn-primary">Start Subscription</button>
          </div>
        </div>
      </div>
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
        <section>{this.getInformation()}</section>
        <section>{this.getSettings()}</section>
        <section>{this.getNotifications()}</section>
        <section>{this.getChargepoint()}</section>
        <section>{this.getBMW()}</section>
        <section>{this.getSubscription()}</section>
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

  fetch() {
    return api.fetchAccount().then((data) => {
      Store.dispatch({
        type: 'FETCH',
        property: 'account',
        state: {
          fetched: true,
          error: null,
          data: data,
        },
      });
    }).catch((err) => {
      Store.dispatch({
        type: 'FETCH',
        property: 'account',
        state: {
          fetched: true,
          error: err.message,
          data: {},
        },
      });
    });
  },

  reset() {
    Store.dispatch({
      type: 'RESET',
      property: 'account',
    });
  },

  _formatPhone(str = '') {
    const r = /(\D+)/g;
    const val = str.replace(r, '');
    const npa = val.substr(0, 3);
    const nxx = val.substr(3, 3);
    const last4 = val.substr(6, 4);
    return npa + '-' + nxx + '-' + last4;
  },
});

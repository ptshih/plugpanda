import React from 'react';

// Utils
import auth from '../lib/auth';
import api from '../lib/api';

// Store and Actions
import AccountStore from '../stores/account-store';
import AccountActions from '../actions/account-actions';
const accountStore = new AccountStore();

// Components
// import {Link} from 'react-router';
import InputTextFloatLabel from './partials/input-text-float-label';
import SelectFloatLabel from './partials/select-float-label';

export default React.createClass({
  displayName: 'Account',

  statics: {
    fetch() {
      return api.fetchAccount().then((state) => {
        AccountActions.sync(state);
      });
    },

    willTransitionTo(transition) {
      if (!auth.isLoggedIn()) {
        transition.redirect('/login');
      }
    },
  },

  getInitialState() {
    return accountStore.getState();
  },

  componentDidMount() {
    accountStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    accountStore.removeChangeListener(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(accountStore.getState());
  },

  // Render

  onChangeCurrency() {
    // TODO: readonly for now
  },

  onChangeTimezone() {
    // TODO: readonly for now
  },

  onChangeName() {
    // TODO: readonly for now
  },

  onChangeEmail() {
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
                  value={this.state.name}
                  placeholder="Your Name"
                  onChange={this.onChangeName}
                />
              </fieldset>
            </div>
            <div className="col-md-6 col-xs-12">
              <fieldset className="form-group">
                <InputTextFloatLabel
                  label="Email"
                  value={this.state.email}
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
      label: 'usd',
      value: 'USD',
    }, {
      label: 'cad',
      value: 'CAD',
    }];

    const timezoneOptions = [{
      label: 'utc',
      value: 'UTC',
    }, {
      label: 'pst',
      value: 'PST',
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
                  value={this.state.currency}
                  onChange={this.onChangeCurrency}
                  options={currencyOptions}
                />
              </fieldset>
            </div>
            <div className="col-md-6 col-xs-12">
              <fieldset className="form-group">
                <SelectFloatLabel
                  label="Timezone"
                  value={this.state.timezone}
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
    if (this.state.chargepoint.user_id && this.state.chargepoint.auth_token) {
      return (
        <div className="row">
          <div className="col-xs-12">
            <h5>Chargepoint Account</h5>

            <div>Already Authenticated</div>
            <div>User ID: {this.state.chargepoint.user_id}</div>
            <div>Auth Token: {this.state.chargepoint.auth_token}</div>
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
    if (this.state.bmw.vin && this.state.bmw.access_token) {
      return (
        <div className="row">
          <div className="col-xs-12">
            <h5>BMW Account</h5>

            <div>Already Authenticated</div>
            <div>VIN: {this.state.bmw.vin}</div>
            <div>Access Token: {this.state.bmw.access_token}</div>
          </div>
        </div>
      );
    }

    return null;
  },

  getSubscription() {
    // Free plans
    if (this.state.plan === 'free') {
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
    if (this.state.stripe.customer && this.state.stripe.subscription) {
      return (
        <div className="row">
          <div className="col-xs-12">
            <h5>Your Subscription</h5>

            <div>Subscription Active</div>
            <div>Customer: {this.state.stripe.customer}</div>
            <div>Subscription: {this.state.stripe.subscription}</div>
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

  render() {
    return (
      <article>
        <section>{this.getInformation()}</section>
        <section>{this.getSettings()}</section>
        <section>{this.getChargepoint()}</section>
        <section>{this.getBMW()}</section>
        <section>{this.getSubscription()}</section>
      </article>
    );
  },
});

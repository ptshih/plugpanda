import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';

// Utils
import auth from '../lib/auth';

// Store
import store from '../stores/store';

// Container
import createContainer from './container';

// Components
import InputTextFloatLabel from './partials/input-text-float-label';
import SelectFloatLabel from './partials/select-float-label';

export default createContainer(React.createClass({
  displayName: 'Account',

  propTypes: {
    params: React.PropTypes.object,
    account: React.PropTypes.object,
  },

  // Handlers

  onUnimplemented(event) {
    event.preventDefault();
    alert('Feature not yet implemented.');
  },

  onSave(event) {
    event.preventDefault();

    store.dispatch({
      type: 'ACCOUNT_SAVE',
    });
  },

  onFlush(event) {
    event.preventDefault();

    store.dispatch({
      type: 'ACCOUNT_FLUSH',
    });
  },

  onChangeTimezone(event) {
    event.preventDefault();
    store.dispatch({
      type: 'ACCOUNT_CHANGE_TIMEZONE',
      data: event.target.value,
    });

    // Save after changing
    store.dispatch({
      type: 'ACCOUNT_SAVE_DEBOUNCED',
    });
  },

  onChangeName(event) {
    event.preventDefault();
    store.dispatch({
      type: 'ACCOUNT_CHANGE_NAME',
      data: event.target.value,
    });

    // Save after changing
    store.dispatch({
      type: 'ACCOUNT_SAVE_DEBOUNCED',
    });
  },

  onChangePhone(event) {
    event.preventDefault();
    store.dispatch({
      type: 'ACCOUNT_CHANGE_PHONE',
      data: event.target.value,
    });

    // Save after changing
    store.dispatch({
      type: 'ACCOUNT_SAVE_DEBOUNCED',
    });
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
                    value={this.props.account.name}
                    placeholder="Your Name"
                    onChange={this.onChangeName}
                    onBlur={this.onFlush}
                  />
                </fieldset>
              </div>
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <InputTextFloatLabel
                    type="email"
                    label="Email"
                    value={this.props.account.email}
                    placeholder="Your Email"
                    readOnly
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
    }];

    const timezoneOptions = [{
      label: 'UTC',
      value: 'utc',
    }, {
      label: 'PST',
      value: 'pst',
    }, {
      label: 'MST',
      value: 'mst',
    }, {
      label: 'CST',
      value: 'cst',
    }, {
      label: 'EST',
      value: 'est',
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
                    value={this.props.account.currency}
                    options={currencyOptions}
                    readOnly
                  />
                </fieldset>
              </div>
              <div className="col-md-6 col-xs-12">
                <fieldset className="form-group">
                  <SelectFloatLabel
                    label="Timezone"
                    value={_.get(this.props.account, 'timezone')}
                    options={timezoneOptions}
                    onChange={this.onChangeTimezone}
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
    if (auth.isWaitlisted()) {
      return null;
    }

    const userId = _.get(this.props.account, 'chargepoint.user_id');
    const authToken = _.get(this.props.account, 'chargepoint.auth_token');

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

    // TODO: move to component
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
                <button className="btn btn-primary m-t-1">Authenticate</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  getBmw() {
    const vin = _.get(this.props.account, 'bmw.vin');
    const accessToken = _.get(this.props.account, 'bmw.access_token');

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
    const deviceTrackingId = _.get(this.props.account, 'getaround.device_tracking_id');
    const sessionId = _.get(this.props.account, 'getaround.session_id');

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
    if (this.props.account.plan === 'free') {
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
    if (this.props.account.stripe.customer && this.props.account.stripe.subscription) {
      return (
        <section>
          <div className="row">
            <div className="col-xs-12">
              <h5>Your Subscription</h5>

              <div>Subscription Active</div>
              <div>Customer: {this.props.account.stripe.customer}</div>
              <div>Subscription: {this.props.account.stripe.subscription}</div>
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
    }];

    const formattedPhone = this._formatPhone(this.props.account.phone);

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
                    value={this.props.account.country}
                    options={countryOptions}
                    readOnly
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
                    onBlur={this.onFlush}
                  />
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  getAdmin() {
    if (!auth.isAdmin()) {
      return null;
    }

    return (
      <section>
        <div><a href="#" onClick={this.onSave}>Save Changes</a></div>
        <div><a href="#" onClick={this.onUnimplemented}>Change Password</a></div>
      </section>
    );
  },

  render() {
    return (
      <article>
        {this.getInformation()}
        {this.getSettings()}
        {this.getNotifications()}
        {this.getChargepoint()}
        {this.getBmw()}
        {this.getGetaround()}
        {this.getSubscription()}
        {this.getAdmin()}
        <section>
          <div><Link to="/logout">Sign Out</Link></div>
        </section>
      </article>
    );
  },

  // Private

  _formatPhone(str) {
    if (!_.isString(str)) {
      return '';
    }

    const r = /(\D+)/g;
    const val = str.replace(r, '');
    const npa = val.substr(0, 3);
    const nxx = val.substr(3, 3);
    const last4 = val.substr(6, 4);

    const formattedPhone = [];
    if (npa) {
      formattedPhone.push(npa);
    }
    if (nxx) {
      formattedPhone.push(nxx);
    }
    if (last4) {
      formattedPhone.push(last4);
    }

    return formattedPhone.join('-');
  },
}), {
  title: 'Account',
  fetchHandler: 'fetchAccount',
  storeKey: 'account',
});

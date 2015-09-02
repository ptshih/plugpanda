import React from 'react';

// API
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
    fetch(params, query) {
      return api.fetchAccount().then((state) => {
        AccountActions.sync(state);
      });
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

  render() {
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
      <div className="Section">
        <div className="row-margin">
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

        <div className="row-margin">
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
    );
  },
});

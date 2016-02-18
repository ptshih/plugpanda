import React from 'react';

// Utils
import api from '../lib/api';

// Store
import store from '../stores/store';

// Components
import InputTextFloatLabel from './partials/input-text-float-label';

export default React.createClass({
  displayName: 'ForgotPassword',

  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      email: null,
      message: null,
      disabled: false,
    };
  },

  componentDidMount() {
    store.dispatch({
      type: 'NAV_TITLE',
      data: 'Forgot Your Password',
    });
  },

  componentWillUnmount() {
    store.dispatch({
      type: 'NAV_TITLE',
    });
  },

  // Handlers

  onLogin(event) {
    event.preventDefault();
    this.context.router.push('/login');
  },

  onChangeEmail(event) {
    event.preventDefault();
    this.setState({
      email: event.target.value,
    });
  },

  onForgotPassword(event) {
    event.preventDefault();
    this.setState({
      disabled: true,
      message: null,
    });

    // Start loading
    store.dispatch({
      type: 'NAV_LOADING',
      data: true,
    });

    return api.forgotPassword(this.state.email).finally(() => {
      // Stop loading
      store.dispatch({
        type: 'NAV_LOADING',
        data: false,
      });
    }).then((email) => {
      this.setState({
        disabled: false,
        message: `An email with instructions on resetting your password has been sent to ${email}.`,
      });
      return null;
    }).catch((err) => {
      this.setState({
        disabled: false,
        message: err.message,
      });
    });
  },

  // Render

  getMessage() {
    if (!this.state.message) {
      return null;
    }

    return <div className="u-alert u-alert-info">{this.state.message}</div>;
  },

  render() {
    return (
      <form>
        <section>
          <div className="row">
            <div className="col-xs-12">
              <fieldset className="form-group">
                <InputTextFloatLabel
                  type="email"
                  label="Email"
                  value={this.state.email}
                  placeholder="Email"
                  onChange={this.onChangeEmail}
                  disabled={this.state.disabled}
                />
              </fieldset>
            </div>
          </div>

          <div className="row m-t-1">
            <div className="col-xs-12">
              {this.getMessage()}
              <button
                type="submit"
                className="btn btn-primary"
                onClick={this.onForgotPassword}
                disabled={this.state.disabled}
              >Forgot Your Password</button>
              &nbsp;&nbsp;or&nbsp;&nbsp;
              <span className="u-link" onClick={this.onLogin}>I remember my password</span>
            </div>
          </div>
        </section>
      </form>
    );
  },
});

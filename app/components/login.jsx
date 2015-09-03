import React from 'react';

// Utils
import api from '../lib/api';

// Components
import {Navigation} from 'react-router';
import InputTextFloatLabel from './partials/input-text-float-label';

export default React.createClass({
  displayName: 'Login',

  propTypes: {
  },

  mixins: [Navigation],

  getInitialState() {
    return {
      email: null,
      password: null,
      message: null,
      error: false,
      disabled: false,
    };
  },

  // Handlers

  onChangeEmail(e) {
    e.preventDefault();
    this.setState({
      email: e.target.value,
    });
  },

  onChangePassword(e) {
    e.preventDefault();
    this.setState({
      password: e.target.value,
    });
  },

  onLogin(e) {
    e.preventDefault();
    this.setState({
      disabled: true,
      error: false,
      message: null,
    });

    return api.login(this.state.email, this.state.password).then((user) => {
      console.log(`Logged in: ${user.email}`);
      this.transitionTo('/');
    }).catch((err) => {
      console.log('Error logging in...', err);
      this.setState({
        disabled: false,
        error: true,
        message: err.message,
      });
    });
  },

  // Render

  getMessage() {
    if (!this.state.error) {
      return null;
    }

    return <div className="Login-message Login-message--error">{this.state.message}</div>;
  },

  render() {
    return (
      <article>
        <form>
          <section>
            <div className="row">
              <div className="col-xs-12">
                <fieldset className="form-group">
                  <InputTextFloatLabel
                    type="text"
                    label="Email"
                    value={this.state.email}
                    placeholder="Email"
                    onChange={this.onChangeEmail}
                    disabled={this.state.disabled}
                  />
                </fieldset>
              </div>
            </div>

            <div className="row">
              <div className="col-xs-12">
                <fieldset className="form-group">
                  <InputTextFloatLabel
                    type="password"
                    label="Password"
                    value={this.state.password}
                    placeholder="Password"
                    onChange={this.onChangePassword}
                    disabled={this.state.disabled}
                  />
                </fieldset>
              </div>
            </div>

            <div className="Login--submit row">
              <div className="col-xs-12">
                {this.getMessage()}
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={this.onLogin}
                  disabled={this.state.disabled}
                >Login</button>
              </div>
            </div>
          </section>
        </form>
      </article>
    );
  },
});

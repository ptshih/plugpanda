import React from 'react';

// Utils
import api from '../lib/api';

// Components
import Nav from './nav';
import InputTextFloatLabel from './partials/input-text-float-label';

export default React.createClass({
  displayName: 'Register',

  propTypes: {
    history: React.PropTypes.object,
  },

  getInitialState() {
    return {
      email: null,
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

  onRegister(e) {
    e.preventDefault();
    this.setState({
      disabled: true,
      error: false,
      message: null,
    });

    return api.register(this.state.email, this.state.password).then(() => {
      this.props.history.push('/dashboard');
    }).catch((err) => {
      this.setState({
        disabled: false,
        error: true,
        message: err.message,
      });
    });
  },

  onLogin(e) {
    e.preventDefault();
    this.props.history.push('/login');
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
      <div className="Component">
        <Nav title="Sign Up" />
        <main className="Content">
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

              <div className="Login--submit row">
                <div className="col-xs-12">
                  {this.getMessage()}
                  <button
                    type="submit"
                    className="btn btn-success"
                    onClick={this.onRegister}
                    disabled={this.state.disabled}
                  >Sign Up</button>
                  &nbsp;&nbsp;or&nbsp;&nbsp;
                  <span className="Login-register" onClick={this.onLogin}>Sign in with an existing account</span>
                </div>
              </div>
            </section>
          </form>
        </main>
      </div>
    );
  },
});

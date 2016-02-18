import React from 'react';

// Utils
import api from '../lib/api';

// Store
import store from '../stores/store';

// Components
import InputTextFloatLabel from './partials/input-text-float-label';

export default React.createClass({
  displayName: 'ResetPassword',

  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      token: null,
      password: null,
      message: null,
      disabled: false,
    };
  },

  componentWillMount() {
    this.setState({
      token: _.get(this.props, 'location.query.token'),
    });
  },

  componentDidMount() {
    store.dispatch({
      type: 'NAV_TITLE',
      data: 'Reset Your Password',
    });
  },

  componentWillUnmount() {
    store.dispatch({
      type: 'NAV_TITLE',
    });
  },

  // Handlers

  onChangePassword(event) {
    event.preventDefault();
    this.setState({
      password: event.target.value,
    });
  },

  onResetPassword(event) {
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

    return api.resetPassword(this.state.token, this.state.password).finally(() => {
      // Stop loading
      store.dispatch({
        type: 'NAV_LOADING',
        data: false,
      });
    }).then(() => {
      this.context.router.push('/dashboard');
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

          <div className="row m-t-1">
            <div className="col-xs-12">
              {this.getMessage()}
              <button
                type="submit"
                className="btn btn-primary"
                onClick={this.onResetPassword}
                disabled={this.state.disabled}
              >Reset Your Password</button>
            </div>
          </div>
        </section>
      </form>
    );
  },
});

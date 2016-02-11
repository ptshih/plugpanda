import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';

// Store
import store from '../stores/store';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Nav',

  propTypes: {
    location: React.PropTypes.object,
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return store.getState();
  },

  // Lifecycle

  componentDidMount() {
    // Subscribe to changes in the store
    store.subscribe(this.onChange);
  },

  componentWillUnmount() {
    store.unsubscribe(this.onChange);
  },

  // Handlers

  onChange() {
    this.setState(store.getState());
  },

  onClickCollapse(event) {
    event.preventDefault();

    store.dispatch({
      type: 'NAV_COLLAPSE',
      data: !this.state.collapse,
    });
  },

  onBack() {
    const parentPath = _.get(this.props, 'location.state.parentPath', '/dashboard');
    const action = _.get(this.props, 'location.action', 'POP').toLowerCase();
    if (action === 'push') {
      this.context.router.goBack();
    } else {
      this.context.router.push(parentPath);
    }
  },

  // Render

  getRoot() {
    if (auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/">Plug Panda</Link>
    );
  },

  getFAQ() {
    if (auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/faq">How It Works</Link>
    );
  },

  getDashboard() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/dashboard">Dashboard</Link>
    );
  },

  getCar() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    if (!auth.getFeatures('car')) {
      return null;
    }

    if (auth.getFeatures('waitlisted')) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/car">Car</Link>
    );
  },

  getSessions() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    if (!auth.getFeatures('chargepoint')) {
      return null;
    }

    if (auth.getFeatures('waitlisted')) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/sessions">Sessions</Link>
    );
  },

  getAccount() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/account">Account</Link>
    );
  },

  getWaitlist() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    if (!auth.getFeatures('admin')) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/waitlist">Waitlist</Link>
    );
  },

  getLogin() {
    if (auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/login">Sign In</Link>
    );
  },

  getHamburger() {
    if (this.state.loading) {
      return <div className="Hamburger-spinner" />;
    }

    if (_.get(this.props, 'location.state.parentPath')) {
      return <div className="Hamburger-back" onClick={this.onBack} />;
    }

    return <div className="Hamburger-menu" onClick={this.onClickCollapse} />;
  },

  render() {
    const headerClassName = ['Header', !this.state.collapse ? 'Header-expand' : ''].join(' ');

    return (
      <header className={headerClassName}>
        <nav className="Nav">
          <figure className="Hamburger navbar-toggler pull-left">
            {this.getHamburger()}
          </figure>

          <div className="Nav-title">{this.state.title}</div>
        </nav>

        <div className="Navbar" onClick={this.onClickCollapse}>
          {this.getRoot()}
          {this.getFAQ()}
          {this.getDashboard()}
          {this.getCar()}
          {this.getSessions()}
          {this.getWaitlist()}
          {this.getAccount()}
          {this.getLogin()}
        </div>
      </header>
    );
  },
});

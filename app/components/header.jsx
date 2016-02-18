import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';

// Store
import store from '../stores/store';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Header',

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
      <Link className="navbar__link" to="/">Plug Panda</Link>
    );
  },

  getFAQ() {
    if (auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="navbar__link" to="/faq">How It Works</Link>
    );
  },

  getDashboard() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="navbar__link" to="/dashboard">Dashboard</Link>
    );
  },

  getBmw() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    if (!auth.getFeatures('bmw')) {
      return null;
    }

    if (auth.getFeatures('waitlisted')) {
      return null;
    }

    return (
      <Link className="navbar__link" to="/bmw">BMW</Link>
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
      <Link className="navbar__link" to="/sessions">Sessions</Link>
    );
  },

  getAccount() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="navbar__link" to="/account">Account</Link>
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
      <Link className="navbar__link" to="/waitlist">Waitlist</Link>
    );
  },

  getLogin() {
    if (auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="navbar__link" to="/login">Sign In</Link>
    );
  },

  getHamburger() {
    if (this.state.loading) {
      return <div className="hamburger__button hamburger__button--spinner" />;
    }

    if (_.get(this.props, 'location.state.parentPath')) {
      return <div className="hamburger__button hamburger__button--back" onClick={this.onBack} />;
    }

    return <div className="hamburger__button hamburger__button--menu" onClick={this.onClickCollapse} />;
  },

  render() {
    const headerClassName = ['header', !this.state.collapse ? 'header--expand' : ''].join(' ');

    return (
      <header className={headerClassName}>
        <nav className="nav">
          <figure className="hamburger navbar-toggler pull-left">
            {this.getHamburger()}
          </figure>

          <div className="nav__title">{this.state.title}</div>
        </nav>

        <div className="navbar" onClick={this.onClickCollapse}>
          {this.getRoot()}
          {this.getFAQ()}
          {this.getDashboard()}
          {this.getBmw()}
          {this.getSessions()}
          {this.getWaitlist()}
          {this.getAccount()}
          {this.getLogin()}
        </div>
      </header>
    );
  },
});

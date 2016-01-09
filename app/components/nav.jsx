import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Nav',

  propTypes: {
    params: React.PropTypes.object,
    location: React.PropTypes.object,
    history: React.PropTypes.object,
    title: React.PropTypes.string,
    loading: React.PropTypes.bool,
  },

  getInitialState() {
    return {
      title: 'Plug Panda',
      collapse: true,
      loading: false,
    };
  },

  // Lifecycle

  componentWillMount() {
    this.setState({
      title: this.props.title,
      collapse: true,
      loading: !!this.props.loading ? true : false,
    });
  },

  componentWillReceiveProps(nextProps) {
    // Reset collapse state when changing routes
    this.setState({
      title: nextProps.title,
      collapse: true,
      loading: !!nextProps.loading ? true : false,
    });
  },

  // Handlers

  onClickCollapse(e) {
    e.preventDefault();

    const collapse = !this.state.collapse;

    // Update collapse state
    this.setState({
      collapse: collapse,
    });
  },

  onBack() {
    const parentPath = _.get(this.props, 'location.state.parentPath', '/dashboard');
    const action = _.get(this.props, 'location.action', 'POP').toLowerCase();
    if (action === 'push') {
      this.props.history.goBack();
    } else {
      this.props.history.push(parentPath);
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

        <div className="Navbar">
          {this.getRoot()}
          {this.getFAQ()}
          {this.getDashboard()}
          {this.getCar()}
          {this.getSessions()}
          {this.getAccount()}
          {this.getLogin()}
        </div>
      </header>
    );
  },
});

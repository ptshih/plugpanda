import React from 'react';
import {Link} from 'react-router';
import NavLink from './nav-link';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Nav',

  getInitialState() {
    return {
      collapse: true,
    };
  },

  componentWillReceiveProps() {
    // Reset collapse state when changing routes
    this.setState({
      collapse: true,
    });
  },

  // Handlers

  onClickCollapse(e) {
    e.preventDefault();

    this.setState({
      collapse: !this.state.collapse,
    });
  },

  // Render

  getCar() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <NavLink to="/car">Car</NavLink>
    );
  },

  getSession() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <NavLink to="/sessions/current">Session</NavLink>
    );
  },

  getHistory() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <NavLink to="/sessions">History</NavLink>
    );
  },

  getAccount() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <NavLink to="/account">Account</NavLink>
    );
  },

  getLogin() {
    if (auth.isLoggedIn()) {
      return null;
    }

    return (
      <NavLink to="/login" className="nav-link-bordered pull-right">Sign In</NavLink>
    );
  },

  render() {
    const navbarClassName = ['navbar-toggleable-xs', 'collapse', !this.state.collapse ? 'in' : ''].join(' ');

    return (
      <header className="navbar navbar-light bg-faded">
        <div className="clearfix">
          <button className="navbar-toggler pull-right hidden-sm-up" onClick={this.onClickCollapse}>
            ☰
          </button>
          <Link to="/" className="navbar-brand hidden-sm-up">PlugPanda</Link>
        </div>
        <div className={navbarClassName}>
          <nav className="nav navbar-nav">
            <NavLink to="/">PlugPanda</NavLink>
            {this.getCar()}
            {this.getSession()}
            {this.getHistory()}
            {this.getAccount()}
            {this.getLogin()}
          </nav>
        </div>
      </header>
    );
  },
});

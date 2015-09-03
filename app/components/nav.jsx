import React from 'react';
import NavLink from './nav-link';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Nav',

  // Render

  getCar() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <li className="nav-item">
        <NavLink to="/car">Car</NavLink>
      </li>
    );
  },

  getSession() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <li className="nav-item">
        <NavLink to="/sessions/current">Session</NavLink>
      </li>
    );
  },

  getHistory() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <li className="nav-item">
        <NavLink to="/sessions">History</NavLink>
      </li>
    );
  },

  getAccount() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <li className="nav-item">
        <NavLink to="/account">Account</NavLink>
      </li>
    );
  },

  getLoginLogout() {
    if (!auth.isLoggedIn()) {
      return (
        <li className="nav-item">
          <NavLink to="/login">Login</NavLink>
        </li>
      );
    }

    return (
      <li className="nav-item">
        <NavLink to="/logout">Logout</NavLink>
      </li>
    );
  },

  render() {
    return (
      <nav className="navbar navbar-light bg-faded">
        <ul className="nav navbar-nav">
          <li className="nav-item">
            <NavLink to="/">Home</NavLink>
          </li>
          {this.getCar()}
          {this.getSession()}
          {this.getHistory()}
          {this.getAccount()}
          {this.getLoginLogout()}
        </ul>
      </nav>
    );
  },
});

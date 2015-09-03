import React from 'react';
import NavLink from './nav-link';

export default React.createClass({
  displayName: 'Nav',

  propTypes: {
  },

  getDefaultProps() {
    return {
    };
  },

  // Render

  render() {
    return (
      <nav className="navbar navbar-light bg-faded">
        <ul className="nav navbar-nav">
          <li className="nav-item">
            <NavLink to="root">Home</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="car">Car</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="session" params={{session_id: 'current'}}>Session</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="history">History</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="account">Account</NavLink>
          </li>
        </ul>
      </nav>
    );
  },

  // Private

});

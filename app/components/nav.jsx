import React from 'react';
import {Link} from 'react-router';
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
        <Link to="root" className="navbar-brand">Home</Link>
        <ul className="nav navbar-nav">
          <li className="nav-item">
            <NavLink to="car">Car</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="session" params={{session_id: 'current'}}>Session</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="history">History</NavLink>
          </li>
        </ul>
      </nav>
    );
  },

  // Private

});

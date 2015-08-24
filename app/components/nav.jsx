import React from 'react';
import {Link} from 'react-router';

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
            <Link to="car" className="nav-link">Car</Link>
          </li>
          <li className="nav-item">
            <Link to="session" params={{session_id: 'current'}} className="nav-link">Session</Link>
          </li>
          <li className="nav-item">
            <Link to="history" className="nav-link">History</Link>
          </li>
        </ul>
      </nav>
    );
  },

  // Private

});

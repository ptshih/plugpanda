/**
 * This is a Controller/Container View for route: `/`
 */

import React from 'react';

// Components
import {Link} from 'react-router';

export default React.createClass({
  displayName: 'Root',

  // Render

  render() {
    return (
      <div className="Section container-fluid">
        <h2>Welcome to Plug Panda Beta</h2>
        <ul>
          <li><Link to="car">Car Status</Link></li>
          <li><Link to="session" params={{session_id: 'current'}}>Current Session</Link></li>
          <li><Link to="history">Charging History</Link></li>
        </ul>

      </div>
    );
  },
});

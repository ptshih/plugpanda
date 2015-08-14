/**
 * This is a Controller/Container View for route: `/`
 */

import React from 'react';

// Components
// import {Link} from 'react-router';

export default React.createClass({
  displayName: 'Status',

  statics: {
    willTransitionTo(transition, params, query, callback) {
      transition.redirect('root');
      callback();
    },
  },

  // Render

  render() {
    return (
      <div className="Status">
        <h2>Panda Status</h2>
      </div>
    );
  },
});

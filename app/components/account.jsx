import React from 'react';

// API
import api from '../lib/api';

// Components
// import {Link} from 'react-router';

export default React.createClass({
  displayName: 'Account',

  statics: {
    fetch(params, query) {
      return api.fetchAccount().then((state) => {
        console.log(state);
      });
    },
  },

  // Render

  render() {
    return (
      <div className="Section">
        <p>TBD</p>
      </div>
    );
  },
});

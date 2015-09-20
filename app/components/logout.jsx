import React from 'react';

// Utils
import auth from '../lib/auth';

// Components
import {History} from 'react-router';

export default React.createClass({
  displayName: 'Logout',

  mixins: [History],

  componentDidMount() {
    auth.removeAccessToken();
    this.history.pushState(null, '/');
  },

  // Handlers

  // Render

  render() {
    return (
      <div className="Component">
      </div>
    );
  },
});

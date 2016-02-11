import React from 'react';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Logout',

  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  // Lifecycle

  componentDidMount() {
    auth.removeAccessToken();
    auth.removeFeatures();
    this.context.router.push('/');
  },

  // Handlers

  // Render

  render() {
    return (
      <div></div>
    );
  },
});

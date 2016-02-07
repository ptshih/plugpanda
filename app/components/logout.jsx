import React from 'react';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Logout',

  propTypes: {
    history: React.PropTypes.object,
  },

  // Lifecycle

  componentDidMount() {
    auth.removeAccessToken();
    auth.removeFeatures();
    this.props.history.push('/');
  },

  // Handlers

  // Render

  render() {
    return (
      <div></div>
    );
  },
});

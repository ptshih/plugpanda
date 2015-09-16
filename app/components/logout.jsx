import React from 'react';

// Utils
import auth from '../lib/auth';

// Components
import {Navigation} from 'react-router';

export default React.createClass({
  displayName: 'Logout',

  mixins: [Navigation],

  componentDidMount() {
    auth.removeAccessToken();
    this.transitionTo('/');
  },

  // Handlers

  // Render

  render() {
    return (
      <article className="Content">
      </article>
    );
  },
});

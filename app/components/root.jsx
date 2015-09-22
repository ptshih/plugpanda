import React from 'react';

// Components
import Nav from './nav';

// Notes
// Show estimated trickle savings from last charging session
// Show estimated trickle savings from last week/month
// Show total $ for last session and last week/month

export default React.createClass({
  displayName: 'Dashboard',

  // Render

  getContent() {
    return (
      <main className="Content">
        <section>
          Nothing to see here yet...
        </section>
      </main>
    );
  },

  render() {
    return (
      <div className="Component">
        <Nav title="Dashboard" />
        {this.getContent()}
      </div>
    );
  },

});

import React from 'react';

// Components
import Nav from './nav';

// Notes
// If there is an active session, show summary and link to it here
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
          <h5>Active Charging Sessions</h5>
          <div>701 China Basin St, San Francisco</div>
        </section>

        <section>
          <h5>Savings</h5>
          <div>You saved $0.87 today.</div>
          <div>You saved $5.68 this week.</div>
          <div>You saved $13.37 this month.</div>
        </section>

        <section>
          <h5>Frequently Used Stations</h5>
          <div>701 China Basin St, San Francisco</div>
          <div>444 Stockton St, San Francisco</div>
          <div>329 Miller Ave, South San Francisco</div>
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

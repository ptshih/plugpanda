import React from 'react';

// Utils
import auth from '../lib/auth';
import api from '../lib/api';

// Container
import createContainer from './container';

// Notes
// If there is an active session, show summary and link to it here
// Show estimated trickle savings from last charging session
// Show estimated trickle savings from last week/month
// Show total $ for last session and last week/month

export default createContainer(React.createClass({
  displayName: 'Dashboard',

  getInitialState() {
    return {
      position: 0,
    };
  },

  componentDidMount() {
    // Fetch from remote
    api.fetchWaitlistPosition().then((data) => {
      this.setState({
        position: data.position,
      });
    });
  },

  // Render

  getWaitlisted() {
    const position = this.state.position > 0 ? this.state.position : '';
    return (
      <section>
        <h4>Hey there, thanks for being interested in Plug Panda!</h4>
        <p>We're trying our best to get as many people up and running as fast as possible.</p>
        <p>Your current place in line is: <strong>{position}</strong></p>
        <p>
          We'll contact you via email once we're ready to get you started.<br />
          Until then, if you have any questions, please email us at: <a href="mailto:help@plugpanda.com">help@plugpanda.com</a>.
        </p>
      </section>
    );
  },


  render() {
    // Show waitlisted status
    if (auth.isWaitlisted()) {
      return this.getWaitlisted();
    }

    return (
      <div>
        <section>
          <h5>Active Charging Sessions</h5>
          <div>1 Market St, San Francisco, CA</div>
        </section>

        <section>
          <h5>Savings</h5>
          <div>You saved $0.87 today.</div>
          <div>You saved $5.68 this week.</div>
          <div>You saved $13.37 this month.</div>
        </section>

        <section>
          <h5>Frequently Used Stations</h5>
          <div>1 Market St, San Francisco, CA</div>
          <div>444 Stockton St, San Francisco, CA</div>
          <div>329 Miller Ave, South San Francisco, CA</div>
        </section>
      </div>
    );
  },

}), {
  title: 'Dashboard',
});

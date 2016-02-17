import React from 'react';

// Utils
import auth from '../lib/auth';
import api from '../lib/api';

// Container
import createContainer from './container';

// Components
import Table from './partials/table';

// Notes
// If there is an active session, show summary and link to it here
// Show estimated trickle savings from last charging session
// Show estimated trickle savings from last week/month
// Show total $ for last session and last week/month

export default createContainer(React.createClass({
  displayName: 'Dashboard',

  propTypes: {
    dashboard: React.PropTypes.object,
  },

  getInitialState() {
    return {
      position: 0,
    };
  },

  componentDidMount() {
    if (auth.isWaitlisted()) {
      // Fetch from remote
      api.fetchWaitlistPosition().then((data) => {
        this.setState({
          position: data.position,
        });
        return null;
      });
    }
  },

  // Render

  getWaitlisted() {
    const position = this.state.position > 0 ? this.state.position : '';
    return (
      <section>
        <h4>Hey there, thanks for being interested in Plug Panda!</h4>
        <p className="lead">We're trying our best to get as many people up and running as fast as possible.</p>
        <p className="lead">Your current place in line is: <strong>{position}</strong></p>
        <p>
          We'll contact you via email once we're ready to get you started.<br />
          Until then, if you have any questions, please email us at: <a href="mailto:help@plugpanda.com">help@plugpanda.com</a>.
        </p>
      </section>
    );
  },

  getActiveChargingSession() {
    if (_.isEmpty(this.props.dashboard.active_session)) {
      return null;
    }

    return (
      <section>
        <h4>Active Charging Sessions</h4>
      </section>
    );
  },

  getFrequentlyUsedStations() {
    const stations = [];
    _.each(this.props.dashboard.stations, (station) => {
      stations.push([
        `${station.address}, ${station.city}`,
        station.payment_type,
        station.count,
      ]);
    });

    return (
      <section>
        <Table
          rows={stations}
          headers={[['Frequently Used Stations', 'Fee', 'Visits']]}
        />
      </section>
    );
  },

  getActivity() {
    return (
      <article>
        {this.getActiveChargingSession()}
        {this.getFrequentlyUsedStations()}
      </article>
    );
  },


  render() {
    // Show waitlisted status
    if (auth.isWaitlisted()) {
      return this.getWaitlisted();
    }

    return this.getActivity();
  },

}), {
  title: 'Dashboard',
  fetchHandler: 'fetchDashboard',
  storeKey: 'dashboard',
});

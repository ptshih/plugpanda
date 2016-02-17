import React from 'react';
import moment from 'moment';
import {Link} from 'react-router';

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
    const activeSession = _.get(this.props, 'dashboard.active_session');
    if (_.isEmpty(activeSession)) {
      return null;
    }

    let status;
    if (activeSession.status === 'on') {
      status = 'Session is actively charging';
    } else if (activeSession.status === 'starting') {
      status = 'Session is starting but not actively charging';
    } else if (activeSession.status === 'stopping') {
      status = 'Session is stopped and not actively charging';
    } else {
      status = 'Session is not actively charging';
    }

    const displayDate = moment(activeSession.created_date).calendar(null, {
      lastDay: '[Yesterday] [at] HH:MM',
      sameDay: '[Today] [at] HH:MM',
      nextDay: '[Tomorrow] [at] HH:MM',
      lastWeek: 'MM/DD [at] HH:MM',
      nextWeek: 'MM/DD [at] HH:MM',
      sameElse: 'MM/DD [at] HH:MM',
    });

    return (
      <section>
        <div><strong>Active Charging Sessions</strong></div>
        <div>
          <Link
            to={{
              pathname: `/sessions/${activeSession.session_id}`,
              state: {parentPath: '/dashboard'},
            }}
          >
            {status}
          </Link>
        </div>
        <div>{displayDate}</div>
        <div>{`${activeSession.address1} in ${activeSession.city}`}</div>
      </section>
    );
  },

  getFrequentlyUsedStations() {
    const stations = [];
    _.each(this.props.dashboard.frequent_stations, (station) => {
      stations.push([
        `${station.address} in ${station.city}`,
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

import React from 'react';
import moment from 'moment';

// Utils
// import math from '../../lib/math';

export default React.createClass({
  displayName: 'WaitlistCell',

  propTypes: {
    position: React.PropTypes.number.isRequired,
    waitlistUser: React.PropTypes.object.isRequired,
  },

  // Handlers

  // Render

  render() {
    const waitlistedDate = moment(this.props.waitlistUser.waitlisted_date).calendar(null, {
      lastDay: '[Yesterday] [at] HH:MM',
      sameDay: '[Today] [at] HH:MM',
      nextDay: '[Tomorrow] [at] HH:MM',
      lastWeek: 'MM/DD [at] HH:MM',
      nextWeek: 'MM/DD [at] HH:MM',
      sameElse: 'MM/DD [at] HH:MM',
    });

    const waitlistedPosition = this.props.position + 1;

    return (
      <tr>
        <td>
          {this.props.waitlistUser.name}
        </td>
        <td>
          {this.props.waitlistUser.email}
        </td>
        <td>
          {waitlistedDate}
        </td>
        <td>
          {waitlistedPosition}
        </td>
      </tr>
    );
  },
});

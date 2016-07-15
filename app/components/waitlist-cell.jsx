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
      lastDay: '[Yesterday] [at] HH:mm',
      sameDay: '[Today] [at] HH:mm',
      nextDay: '[Tomorrow] [at] HH:mm',
      lastWeek: 'MM/DD [at] HH:mm',
      nextWeek: 'MM/DD [at] HH:mm',
      sameElse: 'MM/DD [at] HH:mm',
    });

    const waitlistedPosition = this.props.position + 1;

    return (
      <tr>
        <td>
          {this.props.waitlistUser.email}
        </td>
        <td className="text-xs-center">
          {waitlistedDate}
        </td>
        <td className="text-xs-center">
          {waitlistedPosition}
        </td>
      </tr>
    );
  },
});

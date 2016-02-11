// import _ from 'lodash';
import React from 'react';

// Container
import createContainer from './container';

// Components
import WaitlistCell from './waitlist-cell';

export default createContainer(React.createClass({
  displayName: 'Waitlist',

  propTypes: {
    params: React.PropTypes.object,
    history: React.PropTypes.object,
    waitlist: React.PropTypes.object,
  },

  // Render

  getWaitlistCells(waitlistUser, idx) {
    return <WaitlistCell key={idx} position={idx} waitlistUser={waitlistUser} />;
  },

  getWaitlistList() {
    return (
      <table className="table">
        <thead>
          <tr>
            <td>Name</td>
            <td>Email</td>
            <td>Date</td>
            <td>Position</td>
          </tr>
        </thead>
        <tbody>
          {this.props.waitlist.users.map(this.getWaitlistCells)}
        </tbody>
      </table>
    );
  },

  render() {
    return (
      <article>
        <section>
          <div className="row">
            <div className="col-xs-12">
              {this.getWaitlistList()}
            </div>
          </div>
        </section>
      </article>
    );
  },
}), {
  title: 'Waitlist',
  fetchHandler: 'fetchWaitlist',
  storeKey: 'waitlist',
});

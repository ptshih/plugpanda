import React from 'react';

// Container
import createContainer from './container';

// Components
import SessionCell from './session-cell';

export default createContainer(React.createClass({
  displayName: 'Sessions',

  propTypes: {
    params: React.PropTypes.object,
    history: React.PropTypes.object,
    sessions: React.PropTypes.array,
  },

  // Handlers

  // Render

  getSessionCells(session, idx) {
    return <SessionCell key={idx} history={this.props.history} session={session} />;
  },

  getSessionList() {
    const sessions = this.props.sessions;

    return (
      <ul className="SessionList">
        {sessions.map(this.getSessionCells)}
      </ul>
    );
  },

  render() {
    return (
      <section>
        <div className="row">
          <div className="col-xs-12">
            {this.getSessionList()}
          </div>
        </div>
      </section>
    );
  },
}), {
  title: 'Sessions',
  fetchHandler: 'fetchSessions',
  storeKey: 'sessions',
});

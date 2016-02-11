import React from 'react';
import {Link} from 'react-router';

// Components

export default React.createClass({
  displayName: 'Faq',

  // Render

  render() {
    return (
      <div>
        <section>
          <h4>How Plug Panda Works</h4>

          <p className="lead">PlugPanda monitors your ChargePoint charging sessions and automatically stops them for you.</p>
          <div>[IMAGE]</div>

          <br/>

          <p className="lead">Set a configurable threshold for when to stop trickle charging.</p>
          <p>NOTE: If a charging session is free, Plug Panda does not attempt to stop the session prematurely.</p>
          <div>[IMAGE]</div>

          <br/>

          <p className="lead">Keep track of how much money you're saving.</p>
          <div>[IMAGE]</div>
        </section>

        <section>
          <div><Link to="/register">Join the waitlist today!</Link></div>
        </section>
      </div>
    );
  },

});

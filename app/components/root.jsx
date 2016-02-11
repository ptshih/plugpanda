import React from 'react';
import {Link} from 'react-router';

// Components

export default React.createClass({
  displayName: 'Root',

  // Render

  render() {
    return (
      <article>
        <section>
          <h4>What’s wrong with public EV charging today?</h4>

          <p>
            <a href="http://www.chargepoint.com/">ChargePoint</a> is the largest provider of public (paid and free) EV charging stations.
            <br/>
            It's also the most commonly installed EV charging station in apartment and condominium complexes.
          </p>

          <p className="lead">Many ChargePoint stations charge by the hour:</p>

          <ul>
            <li>The rates (often $1-2/hr) are billed as long as the car is connected to the charger.</li>
            <li>Even if the car is fully charged, billing will continue until the session is ended.</li>
            <li>Sessions can currently be ended by physically unplugging the car or by using their mobile app.</li>
          </ul>

          <p className="lead">There are 2 problems with this:</p>
          <div><strong>1. If you forget to unplug your car when it is fully charged, you will continue to be billed.</strong></div>
          <div>This is particularly bad for overnight charging in apartment complexes.</div>

          <br/>

          <div><strong>2. Like smartphones, the charge rate of EVs trickle down as the battery approaches 100%.</strong></div>
          <div>The reduced rate of charging can be as much as 80% slower during the last 5-10%.</div>

          <br/>

          <p>If this sounds like your situation today, <Link to="/faq">read more about how Plug Panda can help!</Link></p>
        </section>
      </article>
    );
  },

});

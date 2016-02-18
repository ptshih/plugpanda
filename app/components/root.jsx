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
          <div className="text-xs-center">
            <h3>What’s wrong with public EV charging today?</h3>
            <div><a href="http://www.chargepoint.com/">ChargePoint</a> is the largest provider of public (paid and free) EV charging stations. It's also the most commonly installed EV charging station in apartment and condominium complexes.</div>
          </div>
        </section>

        <section>
          <div className="text-xs-center">
            <div><strong>However, many ChargePoint stations charge by the hour.</strong></div>
          </div>
        </section>

        <section>
          <div className="text-xs-center">
            <div>The rates (often $1-2/hr) are billed as long as the car is connected to the charger.</div>
            <div>Even if the car is fully charged, billing will continue until the session is ended.</div>
            <div>Sessions can currently be ended by physically unplugging the car or by using their mobile app.</div>
          </div>
        </section>

        <section>
          <div className="text-xs-center">
            <div><strong>So, what seems to be the problem officer?</strong></div>
          </div>
        </section>

        <section>
          <div className="text-xs-center">
            <h4 className="m-b-1">If you forget to unplug your car when it is fully charged, you will continue to be billed.</h4>
            <p className="lead">This is particularly bad for overnight charging in apartment complexes.</p>
            <div><img className="root-img" src="/img/facepalm.jpg"/></div>
          </div>
        </section>

        <section>
          <div className="text-xs-center">
            <h4 className="m-b-1">Like smartphones, the charge rate of EVs trickle down as the battery approaches 100%.</h4>
            <p className="lead">Charging the last 5-10% can account for as much as 1/3 of the total charge time.</p>
            <div><img className="root-img" src="/img/battery.png"/></div>
          </div>
        </section>

        <section>
          <div className="text-xs-center">If this sounds like your situation today, <Link to="/faq">read more about how Plug Panda can help!</Link></div>
        </section>

        <section>
          <div className="text-xs-center">
            <h4 className="m-b-1">Plug Panda plays well with...</h4>
            <div><img className="root-playswell" src="/img/playswell.png"/></div>
          </div>
        </section>

        <section>
          <div className="text-xs-center">
            <div><small className="text-muted">Plug Panda is made by <a href="https://twitter.com/ptshih">Peter Shih</a> & <a href="https://twitter.com/brunoportnoy">Bruno Marinho</a>.</small></div>
            <div><img className="root-dancing-panda" src="/img/dancing-panda.gif"/></div>
          </div>
        </section>
      </article>
    );
  },

});

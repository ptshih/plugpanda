import React from 'react';
import {Link} from 'react-router';

// Store
import store from '../stores/store';

// Components

export default React.createClass({
  displayName: 'Faq',

  componentDidMount() {
    store.dispatch({
      type: 'NAV_TITLE',
      data: 'How It Works',
    });
  },

  componentWillUnmount() {
    store.dispatch({
      type: 'NAV_TITLE',
    });
  },

  // Render

  render() {
    return (
      <article>
        <section className="faq-section">
          <div>
            <div className="macbook pull-lg-right">
              <img src="/img/macbook.png"></img>
              <img className="screen" src="/img/screen-1.png"></img>
            </div>
            <div className="text-xs-center text-lg-left">
              <h2 className="m-b-1">Charging Without the Anxiety</h2>
              <p className="lead">PlugPanda monitors your ChargePoint charging sessions 24/7 and automatically stops them for you.</p>
              <p className="lead">Having range anxiety is bad enough, don't let charging make it worse.</p>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div>
            <div className="macbook pull-lg-left">
              <img src="/img/macbook.png"></img>
              <img className="screen" src="/img/screen-2.png"></img>
            </div>
            <div className="text-xs-center text-lg-left">
              <h2 className="m-b-1">You're In Control</h2>
              <p className="lead">You decide when to stop charging your vehicle.</p>
              <p className="lead">If a charging session is free, Plug Panda does not attempt to stop the session prematurely.</p>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div>
            <div className="macbook pull-lg-right">
              <img src="/img/macbook.png"></img>
              <img className="screen" src="/img/screen-3.png"></img>
            </div>
            <div className="text-xs-center text-lg-left">
              <h2 className="m-b-1">Save Money</h2>
              <p className="lead">Keep track of how much money you've saved by preventing trickle charging.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="text-xs-center"><Link to="/register">Join the waitlist today!</Link></div>
        </section>
      </article>
    );
  },

});

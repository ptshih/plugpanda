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
          <div className="text-xs-center">
            <h3 className="m-b-1">Charging without the anxiety</h3>
            <p className="lead">Plug Panda monitors your charging sessions 24/7 and can stop them for you.</p>
            <div><img className="faq-screenshot" src="/img/sessions.jpg"/></div>
          </div>
        </section>

        <section className="faq-section">
          <div className="text-xs-center">
            <h3 className="m-b-1">You're in control</h3>
            <p className="lead">Plug Panda will notify you when it's time to stop charging your vehicle.</p>
            <p><em>Don't forget to move your vehicle so others can use the charging station!</em></p>
            <div><img className="faq-screenshot" src="/img/session.jpg"/></div>
          </div>
        </section>

        <section className="faq-section">
          <div className="text-xs-center">
            <h3 className="m-b-1">Stay up to date</h3>
            <p className="lead">Keep track of your charging activity – past and present.</p>
            <div><img className="faq-screenshot" src="/img/dashboard.jpg"/></div>
          </div>
        </section>

        <section className="faq-section">
          <div className="text-xs-center">
            <h3 className="m-b-1">BMW i3/i8 driver?</h3>
            <p className="lead">Experience the app BMW should have built.</p>
            <div><img className="faq-screenshot" src="/img/bmw.jpg"/></div>
          </div>
        </section>

        <section className="faq-section">
          <div className="text-xs-center">
            <h3 className="m-b-1">Short on cash?</h3>
            <p className="lead">Plug Panda is completely free to use! <Link to="/register">Join the waitlist today!</Link></p>
          </div>
        </section>
      </article>
    );
  },

});

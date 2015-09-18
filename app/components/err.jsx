import _ from 'lodash';
import React from 'react';

// Components

export default React.createClass({
  displayName: 'Err',

  propTypes: {
    params: React.PropTypes.object,
  },

  // Render

  render() {
    // const code = this.props.err.code || 500;
    const message = _.get(this.props, 'params.message', 'Unknown Error');
    return (
      <article className="Content">
        <div className="Error-heading">We're sorry – something has gone wrong on our end.</div>
        <div className="Error-reason"><strong>Reason:</strong>&nbsp;{message}</div>

        <div className="Error-heading">What could have caused this?</div>
        <ul className="Error-list">
          <li>Something technical went wrong on our site.</li>
          <li>We might have removed the page when we redesigned our website.</li>
          <li>Or the link you clicked might be old and does not work anymore.</li>
          <li>Or you might have accidentally typed the wrong URL in the address bar.</li>
        </ul>

        <div className="Error-heading">What can you do?</div>
        <ul className="Error-list">
          <li>You might try retyping the URL and trying again.</li>
          <li>Or try going back to the <a href="/">home page</a>.</li>
        </ul>

        <br />

        <img src="/img/banksy_panda.png" className="BanksyPanda" />
      </article>
    );
  },
});

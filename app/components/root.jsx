/**
 * This is a Controller/Container View for route: `/`
 */

import React from 'react';

// Components
// import {Link} from 'react-router';

export default React.createClass({
  displayName: 'Root',

  // Render

  render() {
    return (
      <div className="Section">
        <img src="/img/banksy_panda.jpg" className="BanksyPanda" />
      </div>
    );
  },
});

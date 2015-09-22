import React from 'react';

// Components
import Nav from './nav';

export default React.createClass({
  displayName: 'Dashboard',

  // Render

  render() {
    return (
      <div className="Component">
        <Nav title="Dashboard" />
        <main className="Content">
          <img src="/img/banksy_panda.png" className="BanksyPanda" />
        </main>
      </div>
    );
  },

});

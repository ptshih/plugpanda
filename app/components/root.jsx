import React from 'react';

// Components
import Nav from './nav';

export default React.createClass({
  displayName: 'Plug Panda',

  // Render

  render() {
    return (
      <div className="Component">
        <Nav title="Plug Panda" />
        <main className="Content">
          <img src="/img/banksy_panda.png" className="BanksyPanda" />
        </main>
      </div>
    );
  },

});

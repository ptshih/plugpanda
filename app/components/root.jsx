import React from 'react';

// Components
import Nav from './nav';

export default React.createClass({
  displayName: 'Root',

  // Render

  render() {
    return (
      <div className="Component">
        <Nav title="Plug Panda" />
        <main className="Content">
          <section>
            Welcome to Plug Panda!
          </section>
        </main>
      </div>
    );
  },

});

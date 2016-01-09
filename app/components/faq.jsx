import React from 'react';

// Components
import Nav from './nav';

export default React.createClass({
  displayName: 'FAQ',

  // Render

  render() {
    return (
      <div className="Component">
        <Nav title="How It Works" />
        <main className="Content">
          <section>
            Magic!
          </section>
        </main>
      </div>
    );
  },

});

import React from 'react';

// Components
import Nav from './nav';

export default React.createClass({
  displayName: 'Station',

  // Render

  render() {
    return (
      <div className="Component">
        <Nav title="Stations" />
        <main className="Content">
        </main>
      </div>
    );
  },
});

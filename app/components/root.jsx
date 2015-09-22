import React from 'react';

// Components
import Nav from './nav';

export default React.createClass({
  displayName: 'Dashboard',

  // Render

  getContent() {
    return (
      <main className="Content">
        <section>
          Nothing to see here yet...
        </section>
      </main>
    );
  },

  render() {
    return (
      <div className="Component">
        <Nav title="Dashboard" />
        {this.getContent()}
      </div>
    );
  },

});

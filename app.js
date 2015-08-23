import Promise from 'bluebird';

// Router
import React from 'react';
import Router from 'react-router';
import {Route, RouteHandler, DefaultRoute, Link} from 'react-router';

// Components (containers)
import Root from './app/components/root';
import Car from './app/components/car';
import Session from './app/components/session';
import History from './app/components/history';

const App = React.createClass({
  render() {
    return (
      <div className="App">
        <nav className="navbar navbar-light bg-faded">
          <Link to="root" className="navbar-brand">Home</Link>
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <Link to="session" params={{session_id: 'current'}} className="nav-link">Session</Link>
            </li>
            <li className="nav-item">
              <Link to="history" className="nav-link">History</Link>
            </li>
            <li className="nav-item">
              <Link to="car" className="nav-link">Car</Link>
            </li>
          </ul>
        </nav>

        <RouteHandler />
      </div>
    );
  },
});

// Routes
const routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute name="root" handler={Root} />
    <Route name="car" path="car" handler={Car} />
    <Route name="session" path="sessions/:session_id" handler={Session} />
    <Route name="history" path="sessions" handler={History} />
  </Route>
);

// Run Router
Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  // create the promises hash
  const promises = state.routes.filter((route) => {
    // gather up the handlers that have a static `fetch` method
    return route.handler.fetch;
  }).reduce((fns, route) => {
    // reduce to a hash of `key:promise`
    fns[route.name] = route.handler.fetch(state.params, state.query);
    return fns;
  }, {});

  return Promise.props(promises).then(() => {
    React.render(<Handler />, document.getElementById('app'));
  });
});

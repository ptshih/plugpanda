import Promise from 'bluebird';

// Router
import React from 'react';
import Router from 'react-router';
import {Route, RouteHandler, DefaultRoute} from 'react-router';

// Components
import Nav from './app/components/nav';
import Err from './app/components/err';

// Components (containers)
import Root from './app/components/root';
import Car from './app/components/car';
import Session from './app/components/session';
import History from './app/components/history';
import Account from './app/components/account';

// App Layout
const App = React.createClass({
  render() {
    return (
      <div className="App">
        <Nav />
        <RouteHandler />
      </div>
    );
  },
});

// Define Routes
const routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute name="root" handler={Root} />
    <Route name="car" path="car" handler={Car} />
    <Route name="session" path="sessions/:session_id" handler={Session} />
    <Route name="history" path="sessions" handler={History} />
    <Route name="account" path="account" handler={Account} />
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
  }).catch((err) => {
    console.log(err);
    // Render Error
    React.render(<Err err={err}/>, document.getElementById('app'));
  });
});

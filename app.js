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
import Login from './app/components/login';
import Logout from './app/components/logout';
import Register from './app/components/register';

// NProgress loading indicator
import NProgress from 'nprogress';
NProgress.configure({
  showSpinner: false,
});

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
    <DefaultRoute handler={Root} />
    <Route path="car" handler={Car} />
    <Route path="sessions/:session_id" handler={Session} />
    <Route path="sessions" handler={History} />
    <Route path="account" handler={Account} />
    <Route path="login" handler={Login} />
    <Route path="logout" handler={Logout} />
    <Route path="register" handler={Register} />
  </Route>
);

// Run Router
Router.run(routes, Router.HistoryLocation, (Handler, state) => {
  NProgress.start();

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
    NProgress.done();

    React.render(<Handler />, document.getElementById('app'));
  }).catch((err) => {
    console.log(err);
    // Render Error
    React.render(<Err err={err}/>, document.getElementById('app'));
  });
});

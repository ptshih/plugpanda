// Router
import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router';
import {Route, IndexRoute} from 'react-router';
import {createHistory} from 'history';

// Utils
import auth from './app/lib/auth';

// Components
import Err from './app/components/err';

// Components (containers)
import Dashboard from './app/components/dashboard';
import Car from './app/components/car';
import Session from './app/components/session';
import Sessions from './app/components/sessions';
import Account from './app/components/account';
import Login from './app/components/login';
import Logout from './app/components/logout';
import Register from './app/components/register';

// NProgress loading indicator
import NProgress from 'nprogress';
NProgress.configure({
  showSpinner: false,
});

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// App Component
const App = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element,
    ]),
  },

  render() {
    return this.props.children;
  },
});

// Router Lifecycle Hooks

function onEnter(nextState, replaceState, callback) {
  // Check auth
  if (this.requireAuth && !auth.isLoggedIn()) {
    replaceState({
      nextPathname: nextState.location.pathname,
    }, '/login');
  }

  callback();
}

function onEnterNotFound(nextState) {
  nextState.params.message = 'Page Not Found';
}

// function onLeave() {}

// Define Routes
ReactDOM.render((
  <Router history={createHistory()}>
    <Route path="/" component={App}>
      {/* Default */}
      <IndexRoute component={Dashboard} onEnter={onEnter} />

      {/* Routes */}
      <Route path="car" component={Car} onEnter={onEnter} requireAuth />
      <Route path="sessions/:session_id" component={Session} onEnter={onEnter} requireAuth />
      <Route path="sessions" component={Sessions} onEnter={onEnter} requireAuth />
      <Route path="account" component={Account} onEnter={onEnter} requireAuth />
      <Route path="register" component={Register} onEnter={onEnter} />
      <Route path="login" component={Login} onEnter={onEnter} />
      <Route path="logout" component={Logout} onEnter={onEnter} requireAuth />

      {/* Not Found */}
      <Route path="*" component={Err} onEnter={onEnterNotFound} />
    </Route>
  </Router>
), document.getElementById('app'));

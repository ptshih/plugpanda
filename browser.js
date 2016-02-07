// Load Stylesheets
import './scss/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import {createHistory} from 'history';

// Utils
import auth from './app/lib/auth';

// Components
import Router from 'react-router';
import {Route, IndexRoute} from 'react-router';
import Err from './app/components/err';

// Components (containers)
import Root from './app/components/root';
import Faq from './app/components/faq';
import Dashboard from './app/components/dashboard';
import Car from './app/components/car';
import Session from './app/components/session';
import Sessions from './app/components/sessions';
import Account from './app/components/account';
import Waitlist from './app/components/waitlist';
import Login from './app/components/login';
import Logout from './app/components/logout';
import Register from './app/components/register';

// NProgress loading indicator
// import NProgress from 'nprogress';
// NProgress.configure({
//   showSpinner: false,
// });

// TODO: Fetch User features and update local-storage if authed

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

function onEnter(nextState, replaceState, callback) {
  // Already logged in
  if ((!this.path || this.path === 'login') && auth.isLoggedIn()) {
    replaceState(null, '/dashboard');
  }

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

// Define Routes
// https://github.com/rackt/react-router/blob/master/docs/API.md#route
ReactDOM.render((
  <Router history={createHistory()}>
    <Route path="/" component={App}>
      {/* Default */}
      <IndexRoute component={Root} onEnter={onEnter} />

      {/* Routes */}
      <Route path="faq" component={Faq} onEnter={onEnter} />
      <Route path="dashboard" component={Dashboard} onEnter={onEnter} requireAuth />
      <Route path="car" component={Car} onEnter={onEnter} requireAuth />
      <Route path="sessions/:session_id" component={Session} onEnter={onEnter} requireAuth />
      <Route path="sessions" component={Sessions} onEnter={onEnter} requireAuth />
      <Route path="account" component={Account} onEnter={onEnter} requireAuth />
      <Route path="waitlist" component={Waitlist} onEnter={onEnter} requireAuth />
      <Route path="register" component={Register} onEnter={onEnter} />
      <Route path="login" component={Login} onEnter={onEnter} />
      <Route path="logout" component={Logout} onEnter={onEnter} requireAuth />

      {/* Not Found */}
      <Route path="*" component={Err} onEnter={onEnterNotFound} />
    </Route>
  </Router>
), document.getElementById('app'));

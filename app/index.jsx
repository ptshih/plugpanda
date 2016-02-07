// Load Stylesheets with Webpack
import '../scss/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import {createHistory} from 'history';

// Utils
import auth from './lib/auth';

// Components
import Router from 'react-router';
import {Route, IndexRoute} from 'react-router';
import Err from './components/err';
import Nav from './components/nav';

// Components (containers)
import Root from './components/root';
import Faq from './components/faq';
import Dashboard from './components/dashboard';
import Car from './components/car';
import Session from './components/session';
import Sessions from './components/sessions';
import Account from './components/account';
import Waitlist from './components/waitlist';
import Login from './components/login';
import Logout from './components/logout';
import Register from './components/register';

// NProgress loading indicator
// import NProgress from 'nprogress';
// NProgress.configure({
//   showSpinner: false,
// });

// TODO: Fetch User features and update local-storage if authed

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

// App Component
const App = React.createClass({
  propTypes: {
    location: React.PropTypes.object,
    history: React.PropTypes.object,
    children: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element,
    ]),
  },

  render() {
    return (
      <div>
        <Nav
          history={this.props.history}
          location={this.props.location}
        />
        <main className="Content">{this.props.children}</main>
      </div>
    );
  },
});

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

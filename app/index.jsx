// Load Stylesheets with Webpack
import '../scss/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

// Utils
import auth from './lib/auth';

// Components
import Err from './components/err';
import Header from './components/header';

// Components (containers)
import Root from './components/root';
import Faq from './components/faq';
import Dashboard from './components/dashboard';
import Bmw from './components/bmw';
import Session from './components/session';
import Sessions from './components/sessions';
import Account from './components/account';
import Waitlist from './components/waitlist';
import Login from './components/login';
import Logout from './components/logout';
import Register from './components/register';
import ForgotPassword from './components/forgot-password';
import ResetPassword from './components/reset-password';

// NProgress loading indicator
// import NProgress from 'nprogress';
// NProgress.configure({
//   showSpinner: false,
// });

function onEnter(nextState, replace, callback) {
  window.ga('set', 'page', nextState.location.pathname + nextState.location.search);
  window.ga('send', 'pageview');

  // Already logged in
  if ((!this.path || this.path === 'login') && auth.isLoggedIn()) {
    replace('/dashboard');
  }

  // Check auth
  if (this.requireAuth && !auth.isLoggedIn()) {
    replace('/login');
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
        <Header
          location={this.props.location}
        />
        <main role="main" className="main">{this.props.children}</main>
      </div>
    );
  },
});

// Define Routes
// https://github.com/rackt/react-router/blob/master/docs/API.md#route
ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      {/* Default */}
      <IndexRoute component={Root} onEnter={onEnter} />

      {/* Routes */}
      <Route path="faq" component={Faq} onEnter={onEnter} />
      <Route path="dashboard" component={Dashboard} onEnter={onEnter} requireAuth />
      <Route path="bmw" component={Bmw} onEnter={onEnter} requireAuth />
      <Route path="sessions/:session_id" component={Session} onEnter={onEnter} requireAuth />
      <Route path="sessions" component={Sessions} onEnter={onEnter} requireAuth />
      <Route path="account" component={Account} onEnter={onEnter} requireAuth />
      <Route path="waitlist" component={Waitlist} onEnter={onEnter} requireAuth />
      <Route path="register" component={Register} onEnter={onEnter} />
      <Route path="login" component={Login} onEnter={onEnter} />
      <Route path="logout" component={Logout} onEnter={onEnter} requireAuth />
      <Route path="forgot_password" component={ForgotPassword} onEnter={onEnter} />
      <Route path="reset_password" component={ResetPassword} onEnter={onEnter} />

      {/* Not Found */}
      <Route path="*" component={Err} onEnter={onEnterNotFound} />
    </Route>
  </Router>
), document.getElementById('app'));

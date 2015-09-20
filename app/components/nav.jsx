import React from 'react';
import {Link, History} from 'react-router';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Nav',

  propTypes: {
    title: React.PropTypes.string,
    enableBack: React.PropTypes.bool,
  },

  mixins: [History],

  getInitialState() {
    return {
      title: 'Plug Panda',
      enableBack: false,
      collapse: true,
    };
  },

  componentWillMount() {
    this.setState({
      title: this.props.title,
      enableBack: this.props.enableBack,
      collapse: true,
    });
  },

  componentWillReceiveProps(nextProps) {
    // Reset collapse state when changing routes
    this.setState({
      title: nextProps.title,
      enableBack: nextProps.enableBack,
      collapse: true,
    });
  },

  // Handlers

  onClickCollapse(e) {
    e.preventDefault();

    this.setState({
      collapse: !this.state.collapse,
    });
  },

  // Render

  getCar() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/car">Car</Link>
    );
  },

  getSession() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/sessions/current">Session</Link>
    );
  },

  getHistory() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/sessions">History</Link>
    );
  },

  getAccount() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/account">Account</Link>
    );
  },

  getLogin() {
    if (auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/login">Sign In</Link>
    );
  },

  getLogo() {
    if (this.state.enableBack) {
      return <div className="Logo-back" onClick={() => this.history.goBack()} />;
    }

    return <Link className="Logo-home" to="/" />;
  },

  render() {
    const navbarClassName = ['Navbar', 'collapse', !this.state.collapse ? 'in' : ''].join(' ');

    return (
      <header className="Header">
        <div className="Nav">
          <figure className="Logo pull-left">
            {this.getLogo()}
          </figure>

          <div className="Nav-title">{this.state.title}</div>

          <figure className="Hamburger navbar-toggler pull-right" onClick={this.onClickCollapse}>
            <div className="Hamburger-menu">☰</div>
          </figure>
        </div>

        <div className={navbarClassName}>
          {this.getCar()}
          {this.getSession()}
          {this.getHistory()}
          {this.getAccount()}
          {this.getLogin()}
        </div>
      </header>
    );
  },
});

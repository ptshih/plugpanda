import React from 'react';
import {Link, History} from 'react-router';

// Utils
import auth from '../lib/auth';

export default React.createClass({
  displayName: 'Nav',

  propTypes: {
    title: React.PropTypes.string,
    parentPath: React.PropTypes.string,
  },

  mixins: [History],

  getInitialState() {
    return {
      title: 'Plug Panda',
      parentPath: null,
      collapse: true,
    };
  },

  componentWillMount() {
    this.setState({
      title: this.props.title,
      parentPath: this.props.parentPath,
      collapse: true,
    });
  },

  componentWillReceiveProps(nextProps) {
    // Reset collapse state when changing routes
    this.setState({
      title: nextProps.title,
      parentPath: nextProps.parentPath,
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

  getDashboard() {
    if (!auth.isLoggedIn()) {
      return null;
    }

    return (
      <Link className="Navbar-link" to="/">Dashboard</Link>
    );
  },

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

  goBack() {
    this.history.pushState(null, this.props.parentPath)
  },

  getHamburger() {
    if (this.state.parentPath) {
      return <div className="Hamburger-back" onClick={this.goBack} />;
    }

    return <div className="Hamburger-menu">☰</div>;
  },

  render() {
    const navbarClassName = ['Navbar', 'collapse', !this.state.collapse ? 'in' : ''].join(' ');

    return (
      <header className="Header">
        <nav className="Nav">
          <figure className="Hamburger navbar-toggler pull-left" onClick={this.onClickCollapse}>
            {this.getHamburger()}
          </figure>

          <div className="Nav-title">{this.state.title}</div>
        </nav>

        <div className={navbarClassName}>
          {this.getDashboard()}
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

import _ from 'lodash';
import React from 'react';
import {Link, State} from 'react-router';

export default React.createClass({
  displayName: 'NavLink',

  propTypes: {
    to: React.PropTypes.string.isRequired,
    children: React.PropTypes.string.isRequired,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
  },

  mixins: [State],

  getDefaultProps() {
    return {
    };
  },

  // Render

  render() {
    const props = _.omit(this.props, ['className']);
    const isActive = this.isActive(this.props.to);
    const className = ['nav-link', isActive ? 'active' : ''].join(' ');

    return (
      <Link {...props} className={className}>{this.props.children}</Link>
    );
  },

  // Private

});

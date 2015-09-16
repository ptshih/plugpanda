import _ from 'lodash';
import React from 'react';
import {Link, State} from 'react-router';

export default React.createClass({
  displayName: 'NavLink',

  propTypes: {
    className: React.PropTypes.string,
    to: React.PropTypes.string.isRequired,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
    children: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element,
    ]),
  },

  mixins: [State],

  getDefaultProps() {
    return {
    };
  },

  // Render

  render() {
    const props = _.omit(this.props, ['className']);

    const baseTo = this.props.to.split('/');
    baseTo.shift();
    const basePathname = this.getPathname().split('/');
    basePathname.shift();
    const isActive = baseTo.length === basePathname.length && _.first(baseTo) === _.first(basePathname);

    const className = ['nav-item', 'nav-link', this.props.className,  isActive ? 'active' : ''].join(' ');

    return (
      <Link {...props} className={className}>{this.props.children}</Link>
    );
  },
});

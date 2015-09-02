import _ from 'lodash';
import React from 'react';

export default React.createClass({
  displayName: 'InputText',

  propTypes: {
    id: React.PropTypes.string,
    className: React.PropTypes.string,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    placeholder: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func,

    prefix: React.PropTypes.string,
    property: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      placeholder: '',
      disabled: false,
    };
  },

  // Render

  render() {
    const className = ['form-control', this.props.className].join(' ').trim();
    const props = _.omit(this.props, ['className', 'children', 'prefix', 'property']);

    return (
      <input
        type="text"
        className={className}
        data-prefix={this.props.prefix}
        data-property={this.props.property}
        {...props}
      />
    );
  },
});

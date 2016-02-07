import _ from 'lodash';
import React from 'react';

export default React.createClass({
  displayName: 'Select',

  propTypes: {
    id: React.PropTypes.string,
    className: React.PropTypes.string,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    options: React.PropTypes.array,
    disabled: React.PropTypes.bool,
    valueKey: React.PropTypes.string,
    labelKey: React.PropTypes.string,
    onChange: React.PropTypes.func,

    children: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element,
    ]),
  },

  getDefaultProps() {
    return {
      options: [],
      disabled: false,
      valueKey: 'value',
      labelKey: 'label',
    };
  },

  // Render

  getOptions() {
    const options = this.props.options;
    const valueKey = this.props.valueKey;
    const labelKey = this.props.labelKey;

    return options.map((option, index) => {
      return (
        <option key={index} value={option[valueKey]}>
          {option[labelKey]}
        </option>
      );
    });
  },

  render() {
    const className = ['Select', 'form-control', this.props.className].join(' ').trim();
    const props = _.omit(this.props, ['className', 'children']);

    return (
      <select className={className} {...props}>
        {this.props.children}
        {this.getOptions()}
      </select>
    );
  },
});

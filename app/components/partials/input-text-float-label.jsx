import _ from 'lodash';
import React from 'react';

import InputText from './input-text';

export default React.createClass({
  displayName: 'InputTextFloatLabel',

  propTypes: {
    type: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    value: React.PropTypes.string,
    prefix: React.PropTypes.string,
    property: React.PropTypes.string,
    alwaysOn: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
  },

  getInitialState() {
    return {
      on: false,
      alwaysOn: false,
    };
  },

  // Initial props (called once on initial render)
  componentWillMount() {
    this.setState({
      on: this.props.alwaysOn || !!this.props.value,
    });
  },

  // Updated props (not called on initial render)
  componentWillReceiveProps(nextProps) {
    this.setState({
      on: nextProps.alwaysOn || !!nextProps.value,
    });
  },

  // Handlers

  onChange(event) {
    // Bubble Up
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },

  onFocus(event) {
    // Bubble Up
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }

    this.setState({
      on: true,
    });
  },

  onBlur(event) {
    // Bubble Up
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }

    this.setState({
      on: this.props.alwaysOn || !!event.target.value,
    });
  },

  // Render

  render() {
    const className = ['FloatLabel', this.props.className].join(' ').trim();
    const props = _.omit(this.props, ['placeholder', 'className']);

    // Label Class
    const labelClasses = ['FloatLabel-label'];
    if (this.state.on) {
      labelClasses.push('FloatLabel-label--on');
    }
    const labelClassName = labelClasses.join(' ').trim();

    // Border Class
    const borderClasses = ['FloatLabel-border'];
    if (this.state.on) {
      borderClasses.push('FloatLabel-border--on');
    }
    const borderClassName = borderClasses.join(' ').trim();

    return (
      <div className={className}>
        <label
          className={labelClassName}
        >
          <div className={borderClassName} />
          {props.label}
        </label>
        <InputText
          {...props}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
      </div>
    );
  },
});

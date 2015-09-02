import _ from 'lodash';
import React from 'react';

import InputText from './input-text';

export default React.createClass({
  displayName: 'InputTextFloatLabel',

  propTypes: {
    id: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    value: React.PropTypes.string,
    prefix: React.PropTypes.string,
    property: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
  },

  getInitialState() {
    return {};
  },

  // Initial props (called once on initial render)
  componentWillMount() {
    this.setState({
      className: this.props.value ? 'FloatLabel-label--on' : '',
    });
  },

  // Updated props (not called on initial render)
  componentWillReceiveProps(nextProps) {
    this.setState({
      className: nextProps.value ? 'FloatLabel-label--on' : '',
    });
  },

  // Handlers

  onChange(e) {
    // Bubble Up
    if (this.props.onChange) {
      this.props.onChange(e);
    }

    if (e.target === document.activeElement) {
      this.setState({className: 'FloatLabel-label--on'});
    } else if (e.target.value !== '') {
      this.setState({className: 'FloatLabel-label--on'});
    } else {
      this.setState({className: ''});
    }
  },

  onFocus(e) {
    // Bubble Up
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }

    this.setState({className: 'FloatLabel-label--on'});
  },

  onBlur(e) {
    // Bubble Up
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }

    if (e.target.value !== '') {
      this.setState({className: 'FloatLabel-label--on'});
    } else {
      this.setState({className: ''});
    }
  },

  // Render

  render() {
    const className = ['FloatLabel', this.props.className].join(' ').trim();
    const props = _.omit(this.props, ['placeholder', 'className']);

    const labelClasses = ['FloatLabel-label', this.state.className];
    if (this.props.disabled) {
      labelClasses.push('FloatLabel-label--disabled');
    }
    const labelClassName = labelClasses.join(' ').trim();

    return (
      <div className={className}>
        <label
          htmlFor={props.id}
          className={labelClassName}
        >
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

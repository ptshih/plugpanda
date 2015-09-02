import _ from 'lodash';
import React from 'react';

import Select from './select';

export default React.createClass({
  displayName: 'SelectFloatLabel',

  propTypes: {
    id: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
  },

  // Render

  render() {
    const className = ['FloatLabel', this.props.className].join(' ').trim();
    const props = _.omit(this.props, ['className']);

    const labelClasses = ['FloatLabel-label', 'FloatLabel-label--on'];
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
        <Select {...props} />
      </div>
    );
  },
});

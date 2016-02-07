import _ from 'lodash';
import React from 'react';

import Select from './select';

export default React.createClass({
  displayName: 'SelectFloatLabel',

  propTypes: {
    label: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
  },

  // Render

  render() {
    const className = ['FloatLabel', this.props.className].join(' ').trim();
    const props = _.omit(this.props, ['className']);

    // Label Class
    const labelClasses = ['FloatLabel-label', 'FloatLabel-label--on'];
    const labelClassName = labelClasses.join(' ').trim();

    // Border Class
    const borderClasses = ['FloatLabel-border', 'FloatLabel-border--on'];
    const borderClassName = borderClasses.join(' ').trim();

    return (
      <div className={className}>
        <label
          className={labelClassName}
        >
          <div className={borderClassName} />
          {props.label}
        </label>
        <Select {...props} />
      </div>
    );
  },
});

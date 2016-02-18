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
    const className = ['float-label', this.props.className].join(' ').trim();
    const props = _.omit(this.props, ['className']);

    // Label Class
    const labelClasses = ['float-label__label', 'float-label__label--on'];
    const labelClassName = labelClasses.join(' ').trim();

    // Border Class
    const borderClasses = ['float-label__border', 'float-label__border--on'];
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

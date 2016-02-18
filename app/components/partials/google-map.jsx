import React from 'react';

export default React.createClass({
  displayName: 'GoogleMap',

  propTypes: {
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
    zoom: React.PropTypes.number,
  },

  getDefaultProps() {
    return {
      zoom: 16,
    };
  },

  // Render

  render() {
    const style = {
      backgroundImage: `url('${this._buildStaticMap()}')`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      height: '100%',
      width: '100%',
    };

    return (
      <div style={style}></div>
    );
  },

  // Private

  _buildStaticMap() {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${this.props.lat},${this.props.lon}&zoom=${this.props.zoom}&size=640x320&scale=2&markers=${this.props.lat},${this.props.lon}`;
  },

  _buildLink() {
    return `https://maps.google.com?q=${this.props.lat},${this.props.lon}`;
  },
});

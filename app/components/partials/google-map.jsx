import React from 'react';

export default React.createClass({
  displayName: 'GoogleMap',

  propTypes: {
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
    zoom: React.PropTypes.number,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
  },

  getDefaultProps() {
    return {
      zoom: 16,
      width: 640,
      height: 240,
    };
  },

  // Render

  render() {
    return (
      <img className="GoogleMap" src={this._buildStaticMap()} />
    );
  },

  // Private

  _buildStaticMap() {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${this.props.lat},${this.props.lon}&zoom=${this.props.zoom}&size=${this.props.width}x${this.props.height}&markers=${this.props.lat},${this.props.lon}`;
  },

  _buildLink() {
    return `https://maps.google.com?q=${this.props.lat},${this.props.lon}`;
  },
});
